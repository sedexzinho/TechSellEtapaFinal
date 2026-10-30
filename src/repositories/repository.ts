export interface Repository<T, ID> {
  findById(id: ID): T | null;
  findAll(): T[];
  create(entity: T): T;
  update(id: ID, entity: Partial<T>): T | null;
  delete(id: ID): boolean;
  count(): number;
}