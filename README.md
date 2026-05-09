# Feedback Management System

Full-stack Feedback Management System for organizations.

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Spring Boot 3, Java 17, Maven
- Database: MySQL
- API: REST JSON with Swagger/OpenAPI

## Repository

```text
feedback/
  backend/      Spring Boot REST API
  frontend/     Next.js web application
  database/     MySQL DDL and seed data
```

## Quick Start

1. Create a MySQL database and run `database/schema_mysql.sql`.
2. Configure environment:

```bash
# Set Java 17 path
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Database configuration
export DB_URL='jdbc:mysql://localhost:3306/feedback_db'
export DB_USERNAME='root'
export DB_PASSWORD=''
export JWT_SECRET='change-this-to-a-long-random-production-secret'
```

3. Start backend (Port 8080):

```bash
cd backend
mvn spring-boot:run
```

Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

4. Start frontend (Port 3000):

```bash
cd frontend
npm install
npm run dev
```

## Demo Users

All users share the same password: `Password123!`.

- **Admin**: `admin@example.com`
- **Manager**: `manager@example.com`
- **Employee**: `employee@example.com`

## Main Modules

- Question Management
- Choice Management
- Question Sending through assignment records and simulated email logs
- Employee response submission
- Manager/Admin approvals
- Reuse Library for cloning questions and full feedback cycles
- Dashboard analytics
- JWT authentication and role-based access

