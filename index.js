// index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

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
    const response = await fetch("https://api.openrouter.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ text: "Erro ao contatar OpenRouter" });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    res.json({ text });
  } catch (err) {
    console.error("Erro ao processar a mensagem:", err);
    res.status(500).json({ text: "Erro ao processar a mensagem" });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Clicka-Empter backend rodando em http://localhost:${PORT}`);
});
