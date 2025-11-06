import { Hono } from 'hono'
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors'
import { recommendationRouter } from './routes/recommendation';
import { userActionsRouter } from './routes/userActionsRouter';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();


app.use('/*', cors())
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/users", recommendationRouter);
app.route("/api/v1/user-actions", userActionsRouter);

export default app
