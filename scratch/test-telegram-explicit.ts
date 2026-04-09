import "dotenv/config";
import { sendTelegramMessage } from "@/lib/utils/telegram";

async function testExplicit() {
  console.log("Checking ENV variables...");
  console.log("TOKEN present:", !!process.env.TELEGRAM_BOT_TOKEN);
  console.log("CHAT_ID present:", !!process.env.TELEGRAM_CHAT_ID);
  
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.error("Missing ENV variables in current process environment.");
    return;
  }

  console.log("Sending test message...");
  const res = await sendTelegramMessage("<b>Test Directo desde Antigravity</b>\nSi lees esto, las credenciales son correctas.");
  
  if (res.success) {
    console.log("SUCCESS: Message sent!");
  } else {
    console.error("FAILED:", JSON.stringify(res.error, null, 2));
  }
}

testExplicit();
