# HomeServe Backend — NestJS API

REST API and real-time gateway layer for the HomeServe home services marketplace. Built with **NestJS 11**, **MongoDB (Mongoose)**, **Redis**, and **Socket.IO**, exposing the business logic for the Customer, Provider, and Admin portals.

## Features

- **Authentication & Authorization** — JWT access/refresh tokens, Google OAuth (Passport), email OTP verification, argon2 password hashing, role-based guards, Redis-backed sessions.
- **Booking Engine** — Slot-based bookings with slot reservations, rescheduling and cancellation flows, availability rules (default schedules, date overrides, slot rules).
- **Commerce** — Cart, coupon engine, Razorpay payment integration, subscription plans, dual wallets (customer refunds / provider earnings) with withdrawal requests.
- **Real-Time** — Namespaced Socket.IO gateways for chat, notifications, slot reservations, and video-call signaling; Redis socket adapter for multi-instance scaling; authenticated socket handshakes.
- **Reports & Invoices** — Server-side PDF generation with Puppeteer (users, bookings, transaction reports; booking invoices).
- **Admin Governance** — KYC approval workflows, category/profession/service management, user and transaction oversight, complaint handling.
- **Media & Email** — Cloudinary uploads, Nodemailer with Handlebars templates.

## Tech Stack

| Concern            | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| Runtime            | Node.js, NestJS 11, Express, TypeScript                          |
| Database           | MongoDB 8 (Mongoose 8)                                           |
| Caching / Sessions | Redis (cache-manager, connect-redis, `@socket.io/redis-adapter`) |
| Auth               | Passport (JWT, Local, Google OAuth 2.0), jsonwebtoken, argon2    |
| Real-Time          | Socket.IO                                                        |
| Payments           | Razorpay                                                         |
| Files              | Cloudinary, multer, streamifier                                  |
| Email              | Nodemailer, @nestjs-modules/mailer, Handlebars                   |
| PDF                | Puppeteer                                                        |
| Dates              | Luxon                                                            |
| Testing            | Jest, Supertest, mongodb-memory-server                           |

## Project Structure

```
src/
├── core/              # Guards, interceptors, shared services (PDF, mail, uploads)
├── configs/           # Environment and module configuration
├── modules/
│   ├── auth/                  # Authentication (JWT, OAuth, OTP)
│   ├── users/                 # Customer and admin domain
│   ├── providers/             # Provider domain, KYC, approvals
│   ├── provider-service/      # Provider service catalog
│   ├── category/              # Categories, professions, services
│   ├── bookings/              # Booking lifecycle, invoices
│   ├── slots/                 # Slot management
│   ├── availability/          # Default schedules, date overrides, slot rules
│   ├── cart/                  # Cart management
│   ├── coupons/               # Discount engine
│   ├── payment/               # Razorpay integration
│   ├── plans/                 # Subscription plans
│   ├── subscriptions/         # User subscriptions
│   ├── wallet/                # Wallets and withdrawals
│   ├── reports/               # Reporting and analytics endpoints
│   └── websockets/            # Chat, notification, reservation, video-call gateways
├── shared/            # Reusable DTOs, enums, utilities
├── seed/              # Seed scripts
└── main.ts
```

Each module follows a layered architecture: **controllers → services (interface + implementation) → repositories**, with DTO validation via `class-validator`.

## Getting Started

### Prerequisites

- Node.js ≥ 20 and pnpm
- MongoDB instance
- Redis instance
- Keys for Razorpay, Cloudinary, Google OAuth, and an SMTP account

### Setup

```bash
pnpm install
cp .env.development .env   # or .env.production; fill in your values
pnpm run start:dev         # hot-reload dev server
```

### Environment Variables

| Group        | Variables                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Server       | `PORT`, `NODE_ENV`, `FRONTEND_URL`, `BACKEND_URL`, `ALLOWED_URLS`, `VERIFICATION_LINK`                                  |
| Database     | `MONGO_URI`                                                                                                             |
| JWT          | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_VERIFICATION_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| Session      | `SESSION_SECRET`, `MULTI_INSTANCE`                                                                                      |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`                                                       |
| SMTP         | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`                                                     |
| Cloudinary   | `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`                                                                |
| Redis        | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`, `REDIS_TTL`                                                  |
| Razorpay     | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`                                                                                |
| Admin seed   | `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                                                                         |

## Scripts

| Script                | Purpose                           |
| --------------------- | --------------------------------- |
| `pnpm run start`      | Run the server                    |
| `pnpm run start:dev`  | Run with hot reload (ts-node-dev) |
| `pnpm run start:prod` | Run the compiled production build |
| `pnpm run build`      | Compile with Nest CLI             |
| `pnpm run lint`       | ESLint with autofix               |
| `pnpm run test`       | Unit tests (Jest)                 |
| `pnpm run test:e2e`   | e2e tests (Jest + Supertest)      |
| `pnpm run test:cov`   | Test coverage report              |
| `pnpm run seed:admin` | Seed the admin account            |
| `pnpm run console`    | Interactive console               |

## Deployment

Build the production bundle and run it with `NODE_ENV=production`:

```bash
pnpm run build
pnpm run start:prod
```

The API expects a MongoDB instance and a Redis instance (required for sessions, caching, and the Socket.IO adapter when `MULTI_INSTANCE` is enabled).

## License

Private / UNLICENSED.
