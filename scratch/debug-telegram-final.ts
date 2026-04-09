import "dotenv/config";

async function debugTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log("--- DEBUG TELEGRAM ---");
  console.log("TOKEN:", token ? "PRESENTE (Censurado)" : "FALTANTE");
  console.log("CHAT_ID:", chatId || "FALTANTE");

  if (!token || !chatId) {
    console.error("Faltan variables de entorno.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  console.log("Llamando a:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🚨 <b>TEST DE DEPURACIÓN</b>\nSi recibes esto, la configuración es 100% correcta.",
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    console.log("STATUS:", response.status);
    console.log("RESULTADO:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ ¡MENSAJE ENVIADO CON ÉXITO!");
    } else {
      console.error("❌ FALLO EN EL ENVÍO.");
      if (result.description === "Forbidden: bot was blocked by the user") {
        console.error("CONSEJO: Has bloqueado al bot o nunca le has dado a 'Iniciar'.");
      } else if (result.description === "Bad Request: chat not found") {
        console.error("CONSEJO: El Chat ID es incorrecto o el bot no tiene permiso para hablarte.");
      }
    }
  } catch (error: any) {
    console.error("💥 ERROR FATAL:", error.message);
  }
}

debugTelegram();
