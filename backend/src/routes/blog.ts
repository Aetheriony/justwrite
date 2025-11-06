import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { HfInference } from '@huggingface/inference';
import { verify } from "hono/jwt";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authMiddleware } from "../Authmiddleware";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
        GEMINI_API_KEY: string;
    },
    Variables: {
        userId: string;
    }
}>();



blogRouter.post('/publish', authMiddleware, async (c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const authorId = Number(c.get("userId"));
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: Number(authorId)
        }
    })

    return c.json({
        id: blog.id
    })
})


blogRouter.put('/update/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));

    const userId = Number(c.get('userId')); // Get user ID from middleware context
    const body = await c.req.json();

    // Initialize Prisma client
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Validate the input
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411); // Length Required - Appropriate status code for validation issues
        return c.json({
            message: "Invalid inputs provided."
        });
    }

    try {
        // Find the blog to check if it belongs to the user
        const blog = await prisma.blog.findFirst({
            where: {
                id: id,
                authorId: userId,
            }
        });

        if (!blog) {
            c.status(403); // Forbidden - User is not authorized to update this blog
            return c.json({
                message: 'You are not authorized to update this blog.',
            });
        }

        // Update the blog
        const updatedBlog = await prisma.blog.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        });

        return c.json({
            id: updatedBlog.id
        });
    } catch (e) {
        console.error(e); // Log the error for debugging
        c.status(500); // Internal Server Error
        return c.json({
            message: "Error while updating blog post."
        });
    }
});

//delete route--------------

blogRouter.delete('/delete/:id', authMiddleware, async (c) => {
    const id = Number(c.req.param('id'));
    const authorId = Number(c.get('userId')); // Get user ID from middleware context

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        // Find the blog to check if it belongs to the user
        const blog = await prisma.blog.findFirst({
            where: {
                id: id,
                authorId: Number(authorId),
            }
        });

        if (!blog) {
            c.status(403);
            return c.json({
                message: 'You are not authorized to delete this blog',
            });
        }


        await prisma.blog.delete({
            where: {
                id: id
            }
        });

        return c.json({
            message: 'Blog deleted successfully',
        });
    } catch (e) {
        console.error('Error deleting blog:', e);
        c.status(500);
        return c.json({
            message: 'Internal server error',
        });
    }
});




// Todo: add pagination
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return c.json({
            blog
        });
    } catch (e) {
        c.status(411); // 4
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})


// Route to get top picks---------------

blogRouter.get('/top-picks', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        // Fetch top picks from the database
        const topPicks = await prisma.blog.findMany({
            take: 5, // Number of top picks to fetch
            orderBy: {
                createdAt: 'desc', // Adjust the ordering as needed
            },
            select: {
                id: true,
                title: true,
            },
        });

        return c.json(topPicks);
    } catch (error) {
        console.error("Error fetching top picks:", error);
        c.status(500);
        return c.json({ message: "Internal Server Error" });
    }
});

blogRouter.post("/with-ai", authMiddleware, async (c) => {
    try {
        const { title } = await c.req.json();

        if (!title) {
            return c.json({ error: "Title is required" }, 400);
        }

        const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Write a detailed blog post titled "${title}".
      - Include an introduction, a few main paragraphs, and a conclusion.
      - Write in plain text (no markdown, lists, or symbols).
      - Keep it informative and engaging.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return c.json({ content: text });
    } catch (error) {
        console.error("Error generating content:", error);
        return c.json({ error: "Failed to generate content" }, 500);
    }
});
