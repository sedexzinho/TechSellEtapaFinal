import { UserRepository } from './userRepository';
import { ProductRepository } from './productRepository';
import { CustomerRepository } from './customerRepository';
import { users } from '../seed/users';
import { products } from '../seed/products';
import { customers } from '../seed/customers';
export class SeedService {
    userRepository;
    productRepository;
    customerRepository;
    constructor() {
        this.userRepository = new UserRepository();
        this.productRepository = new ProductRepository();
        this.customerRepository = new CustomerRepository();
    }
    async seedUsers() {
        // Check if users already exist
        const existingUsers = this.userRepository.findAll();
        if (existingUsers.length > 0) {
            console.log('Users already seeded, skipping...');
            return;
        }
        // Seed users
        users.forEach(user => {
            this.userRepository.create(user);
        });
        console.log('Users seeded successfully');
    }
    async seedProducts() {
        // Check if products already exist
        const existingProducts = this.productRepository.findAll();
        if (existingProducts.length > 0) {
            console.log('Products already seeded, skipping...');
            return;
        }
        // Seed products
        products.forEach(product => {
            this.productRepository.create(product);
        });
        console.log('Products seeded successfully');
    }
    async seedCustomers() {
        // Check if customers already exist
        const existingCustomers = this.customerRepository.findAll();
        if (existingCustomers.length > 0) {
            console.log('Customers already seeded, skipping...');
            return;
        }
        // Seed customers
        customers.forEach(customer => {
            this.customerRepository.create(customer);
        });
        console.log('Customers seeded successfully');
    }
    async seedAll() {
        await this.seedUsers();
        await this.seedProducts();
        await this.seedCustomers();
        // Other entity seedings will be added here as we create more repositories
        console.log('All seeding completed');
    }
    async resetData() {
        // Clear all data and reseed
        localStorage.clear();
        await this.seedAll();
        console.log('Data reset and reseeded successfully');
    }
}
