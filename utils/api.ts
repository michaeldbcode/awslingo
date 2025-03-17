// utils/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.error('API_BASE_URL is not defined. Please check your .env.local file.');
}

export async function validateUsername(username: string): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('Attempting to validate username at:', `${API_BASE_URL}/validate-user`);
    
    const response = await fetch(`${API_BASE_URL}/validate-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { valid: false, error: data.error };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating username:', error);
    return { valid: false, error: 'Failed to validate username' };
  }
}

export async function submitQuizResult(result: {
  username: string;
  correctAnswers: number;
  totalTime: number;
}): Promise<boolean> {
  try {
    console.log('Attempting to submit quiz result at:', `${API_BASE_URL}/submit-quiz`);
    
    const response = await fetch(`${API_BASE_URL}/submit-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      console.error('Server returned:', await response.text());
      throw new Error('Failed to submit quiz result');
    }

    return true;
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    return false;
  }
}

export async function getLeaderboard(): Promise<Array<{
  username: string;
  score: number;
  completion_time: number;
}>> {
  try {
    console.log('Attempting to fetch leaderboard at:', `${API_BASE_URL}/leaderboard`);
    
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    
    if (!response.ok) {
      console.error('Server returned:', await response.text());
      throw new Error('Failed to fetch leaderboard');
    }

    const data = await response.json();
    if (!data.leaderboard) {
      console.error('Unexpected response format:', data);
      return [];
    }

    return data.leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}