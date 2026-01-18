"""3-stage LLM Council orchestration with Political Steering."""
from typing import List, Dict, Any, Tuple
import asyncio
import httpx
from openrouter import query_model, query_models_parallel
from config import COUNCIL_CONFIG, COUNCIL_MODELS, CHAIRMAN_MODEL, POLITICAL_RUBRIC, EMBEDDING_MODEL, OPENROUTER_API_KEY

async def stage1_collect_responses(instagram_data: str) -> List[Dict[str, Any]]:
    """Stage 1: Collect responses using steered personas."""
    
    tasks = []
    for model, persona in COUNCIL_CONFIG.items():
        # Personalizing the system prompt for each 'Council Member'
        system_prompt = f"""You are a political analyst with a {persona} perspective. 
        Your goal is to evaluate Instagram content according to this rubric:
        {POLITICAL_RUBRIC}
        
        Be objective about your specific lens. Do not hide your perspective; 
        rather, use it to highlight elements of the post others might miss."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this Instagram Post data:\n{instagram_data}"}
        ]
        # We query models one by one here to allow for unique system prompts
        tasks.append(query_model(model, messages))

    # Wait for all experts to finish
    raw_responses = await asyncio.gather(*tasks)

    stage1_results = []
    for i, model in enumerate(COUNCIL_MODELS):
        if raw_responses[i]:
            stage1_results.append({
                "model": model,
                "persona": COUNCIL_CONFIG[model],
                "response": raw_responses[i].get('content', '')
            })
    return stage1_results


async def stage2_collect_rankings(
    user_query: str,
    stage1_results: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    """
    Stage 2: Each model ranks the anonymized responses.

    Args:
        user_query: The original user query
        stage1_results: Results from Stage 1

    Returns:
        Tuple of (rankings list, label_to_model mapping)
    """
    # Create anonymized labels for responses (Response A, Response B, etc.)
    labels = [chr(65 + i) for i in range(len(stage1_results))]  # A, B, C, ...

    # Create mapping from label to model name
    label_to_model = {
        f"Response {label}": result['model']
        for label, result in zip(labels, stage1_results)
    }

    # Build the ranking prompt
    responses_text = "\n\n".join([
        f"Response {label}:\n{result['response']}"
        for label, result in zip(labels, stage1_results)
    ])

    ranking_prompt = f"""You are evaluating different responses to the following question:

Question: {user_query}

Here are the responses from different models (anonymized):

{responses_text}

Your task:
1. First, evaluate each response individually. For each response, explain what it does well and what it does poorly.
2. Then, at the very end of your response, provide a final ranking.

IMPORTANT: Your final ranking MUST be formatted EXACTLY as follows:
- Start with the line "FINAL RANKING:" (all caps, with colon)
- Then list the responses from best to worst as a numbered list
- Each line should be: number, period, space, then ONLY the response label (e.g., "1. Response A")
- Do not add any other text or explanations in the ranking section

Example of the correct format for your ENTIRE response:

Response A provides good detail on X but misses Y...
Response B is accurate but lacks depth on Z...
Response C offers the most comprehensive answer...

FINAL RANKING:
1. Response C
2. Response A
3. Response B

Now provide your evaluation and ranking:"""

    messages = [{"role": "user", "content": ranking_prompt}]

    # Get rankings from all council models in parallel
    responses = await query_models_parallel(COUNCIL_MODELS, messages)

    # Format results
    stage2_results = []
    for model, response in responses.items():
        if response is not None:
            full_text = response.get('content', '')
            parsed = parse_ranking_from_text(full_text)
            stage2_results.append({
                "model": model,
                "ranking": full_text,
                "parsed_ranking": parsed
            })

    return stage2_results, label_to_model


async def stage3_synthesize_final(
    user_query: str,
    stage1_results: List[Dict[str, Any]],
    stage2_results: List[Dict[str, Any]]
) -> Dict[str, Any]:
    
    # 1. Format the data into readable strings
    stage1_text = "\n\n".join([
        f"EXPERT ANALYSIS ({result['model']}):\n{result['response']}"
        for result in stage1_results
    ])

    stage2_text = "\n\n".join([
        f"EXPERT RANKING ({result['model']}):\n{result['ranking']}"
        for result in stage2_results
    ])

    # 2. Update the prompt to include the actual context
    chairman_prompt = f"""You are the Council Chairman. 
Your task is to synthesize 4 expert analyses of the following post into one consensus report.

ORIGINAL POST CONTENT:
"{user_query}"

--- EXPERT ANALYSES ---
{stage1_text}

--- CROSS-EXAMINATION RANKINGS ---
{stage2_text}

STRICT FORMATTING RULES:
1. HEADER: One final classification (e.g., # Classification: LEAN RIGHT).
2. SUMMARY: One paragraph (max 60 words) explaining the 'Why'.
3. EVIDENCE: 3-4 bullet points of the most critical evidence.
4. WORD LIMIT: Total output must be under 200 words.
5. NO FLUFF.
"""

    # 3. Ensure the message actually contains the prompt
    messages = [{"role": "user", "content": chairman_prompt}]

    response = await query_model(CHAIRMAN_MODEL, messages)

    if response is None:
        # Fallback if chairman fails
        return {
            "model": CHAIRMAN_MODEL,
            "response": "Error: Unable to generate final synthesis."
        }

    return {
        "model": CHAIRMAN_MODEL,
        "response": response.get('content', '')
    }

async def generate_bias_embedding(text: str) -> List[float]:
    """Converts the Council's final report into a vector."""
    messages = [{"role": "user", "content": text}]
    
    # OpenRouter handles embedding calls through the same completion endpoint 
    # for most models, but ensure you follow their specific embedding format
    payload = {
        "model": EMBEDDING_MODEL,
        "input": text
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/embeddings", # Note the /embeddings endpoint
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json=payload
        )
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]


