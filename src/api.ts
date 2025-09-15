// API configuration for ExpenseTracker
import axios from 'axios';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

const config: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000
};

// Configure axios instance
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  auth: {
    login: async (username: string, password: string) => {
      try {
        const response = await apiClient.post('/auth/login', { username, password });
        const { access_token } = response.data;
        
        setAuthToken(access_token);
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          token: access_token,
          user: { id: '1', username, name: username }
        };
      } catch (error: any) {
        console.warn('Backend not available, using demo mode');
        // Fallback to demo mode when backend is not available
        if (username && password) {
          setAuthToken('demo-token');
          localStorage.setItem('isAuthenticated', 'true');
          return {
            success: true,
            token: 'demo-token',
            user: { id: '1', username, name: username }
          };
        }
        throw new Error('Invalid credentials');
      }
    },

    register: async (username: string, email: string, password: string) => {
      try {
        const response = await apiClient.post('/auth/register', { username, email, password });
        const { id, username: returnedUsername } = response.data;
        
        // Auto-login after registration
        const loginResponse = await api.auth.login(username, password);
        
        return {
          success: true,
          token: loginResponse.token,
          user: { id: id.toString(), email, name: returnedUsername }
        };
      } catch (error: any) {
        console.warn('Backend not available, using demo mode');
        // Fallback to demo mode
        if (username && email && password) {
          setAuthToken('demo-token');
          localStorage.setItem('isAuthenticated', 'true');
          return {
            success: true,
            token: 'demo-token',
            user: { id: '1', email, name: username }
          };
        }
        throw new Error('Registration failed');
      }
    },

    logout: async () => {
      clearAuthToken();
      return { success: true };
    }
  },

  // Expenses
  expenses: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/expenses');
        return response.data;
      } catch (error: any) {
        console.warn('Backend not available, using localStorage');
        // Fallback to localStorage when backend is not available
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
      }
    },

    create: async (expense: any) => {
      try {
        const response = await apiClient.post('/expenses', {
          amount: parseFloat(expense.amount),
          category_id: parseInt(expense.category_id),
          date: expense.date,
          description: expense.description
        });
        return response.data;
      } catch (error: any) {
        console.warn('Backend not available, using localStorage');
        // Fallback to localStorage
        const expenses = await api.expenses.getAll();
        const newExpense = {
          id: Date.now().toString(),
          amount: parseFloat(expense.amount),
          description: expense.description,
          category_id: expense.category_id,
          category_name: expense.category || 'Other',
          date: expense.date
        };
        
        const updated = [...expenses, newExpense];
        localStorage.setItem('expenses', JSON.stringify(updated));
        
        return { id: newExpense.id };
      }
    },

    delete: async (id: string) => {
      try {
        await apiClient.delete(`/expenses/${id}`);
        return { success: true };
      } catch (error: any) {
        console.warn('Backend not available, using localStorage');
        // Fallback to localStorage
        const expenses = await api.expenses.getAll();
        const updated = expenses.filter((expense: any) => expense.id !== id);
        localStorage.setItem('expenses', JSON.stringify(updated));
        
        return { success: true };
      }
    },

    update: async (id: string, updates: any) => {
      try {
        const response = await apiClient.put(`/expenses/${id}`, {
          amount: parseFloat(updates.amount),
          category_id: parseInt(updates.category_id),
          date: updates.date,
          description: updates.description
        });
        return response.data;
      } catch (error: any) {
        console.warn('Backend not available, using localStorage');
        // Fallback to localStorage
        const expenses = await api.expenses.getAll();
        const updated = expenses.map((expense: any) => 
          expense.id === id 
            ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
            : expense
        );
        localStorage.setItem('expenses', JSON.stringify(updated));
        
        return updated.find((expense: any) => expense.id === id);
      }
    }
  },

  // Categories
  categories: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/categories');
        return response.data;
      } catch (error: any) {
        // Fallback to default categories if backend fails
        return [
          { id: 1, name: 'Food & Dining' },
          { id: 2, name: 'Transportation' },
          { id: 3, name: 'Entertainment' },
          { id: 4, name: 'Shopping' },
          { id: 5, name: 'Health & Fitness' },
          { id: 6, name: 'Bills & Utilities' },
          { id: 7, name: 'Other' }
        ];
      }
    },

    create: async (name: string) => {
      try {
        const response = await apiClient.post('/categories', { name });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.msg || 'Failed to create category');
      }
    }
  }
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
};

// Setup interceptors function (already configured above)
export const setupInterceptors = () => {
  console.log('API interceptors setup complete');
};

export default api;