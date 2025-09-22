const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Importa a função do OpenRouter
const { askOpenRouter } = require("./services/askOpenRouter");

// Carrega variáveis do .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota POST para enviar mensagens ao OpenRouter
app.post("/chat", async (req, res) => {
  const { prompt, userId, history } = req.body; // history e userId opcionais

  if (!prompt) {
    return res.status(400).json({ text: "Prompt é obrigatório" });
  }

  try {
    // Chama a função que envia a mensagem para o OpenRouter
    const responseText = await askOpenRouter(prompt, history, userId);

    res.json({ text: responseText });
  } catch (err) {
    console.error("Erro ao processar a mensagem:", err);
    res.status(500).json({ text: "Erro ao processar a mensagem" });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Clicka-Empter backend rodando em http://localhost:${PORT}`);
});
