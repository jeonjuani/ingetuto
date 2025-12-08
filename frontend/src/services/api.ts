import { axiosInstance } from './axiosConfig';

export const api = {
  async logout(token: string): Promise<void> {
    await axiosInstance.post('/api/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

