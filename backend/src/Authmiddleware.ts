import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header('authorization');

    // Step 1: Check if header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        c.status(403);
        return c.json({ message: 'Authorization header missing or invalid' });
    }

    // Step 2: Extract only the token part
    const token = authHeader.split(' ')[1];

    try {
        // Step 3: Verify token using your secret
        const user = await verify(token, c.env.JWT_SECRET) as { id: number };

        // Step 4: If valid, attach userId to context
        c.set('userId', user.id);
        await next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        c.status(403);
        return c.json({ message: 'Invalid or expired token' });
    }
}
