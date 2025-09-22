// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Carrega variáveis do .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rate limiter básico por IP
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requisições
  duration: 60, // por 60 segundos
});

// Rota POST para enviar mensagens ao OpenRouter
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  const userIP = req.ip;

  if (!prompt) return res.status(400).json({ text: "Prompt é obrigatório" });

  try {
    // Verifica limite de requisições por IP
    try {
      await rateLimiter.consume(userIP);
    } catch {
      return res.status(429).json({ text: "Muitas requisições. Aguarde alguns segundos." });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Chave OPENROUTER_API_KEY não definida!");
      return res.status(500).json({ text: "Chave da API não configurada no backend." });
    }

    // Requisição para OpenRouter com timeout
    const response = await axios.post(
      "https://api.openrouter.ai/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        timeout: 7000, // 7 segundos
      }
    );

    const text = response.data?.choices?.[0]?.message?.content ?? "";

    res.json({ text });
  } catch (err) {
    console.error("Erro ao processar a mensagem:", err.response?.data || err.message);
    res.status(500).json({ text: "Erro ao processar a mensagem" });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Clicka-Empter backend rodando em http://localhost:${PORT}`);
});
