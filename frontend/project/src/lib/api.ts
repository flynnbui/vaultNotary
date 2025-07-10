const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get access token from Auth0
    const accessToken = await this.getAccessToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      // This will only work on the client side or in API routes
      if (typeof window !== 'undefined') {
        // Client-side: get token from Auth0
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const { accessToken } = await response.json();
          return accessToken;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Customer endpoints
  async getCustomers(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async lookupCustomerByIdentity(identity: string) {
    return this.request(`/customers/lookup/identity/${identity}`);
  }

  async lookupCustomerByPhone(phone: string) {
    return this.request(`/customers/lookup/phone/${phone}`);
  }

  // File endpoints
  async getFiles(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request(`/files${query ? `?${query}` : ''}`);
  }

  async getFile(id: string) {
    return this.request(`/files/${id}`);
  }

  async createFile(data: any) {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFile(id: string, data: any) {
    return this.request(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFile(id: string) {
    return this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Search endpoint
  async search(data: { identity?: string; fileNo?: string }) {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Document upload
  async uploadDocuments(formData: FormData) {
    const accessToken = await this.getAccessToken();
    
    return fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  // Statistics
  async getStatistics() {
    return this.request('/statistics');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();