def parse_ranking_from_text(ranking_text: str) -> List[str]:
    """
    Parse the FINAL RANKING section from the model's response.

    Args:
        ranking_text: The full text response from the model

    Returns:
        List of response labels in ranked order
    """
    import re

    # Look for "FINAL RANKING:" section
    if "FINAL RANKING:" in ranking_text:
        # Extract everything after "FINAL RANKING:"
        parts = ranking_text.split("FINAL RANKING:")
        if len(parts) >= 2:
            ranking_section = parts[1]
            # Try to extract numbered list format (e.g., "1. Response A")
            # This pattern looks for: number, period, optional space, "Response X"
            numbered_matches = re.findall(r'\d+\.\s*Response [A-Z]', ranking_section)
            if numbered_matches:
                # Extract just the "Response X" part
                return [re.search(r'Response [A-Z]', m).group() for m in numbered_matches]

            # Fallback: Extract all "Response X" patterns in order
            matches = re.findall(r'Response [A-Z]', ranking_section)
            return matches

    # Fallback: try to find any "Response X" patterns in order
    matches = re.findall(r'Response [A-Z]', ranking_text)
    return matches


def calculate_aggregate_rankings(
    stage2_results: List[Dict[str, Any]],
    label_to_model: Dict[str, str]
) -> List[Dict[str, Any]]:
    """
    Calculate aggregate rankings across all models.

    Args:
        stage2_results: Rankings from each model
        label_to_model: Mapping from anonymous labels to model names

    Returns:
        List of dicts with model name and average rank, sorted best to worst
    """
    from collections import defaultdict

    # Track positions for each model
    model_positions = defaultdict(list)

    for ranking in stage2_results:
        ranking_text = ranking['ranking']

        # Parse the ranking from the structured format
        parsed_ranking = parse_ranking_from_text(ranking_text)

        for position, label in enumerate(parsed_ranking, start=1):
            if label in label_to_model:
                model_name = label_to_model[label]
                model_positions[model_name].append(position)

    # Calculate average position for each model
    aggregate = []
    for model, positions in model_positions.items():
        if positions:
            avg_rank = sum(positions) / len(positions)
            aggregate.append({
                "model": model,
                "average_rank": round(avg_rank, 2),
                "rankings_count": len(positions)
            })

    # Sort by average rank (lower is better)
    aggregate.sort(key=lambda x: x['average_rank'])

    return aggregate


async def generate_conversation_title(user_query: str) -> str:
    """
    Generate a short title for a conversation based on the first user message.

    Args:
        user_query: The first user message

    Returns:
        A short title (3-5 words)
    """
    title_prompt = f"""Generate a very short title (3-5 words maximum) that summarizes the following question.
The title should be concise and descriptive. Do not use quotes or punctuation in the title.

Question: {user_query}

Title:"""

    messages = [{"role": "user", "content": title_prompt}]

    # Use gemini-2.5-flash for title generation (fast and cheap)
    response = await query_model("google/gemini-2.5-flash", messages, timeout=30.0)

    if response is None:
        # Fallback to a generic title
        return "New Conversation"

    title = response.get('content', 'New Conversation').strip()

    # Clean up the title - remove quotes, limit length
    title = title.strip('"\'')

    # Truncate if too long
    if len(title) > 50:
        title = title[:47] + "..."

    return title


async def run_full_council(user_query: str) -> Tuple[List, List, Dict, Dict]:
    """
    Run the complete 3-stage council process.

    Args:
        user_query: The user's question

    Returns:
        Tuple of (stage1_results, stage2_results, stage3_result, metadata)
    """
    # Stage 1: Collect individual responses
    stage1_results = await stage1_collect_responses(user_query)

    # If no models responded successfully, return error
    if not stage1_results:
        return [], [], {
            "model": "error",
            "response": "All models failed to respond. Please try again."
        }, {}

    # Stage 2: Collect rankings
    stage2_results, label_to_model = await stage2_collect_rankings(user_query, stage1_results)

    # Calculate aggregate rankings
    aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)

    # Stage 3: Synthesize final answer
    stage3_result = await stage3_synthesize_final(
        user_query,
        stage1_results,
        stage2_results
    )

    # NEW: Generate Bias Embedding from the final report
    # We embed the Stage 3 text because it contains the distilled ideological 'flavor'
    bias_vector = await generate_bias_embedding(stage3_result["response"])

    # Metadata now includes the vector for MongoDB
    metadata = {
        "model_count": len(stage1_results),
        "bias_embedding": bias_vector,  # This goes into your 'embedding' field in Mongo
        "classification": stage3_result.get("classification")
    }
    return stage1_results, stage2_results, stage3_result, metadata