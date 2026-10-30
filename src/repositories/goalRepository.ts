import { LocalStorageRepository } from './localStorageRepository';
import type { Goal } from '../schemas/goalSchema';

export class GoalRepository extends LocalStorageRepository<Goal, number> {
  protected readonly key = 'goals';
  
  protected deserialize(data: string): Goal {
    return JSON.parse(data);
  }
  
  protected serialize(entity: Goal): string {
    return JSON.stringify(entity);
  }
  
  protected getId(entity: Goal): number {
    return entity.id;
  }
  
  // Additional methods specific to goals
  findByUserId(userId: number): Goal[] {
    return this.findAll().filter(goal => goal.userId === userId);
  }
  
  findByMonthYear(month: number, year: number): Goal[] {
    return this.findAll().filter(goal => goal.month === month && goal.year === year);
  }
  
  getPerformancePercentage(): number {
    const goals = this.findAll();
    if (goals.length === 0) return 0;
    
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetValue, 0);
    const totalAchieved = goals.reduce((sum, goal) => sum + goal.achievedValue, 0);
    
    return totalTarget === 0 ? 0 : (totalAchieved / totalTarget) * 100;
  }
}