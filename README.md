
   
## Backend

Check the app: [JustWrite](https://justwrite-yhimanshu220456.vercel.app/signup)

### What to do in the Future

1. Logout route
2. Dashboard Implementation
3. Authentication using Google
4. Search Functionality
5. Integrate AI for writing blogs

### Database Setup

- Hosting: The backend database is hosted on [Render](https://render.com/). Initially attempted with Avian but encountered migration errors with Prisma.

### Prisma Accelerate

- Connection Pooling: Utilizing Prisma Accelerate for optimized database connection pooling.

### Configuration

- Database URL:
  - Prisma Accelerate URL: Configure in `wrangler.toml`.
    ```toml
    # wrangler.toml
    prisma_accelerate_url = "<your_prisma_accelerate_url>"
    ```
  - Render URL: Store in `.env` file for local and deployment configurations.
    ```dotenv
    # .env
    DATABASE_URL="<your_render_database_url>"
    ```

### Deployment Steps

1. Database Migration: Use `prisma migrate` for managing schema migrations after any schema changes.
   
   ```bash
   npx prisma migrate dev --name initial
2. sma Client Generation:
   
   ```bash
   npx prisma generate --no-engine

3. Deploy to cloudflare: Use `prisma migrate` for managing schema migrations after any schema changes.
   
   ```bash
   npm run deploy

What Features I Added:  
1.Logo Font: Updated for a new look.  
2.Dark Theme: Switched from white to dark mode.  
3.Gemini API: Integrated for blog generation.  
4.Toast Notifications: Added for user feedback.  
5.Logout Functionality: Implemented for secure session exit.  
6.FullBlog Enhancements:  
   1.Added dropdown menu on the left.  
   2.Included Top Picks, Recommended Blogs, and a Reading List on the right.   
7. Added delete functionality  
8.    
