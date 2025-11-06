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


function getPrisma(c: any) {
    return new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
}

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


blogRouter.put("/update/:id", authMiddleware, async (c) => {
    const blogId = Number(c.req.param("id"));
    const body = await c.req.json();

    // Validate request
    const parsed = updateBlogInput.safeParse({ ...body, id: blogId });
    if (!parsed.success) {
        c.status(400);
        return c.json({ message: "Invalid input format" });
    }

    const prisma = getPrisma(c);

    try {
        // Verify that the blog belongs to the logged-in user
        const existingBlog = await prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true },
        });

        if (!existingBlog || existingBlog.authorId !== c.get("userId")) {
            c.status(403);
            return c.json({ message: "You are not authorized to edit this blog." });
        }

        // Update the blog
        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: {
                title: body.title,
                content: body.content,
            },
        });

        return c.json({
            message: "Blog updated successfully!",
            blog: updatedBlog,
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        c.status(500);
        return c.json({ message: "Failed to update blog." });
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
    const prisma = getPrisma(c);

    try {
        const blogs = await prisma.blog.findMany({
            orderBy: {
                createdAt: 'desc', // 👈 newest first
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true, 
                    },
                },
            },
        });
        return c.json({ blogs });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        c.status(500);
        return c.json({ message: "Failed to fetch blogs" });
    }
});

blogRouter.get('/:id', async (c) => {
    const id = Number(c.req.param("id"));
    const prisma = getPrisma(c);

    try {
        // Validate ID
        if (isNaN(id)) {
            c.status(400);
            return c.json({ message: "Invalid blog ID." });
        }

        // ✅ Fetch complete blog with author info
        const blog = await prisma.blog.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        if (!blog) {
            c.status(404);
            return c.json({ message: "Blog not found." });
        }

        // ✅ Return full blog object
        return c.json(blog);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        c.status(500);
        return c.json({ message: "Internal Server Error." });
    }
});


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
        // Ensure you use a GA model name like gemini-2.5-flash as previously discussed
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Generate a detailed, informative, and engaging blog post on the topic "${title}".
            
         INSTRUCTION: DO NOT include the title in the generated text. Start your response directly with the introduction paragraph.
            
            - Structure the response with an introduction, several main body sections (using ## for section titles), and a conclusion.
            - Format the entire response using standard Markdown.
            - Use appropriate Markdown headings (##), bold text (**), and lists (*) for structure.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // The text variable will now contain the content with Markdown syntax
        return c.json({ content: text });
    } catch (error) {
        console.error("Error generating content:", error);
        return c.json({ error: "Failed to generate content" }, 500);
    }
});

