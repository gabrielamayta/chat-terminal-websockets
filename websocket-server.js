import { WebSocketServer } from "ws";
import chalk from "chalk";

const wss = new WebSocketServer({ port: 8080 });

function enviarMensajeGlobal(mensaje) {
  const mensajeServidor = JSON.stringify({
    type: "server",
    sender: "Servidor",
    message: mensaje,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(mensajeServidor);
    }
  });

  console.log(chalk.blue(`[Servidor] ${mensaje}`));
}

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "username") {
        ws.username = msg.username;
        console.log(chalk.green(`🟢 Usuario "${ws.username}" se ha conectado`));

        const mensajeBienvenida = JSON.stringify({
          type: "server",
          sender: "Servidor",
          message: `El usuario "${ws.username}" se ha unido al chat.`,
        });

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(mensajeBienvenida);
          }
        });

        // mensaje global despues de 30 segundos de iniciar el servidor
        setTimeout(() => {
          enviarMensajeGlobal("El chat se cerrará en 10 minutos.");
        }, 30000);

      } else if (msg.type === "message") {
        const mensajeUsuario = JSON.stringify({
          type: "user",
          sender: ws.username,
          message: msg.message,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(mensajeUsuario);
          }
        });

        console.log(chalk.yellow(`${ws.username}: ${msg.message}`));
      }
    } catch (e) {
      console.error(chalk.red("❌ Error procesando mensaje:"), e);
      ws.send(JSON.stringify({ type: "error", message: "Error en el formato del mensaje." }));
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      console.log(chalk.red(`🔴 Usuario "${ws.username}" se ha desconectado`));

      const mensajeSalida = JSON.stringify({
        type: "server",
        sender: "Servidor",
        message: `El usuario "${ws.username}" ha salido del chat.`,
      });

      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(mensajeSalida);
        }
      });
    }
  });
});

console.log(chalk.blue("🚀 Servidor WebSocket corriendo en ws://localhost:8080"));
