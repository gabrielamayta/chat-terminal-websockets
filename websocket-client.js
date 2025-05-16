import WebSocket from "ws";
import readline from "readline";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  rl.question(chalk.magenta("Bienvenido al chat. Por favor, ingresa tu nombre de usuario: "), (username) => {
    ws.send(JSON.stringify({ type: "username", username }));
    console.log(chalk.green(`Conectado al chat como "${username}".`));

    rl.on("line", (input) => {
      ws.send(JSON.stringify({ type: "message", message: input }));
    });
  });
});

ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data);

    if (msg.type === "user") {
      // Mensaje de otro usuario
      console.log(chalk.yellow(`${msg.sender}: ${msg.message}`));
    } else if (msg.type === "server") {
      // Mensaje del servidor
      console.log(chalk.blue(`[Servidor]: ${msg.message}`));
    } else if (msg.type === "error") {
      console.log(chalk.red(`[Error]: ${msg.message}`));
    }
  } catch (e) {
    console.log(chalk.red("Mensaje recibido sin formato:"), data.toString());
  }
});
