# High School Management System – Backend

## 📚 Project Overview
A fully-featured backend API for managing a high-school environment.  Built with TypeScript, Express.js, and PostgreSQL (via Prisma ORM), it provides authentication, role-based access control, modular services (students, teachers, classes, grades, payments, chat, etc.), swagger documentation, centralized logging, and complete end-to-end test coverage.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (access / refresh) & Google OAuth2 (Passport)
- **Validation:** class-validator / class-transformer
- **Logging:** Winston + Daily Rotate File
- **Documentation:** Swagger (OpenAPI)
- **Testing:** Jest + Supertest (E2E)

## 🚀 Quick Start
```bash
# 1. Clone & install
$ git clone <repo-url> && cd high-school-system
$ npm install

# 2. Configure environment
$ cp .env.example .env
#  ↳ fill in DATABASE_URL, JWT_SECRET, etc.

# 3. Set up database (local Postgres must be running)
$ npx prisma migrate dev --name init
$ npm run db:seed   # optional sample data

# 4. Start the dev server
$ npm run dev
```
The API will be running at **http://localhost:3000/api** and Swagger UI at **/api-docs**.

## 🔑 Authentication Flow
1. **Login** → `POST /api/auth/login` → returns *access* & *refresh* tokens.
2. **Authenticated request** → include header `Authorization: Bearer <accessToken>`.
3. **Refresh** (when access token expires) → `POST /api/auth/refresh` with `refreshToken`.
4. **Google OAuth2** → `GET /api/auth/google` → redirects back to `/auth/google/callback` with tokens.

Tokens embed `id` & `role`; middleware `authenticate` verifies JWT, `authorize` enforces RBAC.

## 🛡 Role-Based Access Control
| Role    | Typical Capabilities |
|---------|----------------------|
| ADMIN   | Full access to all resources |
| TEACHER | Manage own classes, grades, materials |
| STUDENT | View own grades & materials |
| PARENT  | View linked student info |
| STAFF   | Operational / attendance duties |

Use `authorize([UserRole.ADMIN, …])` inside route definitions to guard endpoints.

## 🗂 Folder Structure (Clean Architecture-lite)
```text
src/
 ├─ config/          # env, database, Swagger, Passport
 ├─ controllers/     # HTTP layer – thin request/response mapping
 ├─ services/        # Business logic (uses Prisma)
 ├─ middleware/      # Auth, RBAC, error-handler, logger
 ├─ routes/          # Express routers per domain
 ├─ models/          # (If using custom classes beyond Prisma)
 ├─ utils/           # Logger, AppError, helpers
 ├─ tests/           # Jest + Supertest E2E & unit tests
 └─ index.ts         # App bootstrap
```

## 🧪 Running Tests
The suite spins up the app against a **separate test database** defined in `.env.test`.
```bash
# All tests
npm test

# E2E only
npm run test:e2e
```
Coverage reports are generated in the **coverage/** folder.

## 📦 NPM scripts
| Script | Description |
|--------|-------------|
| dev | Start dev server with ts-node-dev |
| build | Transpile TypeScript to `dist/` |
| start | Run compiled app from `dist` |
| lint / lint:fix | Run ESLint (with Prettier rules) |
| format | Format codebase with Prettier |
| test:e2e | Execute Jest E2E tests |

## 🏗 Deployment Notes
1. Run `npm run build`; deploy contents of `dist/`.
2. Ensure environment variables (see `.env.example`) are set on the server.
3. Behind a reverse proxy (Nginx/Apache) forward `X-Forwarded-*` headers for correct logging.
4. Scale horizontally using a shared Postgres instance & stateless JWT authentication.

---
© 2024 High School System. MIT License. 