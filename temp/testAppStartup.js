// Simulate what happens in main.tsx when the app starts
import { SeedService } from './src/repositories/seedService';
// Test app startup seeding
async function testAppStartup() {
    console.log('Testing app startup seeding...');
    // This is what happens in main.tsx
    const seedService = new SeedService();
    await seedService.seedAll();
    // Check what was seeded
    const { UserRepository } = await import('./src/repositories/userRepository');
    const { ProductRepository } = await import('./src/repositories/productRepository');
    const { CustomerRepository } = await import('./src/repositories/customerRepository');
    const userRepo = new UserRepository();
    const productRepo = new ProductRepository();
    const customerRepo = new CustomerRepository();
    const users = userRepo.findAll();
    const products = productRepo.findAll();
    const customers = customerRepo.findAll();
    console.log(`Seeded ${users.length} users:`);
    users.forEach(u => console.log(`  - ${u.login} (${u.perfil})`));
    console.log(`Seeded ${products.length} products:`);
    products.forEach(p => console.log(`  - ${p.nome} (Estoque: ${p.estoque})`));
    console.log(`Seeded ${customers.length} customers:`);
    customers.forEach(c => console.log(`  - ${c.nome} (${c.cpfCnpj})`));
    // Test login functionality
    console.log('\nTesting login functionality...');
    const { authService } = await import('./src/services/authService');
    try {
        const loginResult = await authService.login({ login: 'admin', senha: 'admin123' });
        console.log('Login successful:', loginResult.user.nome);
    }
    catch (error) {
        console.log('Login failed:', error.message);
    }
    try {
        const loginResult = await authService.login({ login: 'ricardo', senha: '123456' });
        console.log('Login successful:', loginResult.user.nome);
    }
    catch (error) {
        console.log('Login failed:', error.message);
    }
    // Test invalid login
    try {
        const loginResult = await authService.login({ login: 'invalid', senha: 'invalid' });
        console.log('Login should have failed but succeeded:', loginResult);
    }
    catch (error) {
        console.log('Invalid login correctly rejected:', error.message);
    }
}
testAppStartup().catch(console.error);
