# EcoPulse MVP — Backend

EcoPulse MVP is a REST API built with **FastAPI**, **Uvicorn**, and **MySQL** for an AI-powered smart energy management system.

## 1. Prerequisites

Make sure you installed the following tools:

- Python 3.10+
- pip
- Git
- MySQL Server 8.0+

## 2. Clone the Repository

```powershell
git clone https://github.com/md-ahad-ali/eco-plus-mvp.git
cd eco-plus-mvp/backend
```

If you already cloned the repository, go directly to the `backend` directory.

## 3. Set Up Virtual Environment

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

## 4. Install Dependencies

Install all required packages:

```powershell
python -m pip install -r requirements.txt
```

## 5. MySQL Database Setup

Make sure MySQL Server runs.

### Initialize Database

Execute the following SQL files in MySQL Workbench in this order:

1. `sql/schema.sql` – Creates the database and tables.
2. `sql/data.sql` – Inserts initial application data, including the demo accounts.

### Verify Database

```sql
USE ecopulse;
SHOW TABLES;
SELECT * FROM users;
```

## 6. Configure the Backend (`.env`)

The backend reads all settings from a `.env` file in the `backend` folder. The repository does not contain this file, so you must create it yourself. The file `.env_example` in the `backend` folder lists every setting with placeholder values. Use it as your reference.

### Create the `.env` file

1. Make a copy of `.env_example` in the `backend` folder.
2. Rename the copy to `.env`.
3. Open `.env` and replace the placeholder values with your own.

### Required settings

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string, for example `mysql+pymysql://root:your_mysql_password@127.0.0.1:3306/ecopulse`. Use the port that your MySQL Server listens on (`3306` for a default install). |
| `OPENAI_API_KEY` | Your OpenAI API key. The AI recommendations do not work without it. |
| `SECRET_KEY` | A long random string for the JWT tokens. Use a password generator or any secure random string tool to create it. |

### Email (SMTP) settings

These settings control the password reset emails: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, and `SMTP_USE_TLS`.

For Gmail, set `SMTP_HOST` to `smtp.gmail.com`, use your Gmail address as `SMTP_USERNAME`, and use a Gmail app password as `SMTP_PASSWORD`. If you leave `SMTP_HOST` empty, the backend prints the password reset links to the console and sends no email.

### Other settings

| Variable | Default in `.env_example` | Purpose |
|---|---|---|
| `HOST` / `PORT` | `127.0.0.1` / `8000` | Address of the API server |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend address for password reset links |
| `TARIFF_EUR_PER_KWH` | `0.30` | Electricity price per kWh |
| `CO2_KG_PER_KWH` | `0.40` | Carbon emissions per kWh |
| `BENCHMARK_KWH_PER_SQM_DAY` | `0.06` | Benchmark value for the sustainability score |
| `MODEL` | `gpt-6-luna` | OpenAI model name for AI features |
| `MAX_TOKENS`, `DAILY_CAP`, `TIMEOUT_S`, `MAX_RETRIES`, `MAX_TEXT_LEN` | `1500`, `20`, `30`, `3`, `2000` | Limits for the AI requests |

> **Note:** The code defines no default values. Every variable from `.env_example` must exist in your `.env` file, or the application stops at startup with an error.

> **Warning:** Never commit your `.env` file to GitHub. It contains secrets, so keep it in `.gitignore`. Commit only `.env_example` with placeholder values.

## 7. Run the Backend

Start the application:

```powershell
python run.py
```

The API runs at:

```text
http://127.0.0.1:8000
```

Press `Ctrl + C` to stop the server.

## 8. API Documentation

FastAPI provides interactive API documentation.

| Documentation | URL |
|---|---|
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

### Basic Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API welcome message |
| `/health` | GET | API health status |
| `/docs` | GET | Swagger documentation |
| `/redoc` | GET | ReDoc documentation |

Swagger UI lists the additional authentication, energy management, analytics, and sustainability endpoints.

## 9. Dependency Management

Update `requirements.txt` after you install new dependencies:

```powershell
python -m pip freeze > requirements.txt
```

Install dependencies on another machine:

```powershell
python -m pip install -r requirements.txt
```

## 10. Common Problems

### ModuleNotFoundError

Activate the virtual environment and reinstall the dependencies from `requirements.txt`.

### Settings Validation Error at Startup

A variable is missing in your `.env` file. Compare it with `.env_example` and add the missing variable.

### MySQL Connection Error

- Make sure MySQL Server runs.
- Verify your MySQL username and password.
- Check the database name and port.
- Verify the `DATABASE_URL` in your `.env` file.
- Make sure PyMySQL is installed.

### Database Does Not Exist

Execute the SQL scripts in the correct order:

```text
1. sql/schema.sql
2. sql/data.sql
```

### Port 8000 Already in Use

Change the `PORT` value in your `.env` file.

## 11. Technology Stack

| Component | Technology |
|---|---|
| Backend Framework | FastAPI |
| ASGI Server | Uvicorn |
| Programming Language | Python |
| Database | MySQL |
| Database Driver | PyMySQL |
| ORM | SQLAlchemy |
| Settings Management | Pydantic Settings |
| Authentication | JWT |
| Email Service | Gmail SMTP |
| AI Integration | OpenAI API |
| Data Analysis | Pandas |
| Version Control | Git and GitHub |

---

**EcoPulse MVP — AI-Powered Smart Energy Management System**

FH Dortmund | Master of Digital Transformation