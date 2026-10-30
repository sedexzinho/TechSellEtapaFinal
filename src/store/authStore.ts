import { create } from 'zustand';
import { authService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';

// Define the user type
export interface User {
  id: number;
  nome: string;
  login: string;
  senha?: string; // optional for when we don't want to return the password
  perfil: 'ADMIN' | 'VENDEDOR';
  ativo: boolean;
}

// Define the store state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (credentials: { login: string; senha: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      // In a real app, you would save the token to localStorage or cookies
      localStorage.setItem('techsell_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      localStorage.removeItem('techsell_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('techsell_token');
    if (token) {
      // In a real app, you would validate the token and fetch user data
      // For now, we'll get the user from our repository
      try {
        const userRepository = new UserRepository();
        // Get the first admin user as default (in a real app, we'd decode the token to get user ID)
        const adminUser = userRepository.findAll().find(user => user.perfil === 'ADMIN' && user.ativo);
        if (adminUser) {
          const { senha: _, ...userWithoutPassword } = adminUser;
          set({ isAuthenticated: true, user: userWithoutPassword });
        } else {
          // Fallback if no admin found
          set({ isAuthenticated: true, user: { id: 1, nome: 'Carlos Mendes', login: 'admin', perfil: 'ADMIN', ativo: true } });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Fallback in case of error
        set({ isAuthenticated: true, user: { id: 1, nome: 'Carlos Mendes', login: 'admin', perfil: 'ADMIN', ativo: true } });
      }
    }
  }
}));