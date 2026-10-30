import { UserRepository } from '../repositories/userRepository';

// Define the user type (without password)
export interface User {
  id: number;
  nome: string;
  login: string;
  perfil: 'ADMIN' | 'VENDEDOR';
  ativo: boolean;
}

// Define the return type of login
interface LoginResponse {
  user: User;
  token: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (credentials: { login: string; senha: string }): Promise<LoginResponse> => {
    await delay(1000); // Simulate network delay

    const { login, senha } = credentials;
    const userRepository = new UserRepository();
    const user = userRepository.findByLoginAndPassword(login, senha);

    if (!user || !user.ativo) {
      throw new Error('Credenciais inválidas ou usuário inativo');
    }

    // Return user without password
    const { senha: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'fake-jwt-token' // In a real app, this would be a JWT
    };
  },

  logout: async (): Promise<boolean> => {
    await delay(500);
    return true;
  }
};