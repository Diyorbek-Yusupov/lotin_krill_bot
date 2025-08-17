import { webhookCallback } from "grammy";
import { initializeBot } from "../src/bot";
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const bot = await initializeBot();
    const handleUpdate = webhookCallback(bot, "http", {
      timeoutMilliseconds: 10000,
    });

    // Call the handler with request and response
    await handleUpdate(req, res);
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
