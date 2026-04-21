# TeamFlow API – Multi-Tenant SaaS Backend

## 📌 Description

**TeamFlow API** is a production-grade multi-tenant SaaS backend designed to power team collaboration platforms. It enables organizations to manage projects, tasks, members, and permissions with strict data isolation and scalable architecture.

This project demonstrates real-world backend engineering patterns including authentication, authorization (RBAC + PBAC), background processing, audit logging, and system observability.

---

## 🚀 Core Features

### 🔐 Authentication & Session Management

- Email/password authentication
- JWT-based access & refresh tokens
- Refresh token rotation
- OAuth support (Google, GitHub)
- Session tracking (device, IP, activity)
- Logout (single or all sessions)

### 🏢 Multi-Tenant Organization System

- Create and manage organizations (teams)
- Users can belong to multiple organizations
- Strict tenant-level data isolation
- Role system: Owner, Admin, Member

### 🛡️ Authorization (RBAC + PBAC)

- Role-Based Access Control
- Permission-Based Access Control
- Middleware-based permission enforcement
- Example permissions:
  - `project:create`
  - `task:update`
  - `member:invite`

### 📁 Project & Task Management

- Projects within organizations
- Task creation, assignment, and status tracking:
  - `todo`, `in_progress`, `done`

- Soft delete + restore support

### ✉️ Invitation System

- Invite users via email
- Secure, expiring invitation tokens
- Accept/decline invitations

### ⚙️ Background Jobs

- Queue-based async processing (Redis)
- Use cases:
  - Sending emails
  - Cleaning expired tokens
  - Audit logging

### 📜 Audit Logging

- Immutable logs of critical actions
- Tracks user activity for debugging and analytics

### 🌐 Security & Rate Limiting

- Rate limiting (IP + user level)
- Brute-force protection
- Input sanitization
- HTTPS enforcement

### 📊 Subscription Plans

- Free, Pro, Enterprise tiers
- Feature and usage limits enforced at service level

### 🔗 Webhooks

- Event subscriptions (e.g. `task.created`)
- Signed payload delivery
- Retry mechanism

### 📂 File Attachments

- Pre-signed upload URLs
- Organization-level access control

### ⚡ Caching

- Redis caching for:
  - Permissions
  - Memberships
  - Projects

- Cache invalidation strategies

### 📡 Real-Time (Optional)

- WebSocket-based updates for:
  - Tasks
  - Member activity

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + OAuth
- **Queue/Cache**: Redis
- **Containerization**: Docker
- **Package Manager**: pnpm (recommended)

---

## ⚙️ Setup

### 1. Prerequisites

- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- PostgreSQL
- Redis
- Docker (optional)

---

### 2. Installation

```bash
git clone https://github.com/iamnathan-dev/multi-tenant-saas-api.git
cd multi-tenant-saas-api

pnpm install
```

> You can also use `npm install` or `yarn install`, but **pnpm is recommended**.

---

### 3. Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/teamflow

ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
EMAIL_VERIFICATION_TOKEN_SECRET=your-email-secret

REDIS_URL=redis://localhost:6379

FRONTEND_URL=http://localhost:3000

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password

OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=

OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
```

---

### 4. Database Setup

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

---

## ▶️ Running the Application

### Development

```bash
pnpm dev
```

---

### Production

```bash
pnpm build
pnpm start
```

---

### Using Docker (optional)

```bash
docker-compose up --build
```

---

### API Base URL

```
http://localhost:3000
```

---

## 🤝 Contribution Guidelines

We welcome contributions! Please follow these steps:

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/multi-tenant-saas-api.git
```

---

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

---

### 3. Coding Standards

- Use **TypeScript best practices**
- Write clean, modular, and scalable code
- Follow DRY principles
- Use meaningful naming conventions

---

### 4. Commit Convention

```bash
feat: add task assignment feature
fix: resolve token refresh bug
chore: update dependencies
```

---

### 5. Open a Pull Request

- Clearly describe your changes
- Link related issues (if any)
- Add context where necessary

---

## 📊 Observability

- Structured logging
- Error tracking
- Metrics:
  - Request latency
  - Error rates

---

## ✅ Success Criteria

- Secure authentication with token rotation
- Proper multi-tenant data isolation
- Clean and maintainable architecture
- Real-world backend features (RBAC, queues, audit logs)

---

## 📌 Notes

- Backend-only project (no frontend included)
- Billing and advanced analytics are out of scope (for now)

---

If you want next step improvements, I can help you add:

- Swagger/OpenAPI docs
- RBAC middleware boilerplate
- Production folder architecture (clean architecture / DDD style)
