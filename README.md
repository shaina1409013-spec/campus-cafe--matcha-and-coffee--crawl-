# ☕ Campus Café — Matcha & Coffee Crawl

A student-focused web app that helps users discover nearby cafés, compare coffee and matcha prices, read reviews, save favourites, and track café visits while exploring the campus vibe.

## Project Overview

This project combines:

- A static frontend in `frontend/public/site/` for café browsing and dashboard pages
- Vercel serverless API routes in `api/` for authentication and database access
- MySQL and Drizzle database files in `database/`
- A TanStack Start + React app layer in `frontend/src/` for routing and UI shell

The main idea is simple: students can browse cafés, check drink prices, see which places are affordable, and manage personal activity like favourites and visits.

---

## Features

- Discover cafés around campus with ratings and details
- Browse drinks and matcha/coffee menu items by café
- Compare the cheapest coffee or matcha options
- Submit and read reviews with ratings
- Save favourite cafés and track visited cafés
- Login/signup with JWT authentication
- View personal dashboard with stats and history
- Works in demo mode even without MySQL setup

---

## Tech Stack

### Frontend
- HTML, CSS, JavaScript for static pages
- React + TypeScript via TanStack Start
- Tailwind CSS
- shadcn/ui + Radix UI
- Recharts for charts

### Backend
- Vercel serverless functions in `api/`
- MySQL database with `mysql2`
- JWT-based auth using `jsonwebtoken`
- Password hashing using `bcryptjs`

### Development Tools
- Vite
- Vitest
- ESLint + Prettier
- Drizzle ORM setup

---

## How the Project Works

The application follows a simple flow:

1. User opens the frontend pages from `frontend/public/site/`
2. Frontend sends requests to `/api/...` routes
3. API handlers connect to MySQL and process business logic
4. Authenticated users can save favourites, visits, and review history
5. Dashboard reads user-specific stats from the database

So the app is essentially:

Client (Browser) -> API Layer -> MySQL Database

---

## Project Structure

```text
cafe-project/
├── api/
│   ├── _db.js
│   ├── auth.js
│   ├── cafes.js
│   ├── drinks.js
│   ├── reviews.js
│   ├── interactions.js
│   └── dashboard.js
├── archive/
│   └── legacy-supabase-prototype/  # Older standalone prototype, preserved for reference
├── database/
│   ├── schema.sql
│   ├── coffee_crawl_data.sql
│   └── drizzle/
│       ├── schema.ts
│       └── migrations/
├── frontend/
│   ├── public/
│   │   ├── site/              # Main static HTML, CSS and JS pages
│   │   ├── templates/         # Static page templates
│   │   ├── css/               # Shared static stylesheets
│   │   ├── js/                # Shared static scripts
│   │   └── index.html         # Static landing page
│   └── src/
│       ├── routes/            # TanStack Start routes and root layout
│       ├── components/        # React UI components
│       ├── hooks/             # React hooks
│       ├── lib/               # Frontend utilities
│       ├── styles.css
│       └── server.ts
├── supabase/                   # Supabase CLI configuration for the main project
├── .env.example
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
├── drizzle.config.ts
├── tsconfig.json
├── .gitignore
├── README.md
└── README.lovable.md
```

> `api/` stays at the repository root because Vercel discovers serverless functions there. The frontend application and assets are grouped under `frontend/`; the main database schema and seed files are under `database/`. The older, standalone Supabase prototype is preserved under `archive/`.

---

## Database Design

The MySQL database is named `coffee_crawl` and contains tables like:

- `users` — account details and hashed passwords
- `cafes` — café list and metadata
- `drinks` — drinks tied to each café
- `reviews` — user reviews and ratings
- `favorites` — which cafés a user liked
- `visits` — which cafés a user visited

`database/schema.sql` creates the MySQL tables and inserts seed data for sample cafés, drinks, and reviews. `database/coffee_crawl_data.sql` is the additional SQL data dump. Drizzle's PostgreSQL schema and migrations are kept under `database/drizzle/`.

---

## Full Setup Steps

### 1. Install prerequisites

Make sure you have:

- Node.js 18 or newer
- MySQL 8.x
- npm

