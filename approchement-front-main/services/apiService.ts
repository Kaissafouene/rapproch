const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async uploadBankFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/bank`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async uploadAccountingFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/accounting`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async startReconciliation(bankUploadId: string, accountingUploadId: string, rules?: any): Promise<ReconcileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        bank_file: bankUploadId,
        accounting_file: accountingUploadId,
        rules: rules
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Reconciliation failed');
    }

    return response.json();
  }

  async getMatches(jobId: string, page: number = 1): Promise<MatchesResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reconcile/${jobId}/results?page=${page}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch matches');
    }

    return response.json();
  }

  async validateMatch(jobId: string, matchId: string, action: string, accountCode?: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/reconcile/${jobId}/matches/${matchId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        action,
        accountCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Validation failed');
    }

    return response.json();
  }

  async exportResults(jobId: string, format: string = 'excel'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/reconcile/${jobId}/export?format=${format}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Export failed');
    }

    return response.json();
  }

  async getRegularizationEntries(jobId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/reconcile/${jobId}/regularization`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch regularization entries');
    }

    return response.json();
  }

  async listReconciliations(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/reconciliations`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch reconciliations');
    }

    return response.json();
  }
}

export const apiService = new ApiService();