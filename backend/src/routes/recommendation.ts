import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { authMiddleware } from "../Authmiddleware";

export const recommendationRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: number;
  };
}>();



recommendationRouter.post("/recommendations", authMiddleware,async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const { action, blogId } = await c.req.json();
    const userId = Number(c.get("userId"));

    if (!action || !blogId) {
      c.status(400);
      return c.json({ message: "Missing required fields: action or blogId." });
    }

    const existing = await prisma.recommendation.findUnique({
      where: {
        userId_blogId: { userId, blogId },
      },
    });

    let message = "";

    if (action === "INCREASE_RECOMMENDATION") {
      if (!existing) {
        await prisma.recommendation.create({
          data: { userId, blogId, action },
        });

        await prisma.blog.update({
          where: { id: blogId },
          data: { recommendationCount: { increment: 1 } },
        });
      }
      message = "Got it, we'll recommend more stories like this!";
    }
    else if (action === "DECREASE_RECOMMENDATION") {
      if (existing) {
        await prisma.recommendation.delete({
          where: {
            userId_blogId: { userId, blogId },
          },
        });

        await prisma.blog.update({
          where: { id: blogId },
          data: { recommendationCount: { decrement: 1 } },
        });
      }
      message = "Got it, we'll recommend fewer like this. You can additionally take any of the actions below.";
    }
    else {
      c.status(400);
      return c.json({ message: "Invalid action type." });
    }

    return c.json({ message });
  } catch (err: any) {
    console.error("Error handling recommendation:", err);
    c.status(500);
    return c.json({
      message: "Something went wrong while processing your recommendation.",
      error: err.message,
    });
  }
});
