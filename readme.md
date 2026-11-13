# EcoPulse MVP — AI-Powered Smart Energy Management System

EcoPulse is an **AI-Powered Smart Energy Management System**. The team developed it as part of the Master's Capstone Project (MDT 7226) at **FH Dortmund**.

The project is a web-based platform that optimizes energy consumption in buildings such as universities, offices, and homes.

It uses AI to predict energy demand, detect abnormal consumption, and recommend energy-saving strategies. The platform also tracks electricity costs, energy savings, carbon emissions, and building sustainability scores.

## 1. Project Information

| Information | Details |
|---|---|
| Project Name | AI-Powered Smart Energy Management System |
| Project | EcoPulse MVP |
| Institution | FH Dortmund |
| Program | Master's in Digital Transformation |
| Module | MDT 7226 – Master's Capstone Project |
| Group | Group 5 |
| Presentation Date | November 14, 2026 |
| Repository | https://github.com/md-ahad-ali/eco-plus-mvp |

## 2. Project Team

| Team Member | Student ID | Subsystem |
|---|---|---|
| Thi Ha Vu | MDT 7226574 | User & Building Management |
| S M Saifur Rahman | MDT 7226434 | Energy Data Management |
| Md. Ahad Ali | MDT 7226162 | Energy Analytics & Sustainability |
| MD Sakib Khan | MDT 7225912 | Recommendations & Reporting |

### Subsystem Responsibilities

- **Subsystem 1 – User & Building Management:** User registration, authentication, roles, building management, and room management.
- **Subsystem 2 – Energy Data Management:** CSV uploads, data validation, energy log processing, and database storage.
- **Subsystem 3 – Energy Analytics & Sustainability:** Energy dashboards, cost and carbon calculations, sustainability scores, forecasting, and anomaly detection.
- **Subsystem 4 – Recommendations & Reporting:** AI-powered recommendations, estimated savings, report generation, and PDF/CSV exports.

## 3. System Architecture

EcoPulse follows a **three-tier modular web application architecture**.

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | MySQL |
| ORM | SQLAlchemy |
| Data Processing | Pandas |
| AI Integration | OpenAI API |

## 4. Project Structure

```text
eco-plus-mvp/
│
├── backend/
│   └── README.md
│
├── ui/
│   └── README.md
│
└── README.md
```

- `backend/` contains the backend API and database integration.
- `ui/` contains the React frontend application.
- The root `README.md` provides the main project information and startup instructions.

## 5. Prerequisites

Install the following software before you start:

- Git
- Python 3.10+ and pip
- Node.js 24+ and npm
- MySQL Server 8.0+
- VS Code or another code editor (optional)

## 6. Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/md-ahad-ali/eco-plus-mvp.git
cd eco-plus-mvp
```

### Step 2: Start the Database

Make sure MySQL Server runs and the EcoPulse database exists with the correct configuration.

For database creation, configuration, and initialization instructions, refer to the [Backend README](backend/README.md).

### Step 3: Start the Backend

Open a terminal in the project root directory:

```bash
cd backend
```

Follow the installation, dependency, and configuration instructions in:

**[Backend README](backend/README.md)**

The backend API runs at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 4: Start the Frontend

Open a **separate terminal** in the project root directory:

```bash
cd ui
```

Follow the installation and startup instructions in:

**[Frontend README](ui/README.md)**

The frontend development server runs at:

```text
http://localhost:5173/
```

### Step 5: Access the Application

After MySQL, the backend, and the frontend run, open:

**http://localhost:5173/**

Use the following demo accounts to explore the application:

| User Role | Username | Password |
|---|---|---|
| Building Manager | `demo_manager` | `123456` |
| Admin | `demo_admin` | `123456` |

> **Note:** These are demo credentials for local development and project demonstration.

**Recommended startup order:** MySQL → Backend → Frontend.

## 7. Project Demonstration Video

### 5-Minute Project Demonstration

The video demonstrates the EcoPulse MVP, including its system architecture, main features, subsystem implementations, and application workflow.

**Video Link:** [Add the 5-minute project demonstration video link here]

## 8. Academic Information

**FH Dortmund – University of Applied Sciences and Arts**

- Master's Capstone Project
- Project Group: Group 5
- Project: AI-Powered Smart Energy Management System (EcoPulse MVP)

---

**EcoPulse MVP — Making Energy Management Smarter and More Sustainable.**