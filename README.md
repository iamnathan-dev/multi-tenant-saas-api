# Multi-Tenant SaaS API

## Description

This project is a multi-tenant Software as a Service (SaaS) API designed to handle multiple clients (tenants) with isolated data and resources. It provides RESTful endpoints for user management, authentication, and tenant-specific operations, ensuring scalability and security in a cloud-based environment.

## Tools Used

- **Backend Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker for containerization
- **Testing**: Jest for unit tests
- **Version Control**: Git

## Setup

1. **Prerequisites**:

- Node.js (version 18 or higher)
- PostgreSQL (local or cloud instance)
- Docker (optional for containerized setup)

2. **Installation**:

- Clone the repository: `git clone https://github.com/iamnathan-dev/multi-tenant-saas-api.git`
- Navigate to the project directory: `cd multi-tenant-saas-api`
- Install dependencies: `pnpm install`
  - `npm install` or `yarn install` also works if you prefer

3. **Configuration**:

- Create a `.env` file in the root directory with the following variables:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/multi_tenant_saas
  ACCESS_TOKEN_SECRET=your-access-token-secret
  REFRESH_TOKEN_SECRET=your-refresh-token-secret
  EMAIL_VERIFICATION_TOKEN_SECRET=your-email-verification-secret
  FRONTEND_URL=your-frontend-url
  EMAIL_HOST=smtp.example.com
  EMAIL_PORT=587
  EMAIL_USER=your-email-user
  EMAIL_PASS=your-email-password
  ```

4. **Running the Application**:

- Start the server: `pnpm start`
- For development with auto-reload: `pnpm dev`
- Access the API at `http://localhost:3000`

5. **Testing**:

- Run tests: `pnpm test`

For more details, refer to the API documentation or contact the development team.
