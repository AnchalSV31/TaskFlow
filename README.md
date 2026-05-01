# TaskFlow — Team Task Manager

A full-stack **Team Task Manager** built with **Spring Boot 3** and **React.js**. Features role-based access control, JWT authentication, project & task management, and a live admin dashboard.

---

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 + Spring Boot 3 | REST API framework |
| Spring Security + JWT | Stateless authentication & authorization |
| Spring Data JPA + Hibernate | ORM & database access |
| MySQL 8 | Relational database |
| Lombok | Boilerplate reduction |
| SpringDoc / Swagger UI | API documentation |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|---|---|
| React.js 18 | UI framework |
| Vite | Dev server & bundler |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Tailwind CSS | Utility-first styling |


---

## 📁 Project Structure

```
TaskManageSystem/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/taskmanager/
│       ├── auth/                   # JWT auth, login, signup, refresh
│       ├── user/                   # User entity, service, controller
│       ├── project/                # Project CRUD, member management
│       ├── task/                   # Task CRUD, status & filters
│       ├── dashboard/              # Role-aware dashboard aggregation
│       ├── common/                 # ApiResponse wrapper, BaseEntity
│       ├── exception/              # Global exception handler
│       └── DataSeeder.java         # Automatic demo data seeding
│
├── frontend/                       # React + Vite application
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx        # Public landing page
│       │   ├── LoginPage.jsx       # JWT login form
│       │   ├── SignupPage.jsx      # User registration
│       │   ├── DashboardPage.jsx   # Role-aware dashboard
│       │   ├── ProjectsPage.jsx    # Project list & creation
│       │   ├── ProjectDetailPage.jsx  # Kanban task board
│       │   ├── TaskDetailPage.jsx  # Task view & edit
│       │   └── UsersPage.jsx       # Admin-only user list
│       ├── components/
│       │   ├── Navbar.jsx          # Top navigation with user dropdown
│       │   ├── TaskCard.jsx        # Task card component
│       │   ├── StatusBadge.jsx     # TODO / IN_PROGRESS / DONE badge
│       │   ├── PriorityBadge.jsx   # LOW / MEDIUM / HIGH badge
│       │   ├── Modal.jsx           # Reusable modal overlay
│       │   └── ProtectedRoute.jsx  # Auth guard HOC
│       ├── lib/api.js              # Axios instance with JWT interceptors
│       └── store/authStore.js      # Zustand auth store
│
├── .env                            # Environment variables (DB password)
└── seed_data.ps1                   # PowerShell script to seed extra data
```

---

## ✨ Features

### 🔐 Authentication
- JWT-based stateless auth with access token (1h) + refresh token (7 days)
- Secure signup / login / logout flow
- Auto token refresh via Axios interceptors
- Route guards — unauthenticated users redirected to login

### 👥 Role-Based Access Control
| Feature | MEMBER | ADMIN |
|---|---|---|
| View own dashboard | ✅ | ✅ |
| Team Overview section | ❌ | ✅ |
| Create / manage projects | Own only | All |
| Assign tasks | Own projects | All projects |
| Update task status | Assigned tasks | All tasks |
| Delete tasks | ❌ | ✅ |
| View all users | ❌ | ✅ |
| Add project members | ❌ | ✅ |

### 📊 Dashboard
- **Personal stats**: total tasks, overdue count, in-progress count, my projects
- **My Task Progress** bar showing TODO / IN_PROGRESS / DONE distribution
- **Team Overview (Admin only)**: system-wide task counts, all projects, team progress bar, recent activity feed
- Real-time updates — dashboard refetches after every task status change

### 📁 Projects
- Create, view, and archive projects
- Add / remove members (admin only)
- Kanban-style task board grouped by status (TODO → IN_PROGRESS → DONE)
- Filter tasks by status, assignee, and priority

### ✅ Tasks
- Full CRUD with title, description, priority, due date, and assignee
- Inline status updates (assignee or admin)
- Overdue detection — due date turns red for past-due incomplete tasks
- Cascading cache invalidation — project task list and dashboard update instantly

### 🏠 Landing Page
- Public home page at `/` with feature highlights and "How it works" section
- Context-aware CTAs — logged-in users see "Go to Dashboard"

---

## ⚡ Getting Started

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** and **npm**
- **MySQL 8** running locally

### 1. Clone the repository
```bash
git clone <repo-url>
cd TaskManageSystem
```

### 2. Create the MySQL database
```sql
CREATE DATABASE taskmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Set the database password
Create a `.env` file in the root (or set the env var in your shell):
```
DB_PASSWORD=your_mysql_password
```

### 4. Start the Backend
```powershell
# Windows PowerShell
$env:DB_PASSWORD="your_mysql_password"
cd backend
mvn spring-boot:run
```
The backend starts on **http://localhost:8080**.  
Flyway runs migrations automatically. Demo data is seeded on first run.

### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on **http://localhost:5173**.

---

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@test.com | Admin@123 |
| Member | alice@test.com | Member@123 |
| Member | bob@test.com | Member@123 |


---


## 🗄️ Database Schema

```
users           — id, name, email, password, role (ADMIN/MEMBER), created_at, updated_at
projects        — id, name, description, status (ACTIVE/ARCHIVED), owner_id, created_at, updated_at
project_members — project_id, user_id  (join table)
tasks           — id, title, description, status, priority, due_date,
                  project_id, assignee_id, created_by_id, created_at, updated_at
refresh_tokens  — id, token, user_id, expiry_date
```

---


## 🔧 Configuration

Key settings in `backend/src/main/resources/application.yml`:

```yaml
jwt:
  secret: <256-bit hex secret>
  access-token-expiry: 3600000     # 1 hour (ms)
  refresh-token-expiry: 604800000  # 7 days (ms)

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/taskmanager
    password: ${DB_PASSWORD}        # injected from environment
```

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| `/` | Public landing page with feature highlights |
| `/dashboard` | Personal stats + Team Overview (admin) |
| `/projects` | Project cards with member count and status |
| `/projects/:id` | Kanban board — tasks grouped by status |
| `/tasks/:id` | Task detail with inline editing |
| `/users` | Admin-only user management table |

---

## 🛡️ Security Notes

- Passwords are hashed with **BCrypt**
- JWT secret should be replaced with a strong random value in production
- CORS is configured for `http://localhost:5173` — update for production domains

---


