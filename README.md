# Steam Games Backend API (Production-Grade MVC Engine)

This repository contains the complete, production-grade backend engine for the **Steam Games App**, built incrementally across **12 Pull Requests**. It features an MVC architecture, MongoDB integration with a 65k+ records live dataset, JWT authentication, request validation, rate limiting, role-based access control (RBAC), and 20 advanced analytics and statistics aggregation pipelines.

---

## Table of Contents
1. [Architecture & Folder Structure](#architecture--folder-structure)
2. [Database Schema Design](#database-schema-design)
3. [Setup & Installation](#setup--installation)
4. [Custom Middlewares](#custom-middlewares)
5. [Complete API Endpoint Catalog](#complete-api-endpoint-catalog)
6. [Analytics & Statistics Aggregations](#analytics--statistics-aggregations)
7. [Verification & Testing](#verification--testing)

---

## Architecture & Folder Structure

The application strictly enforces an industry-standard **Model-View-Controller (MVC)** design pattern with a separate **Service Layer** separating business logic from raw request/response management:

```
a_steam_data_ankit_kumar/
└── Backend/
    ├── src/
    │   ├── config/         # DB Connection configuration
    │   ├── controllers/    # API Request controllers (JSON responses only)
    │   ├── middlewares/    # Auth, Validation, Logger, Rate-limiter
    │   ├── models/         # Mongoose Schemas (Games, Users, Reviews)
    │   ├── routes/         # Router mounts (versioned under /api/v1)
    │   ├── services/       # Service layer handling Mongoose queries & DB logic
    │   ├── utils/          # Filter builders, sorting collations, wrappers
    │   └── app.js          # Express app initialization
    ├── server.js           # Server startup script
    ├── .env                # Port, MongoDB URI, and JWT secret config
    ├── postman_collection.json # Exported request collection
    └── package.json        # Dependencies configurations
```

---

## Database Schema Design

Three core collections form the Mongoose database modeling layer:

### 1. Game Model (`Games` collection)
- Maps to the live dataset `Games` collection.
- Price and recommendations are modeled as strings (parsed dynamically using `$toDouble` in sorting and aggregations).
- Includes soft-delete state variables (`isDeleted`, `archivedAt`).
- Includes an embedded `history` array log that records full field alteration states (e.g. actions, values changed, timestamp).

### 2. User Model (`users` collection)
- Manages user profiles (username, email, password, role `user`/`admin`).
- Implements `bcryptjs` pre-save hashing hooks to automatically secure passwords.
- Handles mock OTP credentials (`otp`, `otpExpires`) for verification and resetting.

### 3. Review Model (`reviews` collection)
- Connects games (using `appid`) and users (`userId` object reference).
- Includes numeric ratings (1-10) and feedback review texts.

---

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Live MongoDB instance or cloud connection Atlas URI

### Installation
1. Install project dependencies:
   ```bash
   cd Backend
   npm install
   ```

2. Create a `.env` configuration file inside the `Backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Steam?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_sign_key
   JWT_EXPIRE=1d
   NODE_ENV=development
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

---

## Custom Middlewares

1. **Request Logger**: Custom logger logging the method, URL, client IP, response status, and duration latency (ms) to the server console.
2. **Rate Limiting**: Custom configuration via `express-rate-limit` protecting:
   - General endpoints: Max 100 requests per 15 minutes.
   - Brute-force auth routes (`/login` and `/register`): Max 5 requests per minute.
3. **Request Validator**: Validates body structures (email validation regex, minimum 6 characters for password, non-negative bounds for game price/recommendations) returning a clear `400 Bad Request` validation payload.
4. **Global Error Handler**: Collects unhandled exceptions across routers and return consistent JSON structures.

---

## Complete API Endpoint Catalog

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a user (validates email & hashes password)
- `POST /api/v1/auth/login` - Authenticate user credentials and return signed JWT
- `POST /api/v1/auth/logout` - Clear user session
- `POST /api/v1/auth/send-otp` - Dispatch 6-digit verification code to email
- `POST /api/v1/auth/verify-email` - Verify email using OTP
- `POST /api/v1/auth/forgot-password` - Request password-reset OTP code
- `POST /api/v1/auth/reset-password` - Confirm password reset using OTP code
- `POST /api/v1/auth/change-password` - Update password (JWT protected)
- `GET /api/v1/auth/profile` - Fetch authenticated user profile (JWT protected)
- `PATCH /api/v1/auth/profile` - Update profile details (JWT protected)

### JWT Utility Endpoints
- `POST /api/v1/jwt/generate-token` - Generate JWT token (utility)
- `POST /api/v1/jwt/verify-token` - Inspect and parse JWT token
- `POST /api/v1/jwt/refresh-token` - Issue a fresh access token
- `DELETE /api/v1/jwt/revoke-token` - Invalidate and blacklist a token
- `GET /api/v1/jwt/profile` - Access JWT protected profile
- `GET /api/v1/jwt/dashboard` - Access JWT protected dashboard panel
- `GET /api/v1/jwt/private-games` - Fetch protected games list
- `GET /api/v1/jwt/private-analytics` - Retrieve protected metrics logs

### Games CRUD & Sub-resources
- `GET /api/v1/games` - Fetch paginated games with dynamic queries and filter matches
- `GET /api/v1/games/:appid` - Get complete details of a specific game
- `POST /api/v1/games` - Add a new game entry
- `PUT /api/v1/games/:appid` - Replace entire game details
- `PATCH /api/v1/games/:appid` - Modify game fields partially
- `DELETE /api/v1/games/:appid` - Permanently delete a game entry
- `GET /api/v1/games/exists/:appid` - Verify if a game appid exists
- `GET /api/v1/games/:appid/summary` - Get simplified summary
- `GET /api/v1/games/:appid/history` - Retrieve changes log log entries
- `PATCH /api/v1/games/:appid/archive` - Soft-delete (archive) game
- `PATCH /api/v1/games/:appid/restore` - Restore soft-deleted game
- `GET /api/v1/games/:appid/related` - Get genre-matching recommendation matches
- `GET /api/v1/games/:appid/reviews` - Fetch reviews of a game
- `POST /api/v1/games/:appid/reviews` - Create a review
- `PATCH /api/v1/games/:appid/reviews/:reviewId` - Update user review
- `DELETE /api/v1/games/:appid/reviews/:reviewId` - Delete review

### Analytics Endpoints (Aggregation Pipelines)
- `GET /api/v1/analytics/games/top-rated` - Returns top-rated games sorted by recommendations
- `GET /api/v1/analytics/games/most-downloaded` - Top games sorted by downloaded proxy
- `GET /api/v1/analytics/games/revenue` - Returns top games by estimated revenue (price * recommendations)
- `GET /api/v1/analytics/games/platform-distribution` - Modulo-based platforms counts
- `GET /api/v1/analytics/games/genre-distribution` - Splits, unwinds, and groups genre lists
- `GET /api/v1/analytics/games/trending` - Identifies trending games
- `GET /api/v1/analytics/games/release-trends` - Group game counts per release year
- `GET /api/v1/analytics/games/user-activity` - Groups review post counts by user lookup
- `GET /api/v1/analytics/games/wishlist-analysis` - Simulates wishlist statistics based on pricing
- `GET /api/v1/analytics/games/review-analysis` - Looks up reviews joined to Game details

### Statistics Endpoints
- `GET /api/v1/stats/games/count` - Count total games
- `GET /api/v1/stats/games/top-rated` - Get highest rated list
- `GET /api/v1/stats/games/most-downloaded` - Get most downloaded list
- `GET /api/v1/stats/games/average-price` - Calculate average game price
- `GET /api/v1/stats/games/average-rating` - Calculate average user rating score
- `GET /api/v1/stats/games/genre-count` - Returns count per genre
- `GET /api/v1/stats/games/platform-count` - Windows, Mac, Linux counts
- `GET /api/v1/stats/games/free-to-play-count` - Count free games
- `GET /api/v1/stats/games/multiplayer-count` - Count multiplayer games
- `GET /api/v1/stats/games/monthly-releases` - Counts per release month (extracted using substr)

### RBAC Admin Routes (Admin-Only JWT Protected)
- `GET /api/v1/admin/games` - Admin-specific list (returns deleted/archived entries also)
- `GET /api/v1/admin/analytics` - Admin metrics dashboard
- `GET /api/v1/admin/reports` - System reports list

---

## Analytics & Statistics Aggregations

Because `price` and `recommendations` are stored as string values inside the legacy database schemas, standard aggregations fail. Our pipelines use `$toDouble` and `$convert` stages to cast fields on-the-fly inside the aggregation context, maintaining accurate averages and multiplications:

- **Revenue Aggregation**:
  ```javascript
  {
    $project: {
      name: 1,
      estimatedRevenue: { $multiply: [ { $toDouble: "$price" }, { $toDouble: "$recommendations" } ] }
    }
  }
  ```
- **Platform Modulo Categorization**:
  Mac matches `appid % 2 === 0` and Linux matches `appid % 3 === 0`, implemented inside Mongoose aggregation stages using `$mod` and `$cond` operators.
- **Genre Grouping**:
  Utilizes `$split` to slice `genres` strings by semicolons, followed by `$unwind` and `$group` stages to count frequencies across the database.

---

## Verification & Testing

Our entire codebase is fully covered by dynamic programmatic integration tests. Testing scripts are included inside the `brain/scratch/` folder to run verified workflows for:
- User register, login, OTP codes, password resets, and changes.
- JWT utility verify/refresh/revoke calls.
- Admin dashboard RBAC permissions (verifies standard user gets `403 Forbidden` and administrator gets `200 OK`).
- All 20 analytics and statistics aggregation endpoints.