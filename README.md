# Talent Talk — AI-Powered Job Portal Microservices Platform

> Connecting Students with Companies through intelligent technology

---

## Overview

Talent Talk is a full-stack, enterprise-grade job portal built on a microservices architecture using Spring Boot. It connects students seeking employment with companies looking for talent. The platform goes beyond a simple job board by incorporating real-time communication, AI-powered interviews, automated email notifications, payment processing, and event-driven architecture — all working together seamlessly across 10 independent services.

The standout feature is an AI Interview System powered by a locally hosted LLM (Ollama + Llama3.2) that scans job requirements and student profiles, generates personalized interview questions, evaluates answers, scores candidates, and provides hiring recommendations — entirely automated without any human intervention.

---

## Architecture

Talent Talk follows a microservices architecture where each service owns its own database and communicates with others through REST APIs (OpenFeign) and event streaming (Apache Kafka).

```
Client (React Frontend)
        ↓
API Gateway (Port 8080) — JWT validation, routing
        ↓
┌─────────────────────────────────────────┐
│           Eureka Service Registry        │
│                (Port 8761)               │
└─────────────────────────────────────────┘
        ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │ Student  │  │   Job    │
│  :8081   │  │  :8082   │  │  :8083   │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Comms   │  │ Payment  │  │  Admin   │
│  :8084   │  │  :8085   │  │  :8086   │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│ Company  │  │Interview │
│  :8087   │  │  :8088   │
└──────────┘  └──────────┘
        ↓
┌─────────────────────────────────────────┐
│         Apache Kafka (Event Bus)         │
└─────────────────────────────────────────┘
```

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| Service Registry | 8761 | Eureka service discovery |
| API Gateway | 8080 | JWT auth, routing, load balancing |
| Auth Service | 8081 | Registration, login, JWT, OAuth, email verification |
| Student Service | 8082 | Student profiles, resume upload, projects, work status |
| Job Service | 8083 | Job posting, applications, selection/rejection |
| Communication Service | 8084 | Email notifications, WebSocket real-time chat |
| Payment Service | 8085 | Razorpay payment orders, verification |
| Admin Service | 8086 | Platform monitoring, user and job management |
| Company Service | 8087 | Company profiles, student browsing, applicant management |
| Interview Service | 8088 | AI-powered interview system using Ollama |

---

## Key Features

### For Students
- Register and create a detailed profile with skills, bio, education, and portfolio links
- Upload resume to Cloudinary (PDF storage)
- Add projects with tech stack and GitHub links
- Browse and search active job listings
- Apply to jobs with one click
- Track application status in real time
- Receive automatic email when selected or rejected by a company
- Take AI-powered interviews from home before the deadline
- Real-time chat with companies via WebSocket
- View payment history

### For Companies
- Register and create a company profile
- Post jobs with detailed requirements
- Browse all student profiles and resumes
- View and filter applicants for each job
- Select or reject candidates (triggers automatic email)
- Schedule AI interviews for shortlisted students with a deadline
- View interview scores, grades, AI feedback, and hiring recommendations
- Real-time chat with students
- Make payments for hiring via Razorpay
- Close or delete job postings

### For Admins
- Dashboard with platform-wide statistics
- Manage all users, jobs, and transactions
- Close or delete any job posting
- Monitor service health

---

## AI Interview System

The interview system is the most technically sophisticated feature of Talent Talk. It uses Ollama running locally with the Llama3.2 model — no cloud AI API, no rate limits, no cost.

**How it works:**

1. Company creates an interview for a specific student with a deadline
2. Student starts the interview before the deadline
3. On start — one Ollama API call scans the job description, skills required, student's skills, bio, and projects, then generates 7 personalized interview questions with expected answers
4. Student answers questions one by one through a chat-like interface
5. After all 7 answers are submitted — one final Ollama call evaluates all answers against expected answers and generates individual scores (0-10), feedback per answer, overall summary, strong areas, weak areas, and a hiring recommendation (RECOMMENDED or NOT_RECOMMENDED)
6. Company views the complete result including total score out of 100, letter grade, and full Q&A review

This approach uses only 2 AI calls per complete interview session, making it efficient and avoiding rate limit issues.

---

## Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Primary language |
| Spring Boot 3.4.5 | Service framework |
| Spring Security + JWT | Authentication and authorization |
| Spring Cloud Gateway MVC | API routing and JWT filtering |
| Spring Cloud Netflix Eureka | Service discovery and registration |
| Spring Data JPA + Hibernate | Database ORM |
| Spring WebSocket + STOMP | Real-time messaging |
| Spring Mail (JavaMailSender) | Email notifications |
| OpenFeign | Synchronous inter-service communication |
| Apache Kafka | Asynchronous event-driven communication |
| MySQL | Primary database (each service has its own) |
| Cloudinary SDK | Resume and file storage |
| Razorpay Java SDK | Payment gateway integration |
| Ollama + Llama3.2 | Local AI for interview generation and evaluation |
| Lombok | Boilerplate reduction |
| SpringDoc OpenAPI (Swagger) | API documentation |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| @stomp/stompjs + SockJS | WebSocket client |
| Framer Motion | Animations |
| Lucide React | Icons |

---

## Event-Driven Architecture with Kafka

