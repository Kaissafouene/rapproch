const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL); // Pour debug

export interface UploadResponse {
  uploadId: string;
  filename: string;
  rowsCount: number;
  preview?: any[];
}

export interface ReconcileResponse {
  jobId: string;
  status: string;
}

export interface MatchesResponse {
  jobId: string;
  summary: {
    bankTotal: number;
    accountingTotal: number;
    matchedCount: number;
    suspenseCount: number;
    initialGap: number;
    residualGap: number;
    coverageRatio: number;
    openingBalance: number;
    aiAssistedMatches?: number;
  };
  matches: Array<{
    id: string;
    bankTx: any;
    accountingTx?: any;
    accountingTxs?: any[];
    score: number;
    rule: string;
    status: string;
    reconId?: string;
    aiConfidence?: number;
  }>;
  suspense?: Array<{
    transaction: any;
    type: string;
    reason: string;
    suggestedCategory?: string;
    aiConfidence?: number;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  constructor() {
    this.API_BASE_URL = API_BASE_URL;
    console.log('ApiService initialized with URL:', this.API_BASE_URL);
  }

  private getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('auth_token');
    const headers = new Headers();
    
    if (contentType) {
      headers.append('Content-Type', contentType);
    }
    
    headers.append('Accept', 'application/json');
    
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private async handleResponse(response) {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }
    
    try {
      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (e) {
      console.warn('Response was not JSON, returning empty object');
      return {};
    }
  }

  private async makeRequest(url, options = {}) {
    const defaultOptions = {
      mode: 'cors',
      credentials: 'include',
      headers: this.getAuthHeaders(),
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    console.log(`Making request to: ${url}`, finalOptions);
    
    try {
      const response = await fetch(url, finalOptions);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Request failed to ${url}:`, error);
      
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to server. Please check:
          1. The server at ${this.API_BASE_URL} is running
          2. Your internet connection is working
          3. There are no CORS issues (check browser console)`);
      }
      
      throw error;
    }
  }

  // Test methods
  async testConnection() {
    console.log('Testing connection to:', `${this.API_BASE_URL}/health`);
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Connection test result:', data);
      return data;
    } catch (error) {
      console.error('Connection test failed:', error);
      
      // Try without CORS mode
      try {
        const response = await fetch(`${this.API_BASE_URL}/health`);
        const data = await response.json();
        console.log('Connection test (no CORS) result:', data);
        return data;
      } catch (fallbackError) {
        throw new Error(`Cannot connect to API at ${this.API_BASE_URL}. Error: ${fallbackError.message}`);
      }
    }
  }

  async testCors() {
    return this.makeRequest(`${this.API_BASE_URL}/test-cors`, {
      method: 'GET',
    });
  }

  // Authentication methods
  async login(email, password) {
    const response = await fetch(`${this.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await this.handleResponse(response);
    
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      console.log('Auth token saved:', data.access_token.substring(0, 20) + '...');
    }
    
    return data;
  }

  async register(userData) {
    return this.makeRequest(`${this.API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.makeRequest(`${this.API_BASE_URL}/api/auth/me`, {
      method: 'GET',
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    console.log('User logged out');
  }

  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // File upload methods
  async uploadBankFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.API_BASE_URL}/api/upload/bank`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : '',
      },
      body: formData,
    });
    
    return this.handleResponse(response);
  }

  async uploadAccountingFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.API_BASE_URL}/api/upload/accounting`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : '',
      },
      body: formData,
    });
    
    return this.handleResponse(response);
  }

  async getUploads() {
    return this.makeRequest(`${this.API_BASE_URL}/api/uploads`, {
      method: 'GET',
    });
  }

  // Reconciliation methods
  async startReconciliation(bankUploadId, accountingUploadId, rules = {}) {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconcile`, {
      method: 'POST',
      body: JSON.stringify({
        bank_file: bankUploadId,
        accounting_file: accountingUploadId,
        rules: rules,
      }),
    });
  }

  async getMatches(jobId, page = 1) {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconcile/${jobId}/results?page=${page}`, {
      method: 'GET',
    });
  }

  async validateMatch(jobId, matchId, action, accountCode = null) {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconcile/${jobId}/matches/${matchId}/validate`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        accountCode,
      }),
    });
  }

  async exportResults(jobId, format = 'excel') {
    const response = await fetch(`${this.API_BASE_URL}/api/reconcile/${jobId}/export?format=${format}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation_${jobId}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  }

  async getRegularizationEntries(jobId) {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconcile/${jobId}/regularization`, {
      method: 'GET',
    });
  }

  async listReconciliations() {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconciliations`, {
      method: 'GET',
    });
  }

  async getMetrics(jobId) {
    return this.makeRequest(`${this.API_BASE_URL}/api/reconcile/${jobId}/metrics`, {
      method: 'GET',
    });
  }

  // AI Assistant methods
  async getLabelSimilarity(text1, text2) {
    return this.makeRequest(`${this.API_BASE_URL}/api/ai/similarity`, {
      method: 'POST',
      body: JSON.stringify({
        text1,
        text2,
      }),
    });
  }

  async categorizeTransaction(description, amount) {
    return this.makeRequest(`${this.API_BASE_URL}/api/ai/categorize`, {
      method: 'POST',
      body: JSON.stringify({
        description,
        amount,
      }),
    });
  }

  async validatePCN(pcn) {
    return this.makeRequest(`${this.API_BASE_URL}/api/ai/validate-pcn`, {
      method: 'POST',
      body: JSON.stringify({ pcn }),
    });
  }

  async suggestAccount(transaction) {
    return this.makeRequest(`${this.API_BASE_URL}/api/ai/suggest-account`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Test function to run on page load
export const testApiConnection = async () => {
  try {
    console.log('=== Testing API Connection ===');
    console.log('API Base URL:', apiService.API_BASE_URL);
    
    const health = await apiService.testConnection();
    console.log('✅ Health check passed:', health);
    
    const corsTest = await apiService.testCors();
    console.log('✅ CORS test passed:', corsTest);
    
    return { success: true, health, corsTest };
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Exécuter le test automatiquement en développement
if (import.meta.env.DEV) {
  setTimeout(() => {
    testApiConnection();
  }, 1000);
}