Optional:

- Bun if you want to use it instead of npm

### 2. Clone the project

```bash
git clone <repo-url>
cd cafe-project
```

### 3. Install dependencies

```bash
npm install
```

If you prefer Bun:

```bash
bun install
```

### 4. Create environment file

```bash
cp .env.example .env
```

Then update the `.env` file with your MySQL values and JWT secret:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=coffee_crawl
MYSQL_SSL=false
JWT_SECRET=replace_this_with_a_long_random_secret_string_at_least_32_chars
```

> Never commit `.env` to Git. Keep it local only.

### 5. Create the MySQL database and run schema

Open MySQL and run the SQL script:

```bash
mysql -u root -p < database/schema.sql
```

This creates the database and inserts demo seed data.

### 6. Start the development server

```bash
npm run dev
```

The project runs locally on the URL shown in the terminal (currently):

```text
http://localhost:8080
```

When you open the home page, the app redirects to `/site/index.html`. Vite serves the static pages from `frontend/public/` during development and copies them into the production build.

### 7. Demo mode

If MySQL connection is not configured, the app can still load with demo seed data. In that case, the frontend works, but changes are not permanently saved.

---

## API Overview

All API routes are served under `/api`.

### Auth API

- `POST /api/auth?action=signup`
- `POST /api/auth?action=login`
- `POST /api/auth?action=logout`

Used for user registration and login with JWT token-based authentication.

### Café API

- `GET /api/cafes`
- `GET /api/cafes?id=<cafe_id>`

Returns café data, menu, and rating info.

### Drink API

- `GET /api/drinks`
- `GET /api/drinks?cafe_id=<id>`

Returns all drinks or drinks for a single café.

### Review API

- `GET /api/reviews?cafe_id=<id>`
- `GET /api/reviews?cafe_name=<name>`
- `POST /api/reviews`

Used to list and create reviews.

### Interactions API

- `GET /api/interactions?table=favorites`
- `GET /api/interactions?table=visits`
- `POST /api/interactions?table=favorites&cafe_id=<id>`
- `POST /api/interactions?table=visits&cafe_id=<id>`

Used to toggle favourites and visited cafés for a logged-in user.

### Dashboard API

- `GET /api/dashboard`

Returns review count, saved favourites, and visit stats for the authenticated user.

---

## Local Development Workflow

A typical workflow for this project is:

1. Start MySQL and ensure database is created
2. Run `npm install`
3. Set `.env` variables
4. Import `database/schema.sql`
5. Run `npm run dev`
6. Open the app in the browser
7. Test login, reviews, favourites, and dashboard features
8. Build using `npm run build` before deployment

---

## Deployment (Vercel)

To deploy this app on Vercel:

1. Push the project to GitHub
2. Import the repository in Vercel
3. Add the same environment variables from `.env` in the Vercel dashboard
4. Deploy the app

Vercel automatically detects the serverless functions in the root `api/` directory. The frontend build serves files from `frontend/public/`; Vercel needs `api/` at the project root, so that directory intentionally remains outside `frontend/`.

---

## Useful Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run test
npm run test:watch
```

---

## Common Problems and Fixes

### MySQL connection fails
- Check if MySQL is running
- Confirm `.env` values are correct
- Make sure the database `coffee_crawl` exists

### JWT errors
- Ensure `JWT_SECRET` is set and long enough
- Use a strong random value, not a short placeholder

### App is blank or routes do not work
- Run `npm install` first
- Confirm `npm run dev` is running without errors
- Check browser console logs for missing API calls

### Data not persisting
- Some features only work when MySQL is configured correctly
- In demo mode, data may reset on restart

---

## Summary

This project is a complete campus café discovery platform with:

- frontend pages
- login/auth flow
- database-backed API
- pricing and review functionality
- user dashboard and tracking

It is a great example of a full-stack app built with a simple static UI, Node.js API routes, and MySQL persistence.

---

## Contributing

1. Create a new branch
2. Make your changes
3. Run lint/tests if needed
4. Open a pull request

---

## License

This project is intended for educational/demo use. Please check the repository for license terms if you plan to use it commercially.
