import createRequest from './createRequest';

export default class ChatAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3000'; // замените на порт вашего бэкенда
  }

  async registerUser(name) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/new-user`, // исправленный URL
        method: 'POST',
        data: { name }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Сразу парсим JSON — проще и надёжнее
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ошибка регистрации пользователя:', error);
      throw error;
    }
  }

  async sendMessage(message) {
    // Этот метод пока не используется, но его URL тоже нужно будет исправить,
    // когда появится соответствующий эндпоинт на сервере
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/api/messages`,
        method: 'POST',
        data: message
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      throw error;
    }
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Убираем '/ws' из URL — WebSocket слушает основной порт
    const websocketUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');

    return ws;
  }
}


