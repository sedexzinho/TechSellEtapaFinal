import type { Repository } from './repository';

export abstract class LocalStorageRepository<T, ID extends string | number> implements Repository<T, ID> {
  protected abstract readonly key: string;
  protected abstract deserialize(data: string): T;
  protected abstract serialize(entity: T): string;

  protected getStorageKey(): string {
    return `techsell:${this.key}`;
  }

  protected getData(): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (!data) return [];
      return JSON.parse(data).map((item: any) => this.deserialize(item));
    } catch (error) {
      console.error(`Error reading from localStorage for key ${this.getStorageKey()}:`, error);
      return [];
    }
  }

  protected saveData(data: T[]): void {
    try {
      const serialized = JSON.stringify(data.map(item => this.serialize(item)));
      localStorage.setItem(this.getStorageKey(), serialized);
    } catch (error) {
      console.error(`Error saving to localStorage for key ${this.getStorageKey()}:`, error);
      throw error;
    }
  }

  findById(id: ID): T | null {
    const data = this.getData();
    return data.find(item => this.getId(item) === id) || null;
  }

  findAll(): T[] {
    return this.getData();
  }

  create(entity: T): T {
    const data = this.getData();
    data.push(entity);
    this.saveData(data);
    return entity;
  }

  update(id: ID, entity: Partial<T>): T | null {
    const data = this.getData();
    const index = data.findIndex(item => this.getId(item) === id);
    if (index === -1) return null;

    const updated = { ...data[index], ...entity } as T;
    data[index] = updated;
    this.saveData(data);
    return updated;
  }

  delete(id: ID): boolean {
    const data = this.getData();
    const initialLength = data.length;
    const filteredData = data.filter(item => this.getId(item) !== id);
    if (filteredData.length === initialLength) return false;

    this.saveData(filteredData);
    return true;
  }

  count(): number {
    return this.getData().length;
  }

  protected abstract getId(entity: T): ID;
}