import { SeedService } from './src/repositories/seedService';
// Run seeding
async function testSeeding() {
    const seedService = new SeedService();
    await seedService.seedAll();
    // Check what was seeded
    const { UserRepository } = await import('./src/repositories/userRepository');
    const { ProductRepository } = await import('./src/repositories/productRepository');
    const { CustomerRepository } = await import('./src/repositories/customerRepository');
    const userRepo = new UserRepository();
    const productRepo = new ProductRepository();
    const customerRepo = new CustomerRepository();
    console.log('Users:', userRepo.findAll());
    console.log('Products:', productRepo.findAll());
    console.log('Customers:', customerRepo.findAll());
}
testSeeding().catch(console.error);
