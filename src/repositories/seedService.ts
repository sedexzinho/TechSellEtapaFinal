import { UserRepository } from './userRepository';
import { ProductRepository } from './productRepository';
import { CustomerRepository } from './customerRepository';
import { OrderRepository } from './orderRepository';
import { VisitRepository } from './visitRepository';
import { BudgetRepository } from './budgetRepository';
import { LeadRepository } from './leadRepository';
import { GoalRepository } from './goalRepository';
import { CostRepository } from './costRepository';
import { users } from '../seed/users';
import { products } from '../seed/products';
import { customers } from '../seed/customers';
import { orders } from '../seed/orders';
import { visits } from '../seed/visits';
import { budgets } from '../seed/budgets';
import { leads } from '../seed/leads';
import { goals } from '../seed/goals';
import { costs } from '../seed/costs';

export class SeedService {
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private customerRepository: CustomerRepository;
  private orderRepository: OrderRepository;
  private visitRepository: VisitRepository;
  private budgetRepository: BudgetRepository;
  private leadRepository: LeadRepository;
  private goalRepository: GoalRepository;
  private costRepository: CostRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.customerRepository = new CustomerRepository();
    this.orderRepository = new OrderRepository();
    this.visitRepository = new VisitRepository();
    this.budgetRepository = new BudgetRepository();
    this.leadRepository = new LeadRepository();
    this.goalRepository = new GoalRepository();
    this.costRepository = new CostRepository();
  }

  public async seedUsers(): Promise<void> {
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

  public async seedProducts(): Promise<void> {
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

  public async seedCustomers(): Promise<void> {
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

  public async seedOrders(): Promise<void> {
    // Check if orders already exist
    const existingOrders = this.orderRepository.findAll();
    if (existingOrders.length > 0) {
      console.log('Orders already seeded, skipping...');
      return;
    }

    // Seed orders
    orders.forEach(order => {
      this.orderRepository.create(order);
    });
    console.log('Orders seeded successfully');
  }

  public async seedVisits(): Promise<void> {
    // Check if visits already exist
    const existingVisits = this.visitRepository.findAll();
    if (existingVisits.length > 0) {
      console.log('Visits already seeded, skipping...');
      return;
    }

    // Seed visits
    visits.forEach(visit => {
      this.visitRepository.create(visit);
    });
    console.log('Visits seeded successfully');
  }

  public async seedBudgets(): Promise<void> {
    // Check if budgets already exist
    const existingBudgets = this.budgetRepository.findAll();
    if (existingBudgets.length > 0) {
      console.log('Budgets already seeded, skipping...');
      return;
    }

    // Seed budgets
    budgets.forEach(budget => {
      this.budgetRepository.create(budget);
    });
    console.log('Budgets seeded successfully');
  }

  public async seedLeads(): Promise<void> {
    // Check if leads already exist
    const existingLeads = this.leadRepository.findAll();
    if (existingLeads.length > 0) {
      console.log('Leads already seeded, skipping...');
      return;
    }

    // Seed leads
    leads.forEach(lead => {
      this.leadRepository.create(lead);
    });
    console.log('Leads seeded successfully');
  }

  public async seedGoals(): Promise<void> {
    // Check if goals already exist
    const existingGoals = this.goalRepository.findAll();
    if (existingGoals.length > 0) {
      console.log('Goals already seeded, skipping...');
      return;
    }

    // Seed goals
    goals.forEach(goal => {
      this.goalRepository.create(goal);
    });
    console.log('Goals seeded successfully');
  }

  public async seedCosts(): Promise<void> {
    // Check if costs already exist
    const existingCosts = this.costRepository.findAll();
    if (existingCosts.length > 0) {
      console.log('Costs already seeded, skipping...');
      return;
    }

    // Seed costs
    costs.forEach(cost => {
      this.costRepository.create(cost);
    });
    console.log('Costs seeded successfully');
  }

  public async seedAll(): Promise<void> {
    await this.seedUsers();
    await this.seedProducts();
    await this.seedCustomers();
    await this.seedOrders();
    await this.seedVisits();
    await this.seedBudgets();
    await this.seedLeads();
    await this.seedGoals();
    await this.seedCosts();
    console.log('All seeding completed');
  }

  public async resetData(): Promise<void> {
    // Clear all data and reseed
    localStorage.clear();
    await this.seedAll();
    console.log('Data reset and reseeded successfully');
  }
}