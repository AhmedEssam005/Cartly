# 🛒 Cartly

Cartly is a **multi-vendor marketplace backend**: a shared product catalog that independent sellers list against with their own price, stock, and SKU, similar to Amazon's or Etsy's seller model. Built with Node.js, Express, and PostgreSQL (Drizzle ORM), with Supabase handling auth and file storage.

## ✨ Features

- **Two-layer product model:** a shared **Catalog Product** (title, brand, images, categories) plus **Seller Listings** (each seller's own price, stock, SKU), so the same product can be sold by many sellers at different prices
- **Moderated catalog:** sellers submit new products, admins approve or reject them with a comment, and approved submissions become live catalog products automatically
- **Role-based access:** Buyer, Seller, and Admin
- **Guest + logged-in carts:** anonymous carts via a `sessionToken` cookie, with a merge endpoint after login
- **Multi-seller checkout:** one order is split into per-seller sub-orders, each with its own subtotal, platform fee, and fulfillment status
- **Payments:** payment initiation and status tracking, plus an admin review queue for manual payments
- **Reviews:** buyers can review listings (edit, delete, like)
- **Seller KYC:** admins approve sellers before they can sell
- **Image uploads:** processed with `sharp` and stored in Supabase Storage

## 🧰 Tech Stack

| Area         | Tools                                 |
| ------------ | ------------------------------------- |
| Runtime      | Node.js, Express 5                    |
| Database     | PostgreSQL, Drizzle ORM               |
| Auth         | Supabase Auth (JWT verified via JWKS) |
| File storage | Supabase Storage                      |
| Validation   | express-validator                     |
| Uploads      | multer + sharp                        |
| Logging      | winston + morgan                      |
| Security     | helmet, cors                          |
| Container    | Docker                                |

## 👥 Roles

- **Buyer:** browses, carts, checks out, tracks orders, pays, leaves reviews
- **Seller:** submits products for approval, manages listings, fulfills their own orders
- **Admin:** approves sellers, moderates submissions, manages the catalog and category tree, reviews manual payments

## 🗂 Data Model Highlights

- **Order splitting:** one checkout can produce several per-seller sub-orders and shipments
- **Historical pricing:** order items keep the price at time of purchase
- **Address snapshots:** an order's shipping address is a frozen copy taken at checkout
- **Currency:** prices are stored as integer piasters (1/100 EGP) and converted to EGP at the API boundary

## ⚙️ Prerequisites

- A **Supabase project** with Auth and Storage enabled
- Use **that project's PostgreSQL database** for `DB_URL`. The `profile` table has a foreign key into Supabase's `auth.users`, so a standalone Postgres database will fail migrations.
- Docker, or Node.js 20+ if running without Docker

## 🔐 Environment Variables

Copy `.example.env` to `.env` and fill it in:

```bash
cp .example.env .env
```

```env
NODE_ENV=development                # or production
PORT=3000
DB_URL=postgresql://...             # Supabase project's Postgres connection string
SUPABASE_API_LINK=https://xxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=...        # Supabase anon/publishable key
SUPABASE_SECRET_KEY=...             # Supabase service role key (keep private)
```

## 🚀 Getting Started

> ⚠️ **Warning:** Run the database migrations **once before the first start**, otherwise the app will fail because the tables don't exist.
> Migrations must be applied to your **Supabase** database (see Prerequisites).

### Option 1: Pull from Docker Hub

```bash
docker pull ahmedessam05/cartly:V1.0

# 1. Apply migrations (first time only)
docker run --rm --env-file .env ahmedessam05/cartly:V1.0 npm run db:migrate

# 2. Start the app
docker run -p 3000:3000 --env-file .env ahmedessam05/cartly:V1.0
```

### Option 2: Build the Docker image yourself

```bash
git clone https://github.com/AhmedEssam005/Cartly.git
cd Cartly
cp .example.env .env        # then edit .env

docker build -t cartly .

docker run --rm --env-file .env cartly npm run db:migrate   # first time only
docker run -p 3000:3000 --env-file .env cartly
```

### Option 3: Run locally without Docker

```bash
git clone https://github.com/AhmedEssam005/Cartly.git
cd Cartly
npm install
cp .example.env .env        # then edit .env

npm run db:migrate          # first time only
npm run dev                 # or: npm start
```

The API will be available at `http://localhost:3000`.

## 📜 Scripts

| Command               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Start the server with nodemon                        |
| `npm start`           | Start the server                                     |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate`  | Apply pending migrations                             |

## 🔌 API Overview

All routes are prefixed with `/api`. Authenticated routes expect `Authorization: Bearer <supabase-jwt>`. Cart routes also accept a `sessionToken` cookie for guests.

| Base path                          | Covers                                        |
| ---------------------------------- | --------------------------------------------- |
| `/api/auth`                        | Registration, current user                    |
| `/api/profile`                     | Buyer addresses                               |
| `/api/categories`                  | Category tree (admin write access)            |
| `/api/catalog`                     | Catalog products (admin write access)         |
| `/api/catalog-submissions`         | Seller product submissions                    |
| `/api/seller-listings`             | Seller-owned listings                         |
| `/api/storefront`                  | Public product and category browsing          |
| `/api/cart`                        | Cart (guest or logged-in)                     |
| `/api/orders`                      | Checkout, order history, fulfillment, payment |
| `/api/admin`                       | Seller KYC, moderation, catalog management    |
| `/api/admin/payments`              | Manual payment review queue                   |
| `/api/listings/:listingId/reviews` | Reviews for a listing                         |
| `/api/reviews/:reviewId`           | Single review (edit, delete, like)            |

## 🗂 Project Structure

```
src/
  app.js            Express setup, middleware, route mounting
  configs/          Supabase clients, multer, winston
  db/               Drizzle schema
  middlewares/      Auth guards, validation, logging
  modules/          auth, profile, category, catalog, catalogSubmission,
                    sellerListing, storefront, cart, order, payment,
                    review, admin
  utils/            Image upload helpers
server.js           Entry point
drizzle/            Generated SQL migrations
```

Each module follows the same shape: `route → controller → service`, with a `validator` for request validation.

## 🌍 Deployment Notes

> ⚠️ **Row Level Security (RLS) is NOT enabled by default.** Tables created by the migrations have RLS disabled, and Supabase exposes tables in the `public` schema through its auto-generated Data API. Anyone holding your publishable key could read or modify them directly, bypassing this backend entirely. Enable RLS on every table before going to production.

- **Lock down CORS** to your frontend origin(s). It currently allows all origins.
