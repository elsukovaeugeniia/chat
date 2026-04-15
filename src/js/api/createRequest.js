const createRequest = async (options) => {
  const { method = 'GET', url, data = null } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json', // исправлено
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    // Сначала проверяем статус
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Пытаемся получить сообщение об ошибке из тела ответа
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Если ответ не JSON (например, HTML), используем стандартный текст
        errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // Проверяем, есть ли тело ответа
    const hasBody = response.status !== 204 && response.status !== 304;
    if (!hasBody) {
      return { status: 'success', message: 'No content' };
    }

    // Только теперь парсим JSON
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Request error:', error); // для отладки
    throw error;
  }
};

export default createRequest;
