const axios = require("axios");
const { RateLimiterMemory } = require('rate-limiter-flexible');
const systemPromptProduts = require("../system/systemPromptProduts");

// Configuração do rate limiting por usuário
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requisições
  duration: 60, // por 60 segundos
});

async function askOpenRouter(message, history = [], userId = 'default') {
  console.log("🟢 Nova requisição recebida");
  console.log("Mensagem recebida:", message);
  console.log("Histórico recebido:", history);
  console.log("User ID:", userId);

  try {
    // 1. Verificar rate limiting
    try {
      await rateLimiter.consume(userId);
      console.log(`✅ Usuário ${userId} dentro do limite de requisições`);
    } catch (limiterRes) {
      console.warn(`⚠️ Rate limit excedido para o usuário ${userId}`);
      return "Por favor, espere um momento antes de enviar mais mensagens. Estou processando suas solicitações.";
    }

    // 2. Validar tamanho da mensagem
    if (message.length > 500) {
      console.warn(`⚠️ Mensagem muito longa do usuário ${userId}`);
      return "Sua mensagem é muito longa. Por favor, seja mais breve e objetivo para que eu possa ajudar melhor.";
    }

    // 3. Limitar o histórico de conversa
    const limitedHistory = history.slice(-4); // Manter apenas as últimas 4 interações
    console.log("Histórico limitado:", limitedHistory);

    const messages = [
      { role: "system", content: systemPromptProduts },
      ...limitedHistory,
      { role: "user", content: message.substring(0, 500) }, // Cortar mensagem muito longa
    ];
    console.log("Mensagens enviadas para OpenRouter:", messages);

    // 4. Chamada à API do OpenRouter
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
       model: "gpt-4o-mini",
        messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    console.log("Resposta completa do OpenRouter:", response.data);

    const responseContent = response.data.choices[0].message.content;
    console.log("Conteúdo retornado:", responseContent);

    return responseContent.substring(0, 500);

  } catch (error) {
    console.error("❌ Error calling OpenRouter:", error.message);

    if (error.response) {
      console.error("📡 Status da resposta:", error.response.status);
      console.error("📦 Dados da resposta:", JSON.stringify(error.response.data, null, 2));
    }

    if (error.response && error.response.status === 429) {
      return "Estou recebendo muitas solicitações no momento. Por favor, tente novamente em alguns instantes.";
    }

    return "Houve um problema ao processar sua mensagem. Por favor, reformule sua pergunta.";
  }
}

module.exports = { askOpenRouter };
