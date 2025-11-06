import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { authMiddleware } from "../Authmiddleware";

export const userActionsRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: number;
  };
}>();

// Helper to get Prisma instance
const getPrisma = (c: any) =>
  new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

// -------------------------------
// 📌 FOLLOW AUTHOR
// -------------------------------
userActionsRouter.post("/follow/:authorId", authMiddleware, async (c) => {
  const followerId = c.get("userId");
  const followingId = Number(c.req.param("authorId"));
  const prisma = getPrisma(c);

  try {
    if (followerId === followingId) {
      c.status(400);
      return c.json({ message: "You cannot follow yourself." });
    }

    // Upsert the follow relation
    await prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      update: {},
      create: { followerId, followingId },
    });

    // Get follower details
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true, username: true },
    });


    return c.json({
      message: "You are now following this author.",
    });
  } catch (error) {
    console.error("Error in follow:", error);
    c.status(500);
    return c.json({ message: "Failed to follow author." });
  }
});

// -------------------------------
// 📌 UNFOLLOW AUTHOR
// -------------------------------
userActionsRouter.delete("/unfollow/:authorId", authMiddleware, async (c) => {
  const followerId = c.get("userId");
  const followingId = Number(c.req.param("authorId"));
  const prisma = getPrisma(c);

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true, username: true },
    });



    return c.json({
      message: "You unfollowed this author.",
    });
  } catch (error) {
    console.error("Error in unfollow:", error);
    c.status(500);
    return c.json({ message: "Failed to unfollow author." });
  }
});

// -------------------------------
// 📌 MUTE AUTHOR
// -------------------------------
userActionsRouter.post("/mute/:authorId", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const mutedUserId = Number(c.req.param("authorId"));
  const prisma = getPrisma(c);

  try {
    if (userId === mutedUserId) {
      c.status(400);
      return c.json({ message: "You cannot mute yourself." });
    }

    await prisma.mute.upsert({
      where: {
        userId_mutedUserId: { userId, mutedUserId },
      },
      update: {},
      create: { userId, mutedUserId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true },
    });

 

    return c.json({
      message: "Author has been muted successfully.",
    });
  } catch (error) {
    console.error("Error in mute:", error);
    c.status(500);
    return c.json({ message: "Failed to mute author." });
  }
});

// -------------------------------
// 📌 UNMUTE AUTHOR
// -------------------------------
userActionsRouter.delete("/unmute/:authorId", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const mutedUserId = Number(c.req.param("authorId"));
  const prisma = getPrisma(c);

  try {
    await prisma.mute.delete({
      where: {
        userId_mutedUserId: { userId, mutedUserId },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true },
    });



    return c.json({
      message: "You unmuted this author.",
    });
  } catch (error) {
    console.error("Error in unmute:", error);
    c.status(500);
    return c.json({ message: "Failed to unmute author." });
  }
});

userActionsRouter.get("/notifications", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });

    return c.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    c.status(500);
    return c.json({ message: "Failed to fetch notifications." });
  }
});
