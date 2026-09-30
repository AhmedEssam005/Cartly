You are working on my Cartly marketplace backend.

Before writing or changing any code, study the entire repository and understand the existing architecture, schema, modules, routes, middleware, authentication, validation, logging, and database relationships.

Do NOT immediately start coding.

## 1. Project overview

Cartly is a modern multi-vendor marketplace.

The backend is built with:

- Node.js
- Express
- PostgreSQL hosted on Supabase
- Drizzle ORM
- Supabase Auth
- JavaScript

Architecture:

Routes
→ Controllers
→ Services
→ Drizzle/PostgreSQL

There is intentionally **no repository layer**.

The backend will eventually support:

- Customers/buyers
- Sellers
- Administrators/moderators
- Product catalog
- Seller listings
- Shopping carts
- Guest carts
- Orders
- Payments
- Reviews
- Marketplace/storefront functionality
- Administration/moderation

The backend is being built first, with the frontend/mobile applications coming later.

---

# 2. Important Cartly domain rules

## Catalog vs Listing

The catalog represents:

> What the product is.

Seller listings represent:

> How a particular seller is selling that product.

`catalog_products` are canonical marketplace products.

Seller listings reference an existing catalog product and contain seller-specific information such as:

- SKU
- Price
- Inventory
- Active/inactive state

A seller cannot modify the canonical product information through a listing.

If a product does not exist in the catalog, the seller submits a catalog submission for admin/moderator review.

---

## Images

Catalog product images belong to the canonical product.

Seller listings currently use the catalog product's images.

Do not reintroduce seller-specific listing images unless there is a clear reason and I approve it.

---

## Categories

Catalog products and categories have a many-to-many relationship.

Categories can also have parent/child relationships.

---

## Cart

Cart supports:

- Authenticated users
- Guest users through a session token
- Guest → authenticated cart merging

Cart does NOT reserve inventory.

Inventory is validated and locked during checkout/order creation.

---

## Orders

An order belongs to one customer but can contain listings from multiple sellers.

The structure is:

```text
Order
├── Order Address
└── Order Seller
    └── Order Listing
```

`order_address` is an immutable snapshot of the shipping address at checkout.

`order_seller` separates the marketplace order by seller.

`order_listing` stores:

- listing
- quantity
- historical unit price

The historical price is important because seller listing prices can change after an order is created. you

---

## Payments

For now, payment is intentionally MOCK/MANUAL.

Do NOT integrate Paymob yet.

The intended temporary flow is:

```text
Order
↓
Pending payment
↓
Admin manually approves/rejects
↓
Payment status changes
↓
Order state changes appropriately
```

Later, the manual approval mechanism can be replaced with real Paymob integration.

Never store card numbers, CVVs, or other sensitive payment credentials.

---

# 3. Modules already implemented

Audit the repository to verify these, but they should already exist:

### Foundation

- Express/server setup
- Environment configuration
- Database connection
- Drizzle ORM
- Migrations
- Logging
- Error handling
- Validation
- Authentication middleware

### Authentication/Profile

- Supabase authentication integration
- User/profile handling
- Seller information/KYC foundation

### Categories

Implemented.

Expected functionality includes:

- Create category
- Get category/categories
- Update category
- Delete category
- Parent category relationships

### Catalog Products

Implemented.

Includes:

- Catalog product creation/update
- Product categories
- Product images
- GTIN
- Hidden/archived products
- Product retrieval

### Catalog Submissions

Implemented.

Seller can submit a product that doesn't exist in the catalog.

Admin/moderator can review the submission.

### Seller Listings

Implemented.

Seller can:

- Create listing for an existing catalog product
- Update listing-specific information
- Retrieve their listings
- Retrieve listing details

### Image handling

Implemented.

Multer/Sharp upload processing and storage utilities exist.

### Cart

Implemented.

Includes:

- Get cart
- Add item
- Remove item
- Decrease quantity
- Guest cart
- Guest → authenticated cart merge
- Inventory validation when adding items

### Orders

Currently being implemented.

`createOrder` has already been implemented.

### Payments

Not fully implemented yet.

### Reviews

Not implemented yet.

---

# 4. Modules/functionality that still need to be audited and/or implemented

