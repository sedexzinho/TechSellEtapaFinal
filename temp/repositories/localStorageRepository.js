export class LocalStorageRepository {
    getStorageKey() {
        return `techsell:${this.key}`;
    }
    getData() {
        try {
            const data = localStorage.getItem(this.getStorageKey());
            if (!data)
                return [];
            return JSON.parse(data).map((item) => this.deserialize(item));
        }
        catch (error) {
            console.error(`Error reading from localStorage for key ${this.getStorageKey()}:`, error);
            return [];
        }
    }
    saveData(data) {
        try {
            const serialized = JSON.stringify(data.map(item => this.serialize(item)));
            localStorage.setItem(this.getStorageKey(), serialized);
        }
        catch (error) {
            console.error(`Error saving to localStorage for key ${this.getStorageKey()}:`, error);
            throw error;
        }
    }
    findById(id) {
        const data = this.getData();
        return data.find(item => this.getId(item) === id) || null;
    }
    findAll() {
        return this.getData();
    }
    create(entity) {
        const data = this.getData();
        data.push(entity);
        this.saveData(data);
        return entity;
    }
    update(id, entity) {
        const data = this.getData();
        const index = data.findIndex(item => this.getId(item) === id);
        if (index === -1)
            return null;
        const updated = { ...data[index], ...entity };
        data[index] = updated;
        this.saveData(data);
        return updated;
    }
    delete(id) {
        const data = this.getData();
        const initialLength = data.length;
        const filteredData = data.filter(item => this.getId(item) !== id);
        if (filteredData.length === initialLength)
            return false;
        this.saveData(filteredData);
        return true;
    }
    count() {
        return this.getData().length;
    }
}
