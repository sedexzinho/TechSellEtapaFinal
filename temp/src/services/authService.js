import { UserRepository } from '../repositories/userRepository';
// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const authService = {
    login: async (credentials) => {
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
    logout: async () => {
        await delay(500);
        return true;
    }
};