Do NOT assume this list is complete.

Compare it against the actual repository and tell me what exists/missing.

## A. Orders

Potential functionality:

Customer:

```text
GET    /api/orders
GET    /api/orders/:orderId
POST   /api/orders
```

Seller:

```text
GET    /api/seller/orders
GET    /api/seller/orders/:orderSellerId
PATCH  /api/seller/orders/:orderSellerId/status
```

Possible customer order cancellation:

```text
PATCH  /api/orders/:orderId/cancel
```

Do not automatically implement every route above.

First determine which operations make sense with the existing schema and business rules.

---

# B. Payments

For the current MOCK payment system, investigate routes such as:

Customer:

```text
POST   /api/orders/:orderId/payment
GET    /api/orders/:orderId/payment
```

Admin:

```text
GET    /api/admin/payments
GET    /api/admin/payments/:paymentId
PATCH  /api/admin/payments/:paymentId/approve
PATCH  /api/admin/payments/:paymentId/reject
```

These are possible routes, not requirements.

Study the existing code and determine the appropriate final route structure.

The admin must be the authority that manually approves/rejects the mock payment.

---

# C. Reviews

Reviews are not implemented yet.

The existing design is:

- Reviews belong to a listing
- A review should be associated with a purchased listing/order
- Review images exist
- Review likes exist

Potential routes:

```text
POST   /api/listings/:listingId/reviews
GET    /api/listings/:listingId/reviews
GET    /api/reviews/:reviewId
PATCH  /api/reviews/:reviewId
DELETE /api/reviews/:reviewId

POST   /api/reviews/:reviewId/like
DELETE /api/reviews/:reviewId/like
```

Before implementing reviews, determine how purchase eligibility should be verified from the existing order tables.

A customer should not be able to review a listing they never purchased.

---

# D. Admin

There is currently no complete Admin module.

This is important.

The project needs administrative functionality for marketplace moderation and management.

Potential admin responsibilities include:

### Catalog moderation

```text
GET    /api/admin/catalog-submissions
GET    /api/admin/catalog-submissions/:submissionId
PATCH  /api/admin/catalog-submissions/:submissionId/approve
PATCH  /api/admin/catalog-submissions/:submissionId/reject
```

### Catalog management

```text
POST   /api/admin/catalog-products
PATCH  /api/admin/catalog-products/:productId
PATCH  /api/admin/catalog-products/:productId/hide
PATCH  /api/admin/catalog-products/:productId/show
```

### Categories

Potentially:

```text
POST   /api/admin/categories
PATCH  /api/admin/categories/:categoryId
DELETE /api/admin/categories/:categoryId
```

depending on how the existing category routes are structured.

### Payments

```text
GET    /api/admin/payments
GET    /api/admin/payments/:paymentId
PATCH  /api/admin/payments/:paymentId/approve
PATCH  /api/admin/payments/:paymentId/reject
```

### Seller/KYC management

The existing schema has seller KYC information.

Potential functionality:

```text
GET    /api/admin/sellers
GET    /api/admin/sellers/:sellerId
PATCH  /api/admin/sellers/:sellerId/kyc/approve
PATCH  /api/admin/sellers/:sellerId/kyc/reject
```

Do not implement these blindly.

First inspect the existing seller/KYC schema and determine what operations are actually supported.

---

# E. Storefront / Customer browsing

There is currently no complete Storefront module.

This is different from the admin/catalog-management side.

The storefront is what the eventual web/mobile clients will use to browse the marketplace.

Potential routes include:

### Products

```text
GET /api/storefront/products
GET /api/storefront/products/:productId
```

With things such as:

- Search
- Pagination
- Category filtering
- Brand filtering
- Price filtering
- Sorting
- Availability
- Product images

### Categories

```text
GET /api/storefront/categories
GET /api/storefront/categories/:categoryId
```

### Listings / offers

A product may have multiple sellers.

Potentially:

```text
GET /api/storefront/products/:productId/listings
GET /api/storefront/listings/:listingId
```

The storefront should expose appropriate public information without exposing internal/admin-only data.

Do not simply expose database rows directly.

Determine the correct response shape from the existing architecture.

---

