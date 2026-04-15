import createRequest from './createRequest'; // исправлено на ES6

export default class Entity {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async list() {
    return await createRequest({
      url: this.baseUrl,
    });
  }

  async get(id) {
    return await createRequest({
      url: `${this.baseUrl}/${id}`,
    });
  }

  async create(data) {
    return await createRequest({
      method: 'POST',
      url: this.baseUrl,
      data,
    });
  }

  async update(id, data) {
    return await createRequest({
      method: 'PUT',
      url: `${this.baseUrl}/${id}`,
      data,
    });
  }

  async delete(id) {
    return await createRequest({
      method: 'DELETE',
      url: `${this.baseUrl}/${id}`,
    });
  }
}
