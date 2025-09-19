// Therapist data service - migrated from Supabase to new API endpoints

export const therapistDataService = {
  // Static helper methods for UI
  getCommonInsuranceTypes() {
    return [
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'UnitedHealth',
      'Humana',
      'Medicare',
      'Medicaid'
    ];
  },

  getAnxietySpecialties() {
    return [
      'Generalized Anxiety Disorder',
      'Panic Disorder', 
      'Social Anxiety',
      'PTSD',
      'OCD',
      'Phobias'
    ];
  },

  async searchCachedTherapists(params: any) {
    try {
      // For now, return a placeholder response
      // In a full implementation, this would search the cached therapist database
      return {
        success: true,
        data: [], // Empty for now since we don't have therapist data yet
        error: null
      };
    } catch (error) {
      console.error('Error searching therapists:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to search therapists'
      };
    }
  },
  async findTherapists(city: string, state: string, specialty?: string) {
    try {
      const params = new URLSearchParams({ city, state });
      if (specialty) params.append('specialty', specialty);
      
      const response = await fetch(`/api/therapists?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch therapists');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching therapists:', error);
      throw error;
    }
  },

  async createTherapist(therapist: any) {
    try {
      const response = await fetch('/api/therapists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(therapist)
      });

      if (!response.ok) {
        throw new Error('Failed to create therapist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating therapist:', error);
      throw error;
    }
  },

  async getUserTherapists(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}/therapists`);
      if (!response.ok) {
        throw new Error('Failed to fetch user therapists');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user therapists:', error);
      throw error;
    }
  },

  async linkUserToTherapist(userTherapist: any) {
    try {
      const response = await fetch('/api/user-therapists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userTherapist)
      });

      if (!response.ok) {
        throw new Error('Failed to link user to therapist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error linking user to therapist:', error);
      throw error;
    }
  }
};