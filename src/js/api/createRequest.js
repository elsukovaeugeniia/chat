const createRequest = async (options) => {
  const { method = 'GET', url, data = null } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Network error');
    }

    return result;
  } catch (error) {
    // Логирование отключено в продакшене
    // Для разработки можно раскомментировать:
    // if (process.env.NODE_ENV === 'development') {
    //   console.error('Request error:', error);
    // }
    throw error;
  }
};

export default createRequest;