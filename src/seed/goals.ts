export interface GoalSeed {
  id: number;
  userId: number;
  userName: string;
  month: number;
  year: number;
  targetValue: number;
  achievedValue: number;
}

export const goals: GoalSeed[] = [
  {
    id: 1,
    userId: 2, // Davi Silva (VENDEDOR)
    userName: 'Davi Silva',
    month: 10, // Outubro
    year: 2025,
    targetValue: 50000,
    achievedValue: 35000
  },
  {
    id: 2,
    userId: 3, // Davi Barbosa (VENDEDOR)
    userName: 'Davi Barbosa',
    month: 10, // Outubro
    year: 2025,
    targetValue: 45000,
    achievedValue: 42000
  },
  {
    id: 3,
    userId: 4, // Vinicius Kauan (VENDEDOR)
    userName: 'Vinicius Kauan',
    month: 10, // Outubro
    year: 2025,
    targetValue: 40000,
    achievedValue: 28000
  },
  {
    id: 4,
    userId: 1, // Rafaela Ferrari (ADMIN)
    userName: 'Rafaela Ferrari',
    month: 10, // Outubro
    year: 2025,
    targetValue: 100000,
    achievedValue: 85000
  }
];
