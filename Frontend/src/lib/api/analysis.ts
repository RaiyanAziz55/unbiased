const API_BASE_URL = 'http://localhost:8001';

export interface AnalysisResponse {
  stage1: any[];
  stage2: any[];
  stage3: {
    response: string;
  };
  metadata: {
    bias_embedding?: number[];
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  title: string;
  messages: any[];
}

export const analysisApi = {
  async createConversation(): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return response.json();
  },

  async analyzeUrl(conversationId: string, userId: string, url: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    return response.json();
  },

  async getUserPosts(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/posts`);

    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }

    return response.json();
  },

  async getPost(postId: string) {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  },
};