Two critical flows are handled asynchronously via Kafka:

**Flow 1 — Application Status Email:**
```
Company selects or rejects student in Job Service
        ↓
Job Service publishes event to Kafka topic
"application-status-changed"
        ↓
Communication Service consumes event
automatically sends HTML email to student
```

**Flow 2 — Payment to Job Activation:**
```
Company verifies payment in Payment Service
        ↓
Payment Service publishes event to Kafka topic
"payment-success"
        ↓
Job Service consumes event
automatically activates the job
```

---

## Security

- JWT tokens with 24-hour expiry containing email, role, and userId
- API Gateway validates every incoming request before forwarding
- Role-based access control: STUDENT, COMPANY, ADMIN
- BCrypt password hashing
- Google OAuth2 login with automatic account creation
- Email verification required before first login
- Stateless authentication (no sessions)
- CORS configuration for frontend integration

---

## Inter-Service Communication

**OpenFeign (Synchronous):**
- Company Service → Student Service (view student profiles)
- Company Service → Job Service (manage applications)
- Company Service → Communication Service (send emails)
- Company Service → Payment Service (create orders)
- Admin Service → All services (dashboard data)
- Interview Service → Job Service (fetch job details)
- Interview Service → Student Service (fetch student profile)

**Kafka (Asynchronous):**
- Job Service → Communication Service (status change emails)
- Payment Service → Job Service (activate job after payment)

---

## Getting Started

### Prerequisites
```
Java 21
Maven 3.9+
MySQL 8.0+
Node.js 18+
Apache Kafka 3.7+
Ollama (with llama3.2 model)
```

### Step 1 — Start Infrastructure
```bash
# Start Zookeeper
bin/windows/zookeeper-server-start.bat config/zookeeper.properties

# Start Kafka
bin/windows/kafka-server-start.bat config/server.properties

# Start Ollama
ollama serve
ollama pull llama3.2
```

### Step 2 — Configure each service

Each service has its own `application.properties`. Update:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/talenttalk_{service}?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=yourpassword
```

For Auth Service additionally:
```properties
jwt.secret=YourSecretKey
spring.security.oauth2.client.registration.google.client-id=YOUR_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_SECRET
spring.mail.username=youremail@gmail.com
spring.mail.password=your_app_password
```

For Payment Service:
```properties
razorpay.key.id=your_key_id
razorpay.key.secret=your_key_secret
```

For Interview Service:
```properties
ollama.api.url=http://localhost:11434/api/generate
ollama.model=llama3.2
```

### Step 3 — Start services in order
```bash
# 1. Start Eureka Registry (port 8761)
# 2. Start Auth Service (port 8081)
# 3. Start Student Service (port 8082)
# 4. Start Job Service (port 8083)
# 5. Start Communication Service (port 8084)
# 6. Start Payment Service (port 8085)
# 7. Start Admin Service (port 8086)
# 8. Start Company Service (port 8087)
# 9. Start Interview Service (port 8088)
# 10. Start API Gateway (port 8080) — always last
```

### Step 4 — Start Frontend
```bash
cd talenttalk-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Step 5 — Verify all services registered
Open Eureka dashboard: `http://localhost:8761`

All 9 services should appear in the registry.

---

## API Documentation

Swagger UI is available for every service:

| Service | Swagger URL |
|---|---|
| Auth | http://localhost:8081/swagger-ui.html |
| Student | http://localhost:8082/swagger-ui.html |
| Job | http://localhost:8083/swagger-ui.html |
| Communication | http://localhost:8084/swagger-ui.html |
| Payment | http://localhost:8085/swagger-ui.html |
| Admin | http://localhost:8086/swagger-ui.html |
| Company | http://localhost:8087/swagger-ui.html |
| Interview | http://localhost:8088/swagger-ui.html |

---

## Project Structure

```
Talent-Talk/
├── service-registry/          # Eureka Server
├── api-gateway/               # Spring Cloud Gateway + JWT
├── auth-service/              # Authentication + OAuth
├── student-service/           # Student management
├── job-service/               # Job and application management
├── communication-service/     # Email + WebSocket
├── payment-service/           # Razorpay integration
├── admin-service/             # Admin operations
├── company-service/           # Company management
├── interview-service/         # AI interview system
└── talenttalk-frontend/       # React frontend
```

---

## What Makes This Project Unique

Most job portal projects are simple CRUD applications. Talent Talk is different:

**Local AI without cloud dependency** — The interview system runs on your own machine using Ollama. No API keys, no rate limits, no monthly bills, no data leaving your server.

**True event-driven architecture** — Services don't call each other for notifications. Job Service publishes an event, Communication Service reacts independently. This means if the email service is temporarily down, no emails are lost — they queue in Kafka and process when the service recovers.

**End-to-end automated hiring workflow** — A company can post a job, receive applications, schedule AI interviews, get scored results, make payments, and communicate with candidates — all within one platform without leaving the application.

**Production-ready patterns** — Service discovery, load balancing, JWT security, global exception handling, input validation, Swagger documentation, and proper separation of concerns follow real enterprise standards.

---

## Author

Built as a full-stack portfolio project demonstrating microservices architecture, event-driven design, AI integration, and modern web development practices.

---

## License

This project is open source and available under the MIT License.
