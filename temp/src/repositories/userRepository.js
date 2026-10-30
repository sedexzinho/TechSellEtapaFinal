import { LocalStorageRepository } from './localStorageRepository';
export class UserRepository extends LocalStorageRepository {
    key = 'users';
    deserialize(data) {
        return JSON.parse(data);
    }
    serialize(entity) {
        return JSON.stringify(entity);
    }
    getId(entity) {
        return entity.id;
    }
    findByLogin(login) {
        return this.findAll().find(user => user.login === login) || null;
    }
    findByLoginAndPassword(login, senha) {
        return this.findAll().find(user => user.login === login && user.senha === senha) || null;
    }
}
