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
    userId: 2, // Ricardo Silva (VENDEDOR)
    userName: 'Ricardo Silva',
    month: 10, // Outubro
    year: 2025,
    targetValue: 50000,
    achievedValue: 35000
  },
  {
    id: 2,
    userId: 3, // Fernanda Lima (VENDEDOR)
    userName: 'Fernanda Lima',
    month: 10, // Outubro
    year: 2025,
    targetValue: 45000,
    achievedValue: 42000
  },
  {
    id: 3,
    userId: 4, // Paulo Oliveira (VENDEDOR)
    userName: 'Paulo Oliveira',
    month: 10, // Outubro
    year: 2025,
    targetValue: 40000,
    achievedValue: 28000
  },
  {
    id: 4,
    userId: 1, // Carlos Mendes (ADMIN)
    userName: 'Carlos Mendes',
    month: 10, // Outubro
    year: 2025,
    targetValue: 100000,
    achievedValue: 85000
  }
];