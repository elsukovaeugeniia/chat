import { randomUUID } from "node:crypto";
import http from "node:http";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import pino from "pino";
import pinoPretty from "pino-pretty";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const userState = [];

// Эндпоинт для регистрации пользователя
app.post("/new-user", async (request, response) => {
  const { name } = request.body;

  // Проверка, что имя передано и не пустое
  if (!name || typeof name !== 'string' || name.trim() === '') {
    const result = {
      status: "error",
      message: "Никнейм не может быть пустым",
    };
    response.status(400).send(result).end();
    return;
  }

  const isExist = userState.find((user) => user.name === name);
  if (isExist) {
    const result = {
      status: "error",
      message: "Этот никнейм уже занят!",
    };
    logger.error(`Пользователь с ником "${name}" уже существует`);
    response.status(409).send(result).end();
  } else {
    const newUser = {
      id: randomUUID(),
      name: name,
    };
    userState.push(newUser);
    const result = {
      status: "ok",
      user: newUser,
    };
    logger.info(`Новый пользователь создан: ${JSON.stringify(newUser)}`);
    response.send(result).end();
  }
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (ws) => {
  // Отправляем актуальный список пользователей новому клиенту
  ws.send(JSON.stringify(userState));

  ws.on("message", (msg, isBinary) => {
    try {
      const receivedMSG = JSON.parse(msg);
      logger.info(`Сообщение получено: ${JSON.stringify(receivedMSG)}`);

      // Обработка выхода пользователя
      if (receivedMSG.type === "exit") {
        const idx = userState.findIndex((user) => user.name === receivedMSG.user.name);
        if (idx !== -1) {
          userState.splice(idx, 1);
          // Отправляем обновлённый список всем клиентам
          [...wsServer.clients]
            .filter((o) => o.readyState === WebSocket.OPEN)
            .forEach((o) => o.send(JSON.stringify(userState)));
          logger.info(`Пользователь "${receivedMSG.user.name}" вышел`);
        }
        return;
      }

      // Обработка отправки сообщения
      if (receivedMSG.type === "send") {
        [...wsServer.clients]
          .filter((o) => o.readyState === WebSocket.OPEN)
          .forEach((o) => o.send(msg, { binary: isBinary }));
        logger.info("Сообщение отправлено всем пользователям");
      }
    } catch (error) {
      logger.error(`Ошибка парсинга JSON: ${error.message}`);
    }
  });
});

const port = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    server.listen(port, () =>
      logger.info(`Сервер запущен на http://localhost:${port}`)
    );
  } catch (error) {
    logger.error(`Ошибка: ${error.message}`);
  }
};

bootstrap();
