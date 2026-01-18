import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { processChat, isChatAvailable } from "../services/chat";

const app = new Hono();

// Request body validation schema
const chatBodySchema = z.object({
  message: z.string().min(1, "Message is required"),
  pocket_id: z.string().min(1, "pocket_id is required"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    generated_at: string;
  };
}

interface ChatResponse {
  response: string;
  tools_used: string[];
}

/**
 * POST /api/v1/chat
 * Send a message to the AI chatbot with transaction context
 */
app.post(
  "/",
  zValidator("json", chatBodySchema, (result, c) => {
    if (!result.success) {
      return c.json<ChatApiResponse<null>>(
        {
          success: false,
          error: result.error.issues.map((i) => i.message).join(", "),
        },
        400
      );
    }
  }),
  async (c) => {
    // Check if chat service is available
    if (!isChatAvailable()) {
      return c.json<ChatApiResponse<null>>(
        {
          success: false,
          error:
            "Chat service is not available. Please configure OPENROUTER_API_KEY and OPENROUTER_MODEL environment variables.",
        },
        503
      );
    }

    const { message, pocket_id, history } = c.req.valid("json");

    try {
      const result = await processChat(message, history, pocket_id);

      return c.json<ChatApiResponse<ChatResponse>>({
        success: true,
        data: {
          response: result.response,
          tools_used: result.toolsUsed,
        },
        meta: {
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      return c.json<ChatApiResponse<null>>(
        {
          success: false,
          error: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }
);

/**
 * GET /api/v1/chat/status
 * Check if chat service is available
 */
app.get("/status", (c) => {
  return c.json({
    success: true,
    data: {
      available: isChatAvailable(),
      model: process.env.OPENROUTER_MODEL || null,
    },
  });
});

export default app;
