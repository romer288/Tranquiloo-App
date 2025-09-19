// Intervention summary service - migrated from Supabase to new API endpoints

export const interventionSummaryService = {
  async getUserSummaries() {
    try {
      // Get current user from auth service
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        return []; // Return empty array if not authenticated
      }
      
      const user = JSON.parse(authUser);
      return await this.getInterventionSummariesByUser(user.id);
    } catch (error) {
      console.error('Error fetching user summaries:', error);
      return []; // Return empty array on error
    }
  },

  async getInterventionSummariesByUser(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/intervention-summaries`);
      if (!response.ok) {
        throw new Error('Failed to fetch intervention summaries');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching intervention summaries:', error);
      throw error;
    }
  },

  async createInterventionSummary(summary: any) {
    try {
      // Use the anxiety-analyses endpoint for intervention summaries
      const response = await fetch('/api/anxiety-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summary)
      });

      if (!response.ok) {
        throw new Error('Failed to create intervention summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating intervention summary:', error);
      throw error;
    }
  }
};