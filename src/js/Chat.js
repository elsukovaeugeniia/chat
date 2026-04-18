import ChatAPI from './api/ChatAPI';


export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.currentUser = null;
  }

  init() {
    this.showNicknameModal();
  }

  bindToDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.container.appendChild(this.modal);

    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'chat-container';
    this.container.appendChild(this.chatContainer);
  }

  registerEvents() {
    // Обработчик нажатия Enter в поле ввода ника
    this.nicknameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.onEnterChatHandler();
      }
    });

    // Обработчик кнопки «Продолжить» в модальном окне
    this.continueButton?.addEventListener('click', () => {
      this.onEnterChatHandler();
    });

    // Обработчик отправки сообщения
    this.sendButton?.addEventListener('click', () => {
      this.sendMessage();
    });

    // Обработчик нажатия Enter в поле ввода сообщения
    this.messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Обработка закрытия страницы
    window.addEventListener('beforeunload', () => {
      this.handleUserExit();
    });
  }

  subscribeOnEvents() {
    if (!this.websocket) return;

    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        // Это обновление списка пользователей
        this.renderOnlineUsers(data);
      } else {
        // Это сообщение от пользователя
        this.renderMessage(data);
      }
    };

    this.websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  showNicknameModal() {
    // Сначала создаём элементы DOM
    this.bindToDOM();

    // Проверяем, что модальное окно создано
    if (!this.modal) {
      console.error('Не удалось создать модальное окно: элемент modal не найден');
      return;
    }

    // Теперь безопасно устанавливаем содержимое
    this.modal.innerHTML = `
      <div class="modal-content">
        <h2>ВЫБЕРИТЕ НИКНЕЙМ</h2>
        <input type="text" id="nickname-input" placeholder="Введите ваш никнейм">
        <button id="continue-btn">ПРОДОЛЖИТЬ</button>
        <div id="error-message" class="error-message"></div>
      </div>
    `;

    this.nicknameInput = this.modal.querySelector('#nickname-input');
    this.continueButton = this.modal.querySelector('#continue-btn');
    this.errorMessage = this.modal.querySelector('#error-message');

    // Фокусируем поле ввода ника
    setTimeout(() => this.nicknameInput.focus(), 100);
  }

  async onEnterChatHandler() {
    const name = this.nicknameInput.value.trim();

    if (!name) {
      this.showError('Никнейм не может быть пустым');
      return;
    }

    try {
      const result = await this.api.registerUser(name);

      if (result.status === 'ok') {
        this.currentUser = result.user;
        this.hideModal();
        this.initChat();
      } else if (result.status === 'error') {
        this.showError(result.message);
      }
    } catch (error) {
      this.showError('Ошибка подключения к серверу: ' + error.message);
    }
  }

  hideModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
    } else {
      console.warn('Элемент error-message не найден, не удалось показать ошибку:', message);
    }
  }

  initChat() {
    this.chatContainer.innerHTML = `
      <div class="chat-wrapper">
        <div class="users-list-container">
          <h3>Пользователи онлайн</h3>
          <ul id="users-list"></ul>
        </div>
        <div class="chat-messages-container">
          <div id="messages-list" class="messages-list"></div>
          <div class="message-input-container">
            <input type="text" id="message-input" placeholder="Введите сообщение...">
            <button id="send-button">Отправить</button>
          </div>
        </div>
      </div>
    `;

    this.messagesList = this.chatContainer.querySelector('#messages-list');
    this.messageInput = this.chatContainer.querySelector('#message-input');
    this.sendButton = this.chatContainer.querySelector('#send-button');
    this.usersList = this.chatContainer.querySelector('#users-list');


    this.registerEvents();
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.websocket = this.api.connectWebSocket();
    this.subscribeOnEvents();
  }

  handleUserExit() {
    if (this.websocket && this.currentUser) {
      this.websocket.send(JSON.stringify({
        type: 'exit',
        user: this.currentUser,
      }));
      this.websocket.close();
    }
  }

  sendMessage() {
    const messageText = this.messageInput.value.trim();

    if (!messageText) return;

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'send',
        user: this.currentUser,
        message: messageText,
        timestamp: new Date().toISOString(),
      }));

      this.messageInput.value = '';
    } else {
      this.showError('Соединение с сервером потеряно');
    }
  }

  renderMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    const timestamp = new Date(data.timestamp);
    const formattedTime = timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const formattedDate = timestamp.toLocaleDateString('ru-RU');

    messageElement.innerHTML = `
      <div class="message-header">
        <span class="user-name">${data.user.name}</span>
        <span class="message-time">${formattedTime}</span>
      </div>
      <div class="message-date">${formattedDate}</div>
      <div class="message-text">${data.message}</div>
    `;

    this.messagesList.appendChild(messageElement);
    this.messagesList.scrollTop = this.messagesList.scrollHeight;
  }

  renderOnlineUsers(users) {
    if (!this.usersList) {
      console.warn('usersList не найден, не удалось отобразить список пользователей');
      return;
    }

    this.usersList.innerHTML = '';

    users.forEach(user => {
      const userElement = document.createElement('li');
      userElement.className = 'user-item';
      userElement.textContent = user.name;
      this.usersList.appendChild(userElement);
    });
  }
}

