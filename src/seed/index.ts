import { SeedService } from '../repositories/seedService';

// Run seeding
const seedService = new SeedService();
seedService.seedAll().then(() => {
  console.log('Seeding completed');
}).catch((error: unknown) => {
  console.error('Seeding failed:', error);
});