import createRequest from './createRequest';

export default class ChatAPI {
  async registerUser(name) {
    return await createRequest({
      url: '/api/register',
      method: 'POST',
      data: { name }
    });
  }

  async sendMessage(message) {
    return await createRequest({
      url: '/api/messages',
      method: 'POST',
      data: message
    });
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUrl = `${protocol}//${window.location.host}/ws`;
    return new WebSocket(websocketUrl);
  }
}