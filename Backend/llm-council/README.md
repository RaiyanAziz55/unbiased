🔐 Authentication Endpoints
Sign Up
Creates a new user account with a hashed password.

Method: POST

Endpoint: /api/signup

Request Body:

JSON

{
  "username": "raiyan_user",
  "password": "securepassword123"
}
Response:

JSON

{
  "message": "User created successfully",
  "user_id": "65a7f1..." 
}
Login
Authenticates a user and returns their unique MongoDB User ID.

Method: POST

Endpoint: /api/login

Request Body:

JSON

{
  "username": "raiyan_user",
  "password": "securepassword123"
}
Response:

JSON

{
  "message": "Login successful",
  "user_id": "65a7f1...",
  "username": "raiyan_user"
}
🎙️ Analysis & Conversations

Method: POST

Endpoint: /api/conversations/{conversation_id}/message

Request Body:

JSON

{
  "user_id": "65a7f1...",
  "url": "https://www.instagram.com/reel/DStEiWBgAQf/"
}
Response:

JSON

{
  "stage1": [...],
  "stage2": [...],
  "stage3": { "response": "# Classification: LEAN RIGHT..." },
  "metadata": { "bias_embedding": [...] }
}
📊 User Data & History
Get User History
Retrieves all social media posts analyzed by a specific user for their dashboard.

Method: GET

Endpoint: /api/users/{user_id}/posts

Response:

JSON

{
  "user_id": "65a7f1...",
  "total_posts": 12,
  "posts": [ { ...post_data... } ]
}
Get Single Post Details
Fetches the full analysis document (scraped data + AI verdict) for a specific post.

Method: GET

Endpoint: /api/posts/{post_id}

Response: The full JSON document from the analyses collection.

🔍 Discovery & Similarity
Find Similar Bias (Vector Search)
Uses Atlas Vector Search to find posts that share a similar ideological profile.

Method: POST

Endpoint: /api/posts/similar

Request Body:

JSON

{
  "embedding": [0.12, -0.05, ...],
  "limit": 5
}
Response: A list of the top 5 most ideologically similar posts with their similarity scores.