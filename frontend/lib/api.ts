import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5195';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (usernameOrEmail: string, password: string) => {
    const response = await apiClient.post('/api/Auth/login', {
      usernameOrEmail,
      password,
    });
    return response.data;
  },
  register: async (username: string, email: string, password: string, role: string = 'Staff') => {
    const response = await apiClient.post('/api/Auth/register', {
      username,
      email,
      password,
      role,
    });
    return response.data;
  },
};

// Asset API
export const assetAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/Asset');
    return response.data;
  },
  create: async (asset: {
    name: string;
    categoryId: number;
    purchasePrice: number;
    salvageValue: number;
    usefulLifeYears: number;
    purchaseDate: string;
  }) => {
    const response = await apiClient.post('/api/Asset', asset);
    return response.data;
  },
  getCategories: async () => {
    const response = await apiClient.get('/api/Asset/categories');
    return response.data;
  },
  createCategory: async (category: { name: string }) => {
    const response = await apiClient.post('/api/Asset/categories', category);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(`/api/Asset/categories/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await apiClient.put(`/api/Asset/${id}/status`, JSON.stringify(status), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
};

// Finance API
export const financeAPI = {
  getSummary: async (year?: number) => {
    const response = await apiClient.get('/api/Finance/summary', {
      params: { year },
    });
    return response.data;
  },
  addIncome: async (income: { amount: number; source: string; date: string }) => {
    const response = await apiClient.post('/api/Finance/income', income);
    return response.data;
  },
  addExpense: async (expense: {
    amount: number;
    categoryId: number;
    description: string;
    date: string;
  }) => {
    const response = await apiClient.post('/api/Finance/expense', expense);
    return response.data;
  },
  getTransactions: async () => {
    const response = await apiClient.get('/api/Finance/transactions');
    return response.data;
  },
  getExpenseCategories: async () => {
    const response = await apiClient.get('/api/Finance/expenses/categories');
    return response.data;
  },
  getExpenseByCategory: async (year?: number) => {
    const response = await apiClient.get('/api/Finance/expenses/by-category', { params: { year } });
    return response.data;
  },
  createExpenseCategory: async (name: string) => {
    const response = await apiClient.post('/api/Finance/expenses/categories', { name });
    return response.data;
  },
  closePeriod: async (year: number, month: number) => {
    const response = await apiClient.post('/api/Finance/close-period', null, { params: { year, month } });
    return response.data;
  },
  openPeriod: async (year: number, month: number) => {
    const response = await apiClient.post('/api/Finance/open-period', null, { params: { year, month } });
    return response.data;
  }
};

// Tax API
export const taxAPI = {
  calculate: async (year: number, adjustedDepreciation?: number) => {
    const response = await apiClient.post(`/api/Tax/calculate`, {}, { params: { year, adjustedDepreciation } });
    return response.data;
  },
  getSummary: async () => {
    const response = await apiClient.get('/api/Tax/summary');
    return response.data;
  },
  getReport: async (year: number) => {
    const response = await apiClient.get(`/api/Tax/reports/${year}`);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/api/Reports/dashboard');
    return response.data;
  },
  getProfitLoss: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/api/Reports/profit-loss', { params: { startDate, endDate } });
    return response.data;
  },
  getTaxSummary: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/api/Reports/tax-summary', { params: { startDate, endDate } });
    return response.data;
  },
  getAssets: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/api/Reports/assets', { params: { startDate, endDate } });
    return response.data;
  },
};

// Audit API
export const auditAPI = {
  getLogs: async (page: number = 1, pageSize: number = 50) => {
    const response = await apiClient.get('/api/Audit', { params: { page, pageSize } });
    return response.data;
  }
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await apiClient.get('/api/SystemSettings');
    return response.data;
  },
  updateSetting: async (key: string, value: string) => {
    const response = await apiClient.put(`/api/SystemSettings/${key}`, JSON.stringify(value));
    return response.data;
  },
  backupDatabase: async () => {
    const response = await apiClient.get('/api/SystemSettings/backup', { responseType: 'blob' });
    return response.data;
  },
  restoreDatabase: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/SystemSettings/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default apiClient;
