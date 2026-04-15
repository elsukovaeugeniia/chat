import createRequest from './createRequest';

export default class ChatAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3000'; // замените на порт вашего бэкенда
  }

  async registerUser(name) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/api/register`,
        method: 'POST',
        data: { name }
      });

      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Получаем тело ответа как текст для отладки
      const rawText = await response.text();

      // Логируем сырой ответ (уберите в продакшене)
      console.log('Raw response:', rawText);

      // Если ответ пустой — возвращаем дефолтный объект
      if (!rawText || rawText.trim() === '') {
        console.warn('Empty response from server, returning default');
        return { status: 'ok', user: { id: 1, name } };
      }

      // Пытаемся распарсить JSON
      try {
        const result = JSON.parse(rawText);
        return result;
      } catch (jsonError) {
        console.error('Invalid JSON received:', rawText);
        throw new Error('Сервер вернул некорректные данные: не JSON');
      }
    } catch (error) {
      console.error('Ошибка регистрации пользователя:', error);
      throw error;
    }
  }

  async sendMessage(message) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/api/messages`,
        method: 'POST',
        data: message
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawText = await response.text();
      if (!rawText) return { success: true };

      try {
        return JSON.parse(rawText);
      } catch (jsonError) {
        console.error('Invalid JSON in sendMessage:', rawText);
        throw new Error('Ошибка формата данных от сервера');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      throw error;
    }
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');

    return ws;
  }
}

