/**
 * Simple Telegram Bot API Helper
 */

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID. Skipping...");
    return { success: false };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Telegram] Error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Telegram] Fatal Error:", error.message);
    return { success: false, error: error.message };
  }
}
