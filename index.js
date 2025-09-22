// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// Carrega variáveis do .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota POST para enviar mensagens ao OpenRouter
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ text: "Prompt é obrigatório" });
  }

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Chave OPENROUTER_API_KEY não definida!");
      return res.status(500).json({ text: "Chave da API não configurada no backend." });
    }

    const response = await axios.post(
      "https://api.openrouter.ai/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content ?? "";

    res.json({ text });
  } catch (err) {
    // Axios já traz mais detalhes de erro
    console.error("Erro ao processar a mensagem:", err.response?.data || err.message);
    res.status(500).json({ text: "Erro ao processar a mensagem" });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Clicka-Empter backend rodando em http://localhost:${PORT}`);
});