# F. Seller module

Audit whether seller-specific functionality is complete.

Potential areas:

```text
GET   /api/seller/profile
PATCH /api/seller/profile

GET   /api/seller/listings
POST  /api/seller/listings
GET   /api/seller/listings/:listingId
PATCH /api/seller/listings/:listingId

POST  /api/seller/catalog-submissions
GET   /api/seller/catalog-submissions
GET   /api/seller/catalog-submissions/:submissionId
```

Again, inspect the repository first.

Do not duplicate routes that already exist.

---

# G. User addresses

Audit the existing address functionality.

Potential routes:

```text
GET    /api/addresses
POST   /api/addresses
GET    /api/addresses/:addressId
PATCH  /api/addresses/:addressId
DELETE /api/addresses/:addressId
```

Orders already use an address ID at checkout and snapshot the address into `order_address`.

Verify that the address module correctly enforces ownership.

---

# H. User/profile functionality

Audit whether users can:

```text
GET   /api/profile
PATCH /api/profile
```

Do not duplicate Supabase Auth responsibilities unnecessarily.

Remember that Supabase Auth owns authentication credentials, while the application's profile tables contain marketplace-specific profile information.

---

# 5. Important audit requirement

After studying the repository, produce a table like:

| Module              | Existing | Complete | Missing | Notes |
| ------------------- | -------- | -------- | ------- | ----- |
| Auth                | ?        | ?        | ?       |       |
| Profile             | ?        | ?        | ?       |       |
| Categories          | ?        | ?        | ?       |       |
| Catalog Products    | ?        | ?        | ?       |       |
| Catalog Submissions | ?        | ?        | ?       |       |
| Seller Listings     | ?        | ?        | ?       |       |
| Images              | ?        | ?        | ?       |       |
| Cart                | ?        | ?        | ?       |       |
| Addresses           | ?        | ?        | ?       |       |
| Orders              | ?        | ?        | ?       |       |
| Payments            | ?        | ?        | ?       |       |
| Reviews             | ?        | ?        | ?       |       |
| Seller              | ?        | ?        | ?       |       |
| Admin               | ?        | ?        | ?       |       |
| Storefront          | ?        | ?        | ?       |       |

Also list:

### Missing routes

Give me the routes that are actually missing based on the repository.

### Missing modules

Give me modules that don't exist yet.

### Schema/code inconsistencies

Point out any mismatch between:

- Schema
- Services
- Controllers
- Routes
- Business rules

### Transaction/concurrency concerns

Identify any transaction or concurrency issues you find.

Do not silently fix these during the audit.

---

# 6. Implementation order

After the audit, use this order unless the repository reveals a dependency that requires changing it:

1. Finish Orders
2. Mock Payments + Admin payment approval
3. Admin module
4. Storefront/customer browsing
5. Reviews
6. Complete remaining Seller/User/Address functionality
7. Final integration audit

The goal is to finish the backend quickly, so avoid unnecessary abstractions and overengineering.

---

# 7. Learning rule

I want you to implement most of the remaining work.

However, whenever you encounter a genuinely new concept that I have not used before, STOP before implementing that specific part and explain it to me.

Examples:

- New Drizzle features
- PostgreSQL row locking
- Advanced transaction patterns
- Race-condition handling
- Idempotency
- Payment state machines
- Webhooks
- External API integration
- Retry strategies
- Advanced authorization
- Complex query optimization

Explain:

1. What it is
2. Why we need it
3. How it works
4. Why we're using it here
5. Important pitfalls/trade-offs

Then wait for my approval before implementing that part.

Do NOT explain concepts I already know or stop for ordinary CRUD code.

---

# 8. Code-change rules

- Do not introduce a repository layer.
- Do not rewrite working modules unnecessarily.
- Do not change established response shapes without a reason.
- Do not add unnecessary comments.
- Do not add unrelated features.
- Do not modify schema unless required.
- If a schema change is required, explain it before making it.
- Reuse existing authentication, validation, error handling, logging, and middleware.
- Follow the existing project conventions.
- Study the existing code before deciding how something should be implemented.

Most importantly:

**Do not assume a module exists just because it was listed above. The repository is the source of truth.**
