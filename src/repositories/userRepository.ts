import { LocalStorageRepository } from './localStorageRepository';
import type { UserSeed } from '../seed/users';

export interface User extends UserSeed {}

export class UserRepository extends LocalStorageRepository<User, number> {
  protected readonly key = 'users';

  protected deserialize(data: string): User {
    return JSON.parse(data);
  }

  protected serialize(entity: User): string {
    return JSON.stringify(entity);
  }

  protected getId(entity: User): number {
    return entity.id;
  }

  findByLogin(login: string): User | null {
    return this.findAll().find(user => user.login === login) || null;
  }

  findByLoginAndPassword(login: string, senha: string): User | null {
    return this.findAll().find(user => user.login === login && user.senha === senha) || null;
  }
}