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

### Configure the Backend (`config.py`)

Open `config.py` in the `backend` folder and change the values below for your own setup.

**1. Database connection (required)**

```python
DATABASE_URL = "mysql+pymysql://root:your_mysql_password@127.0.0.1:3306/ecopulse"
```

Replace the username, password, host, port, and database name with your MySQL settings. Use the port that your MySQL Server listens on (for example `3306` for a default install).

**2. OpenAI API key (required for AI features)**

```python
OPENAI_API_KEY = "your_openai_api_key"
```

Paste your own OpenAI API key. The AI recommendations do not work without it.

**3. Email (SMTP) settings (optional)**

These settings live in the `Settings` class and control the password reset emails:

```python
smtp_host: str = ""            # e.g. "smtp.gmail.com"
smtp_port: int = 587
smtp_username: str = ""        # your Gmail address
smtp_password: str = ""        # your Gmail app password
smtp_from: str = "no-reply@ecopulse.local"
smtp_use_tls: bool = True
```

If you leave `smtp_host` empty, the backend prints the password reset links to the console and sends no email. You can also set these values in a `.env` file inside the `backend` folder (for example `SMTP_HOST=smtp.gmail.com`).

**4. Security settings (recommended)**

```python
SECRET_KEY = "change-this-to-a-long-random-string"
```

Change `SECRET_KEY` (and `secret_key` in the `Settings` class) before any real deployment. The JWT tokens use this key.

**5. Other settings (optional)**

| Setting | Default | Purpose |
|---|---|---|
| `host` / `port` | `127.0.0.1` / `8000` | Address of the API server |
| `frontend_url` | `http://localhost:5173` | Frontend address for password reset links |
| `TARIFF` | `0.30` | Electricity price per kWh |
| `CO2_FACTOR` | `0.40` | Carbon emissions per kWh |
| `BENCHMARK` | `0.06` | Benchmark value for the sustainability score |
| `MODEL` | `gpt-6-luna` | OpenAI model name for AI features |
| `MAX_TOKENS`, `DAILY_CAP`, `TIMEOUT_S`, `MAX_RETRIES`, `MAX_TEXT_LEN` | `1500`, `20`, `30`, `3`, `2000` | Limits for the AI requests |

> **Warning:** Never commit real API keys, passwords, or secrets to GitHub. Keep them in a local file that Git ignores, such as `.env`.

## 6. Run the Backend

Start the application:

```powershell
python run.py
```

The API runs at:

```text
http://127.0.0.1:8000
```

Press `Ctrl + C` to stop the server.

## 7. API Documentation

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

## 8. Dependency Management

Update `requirements.txt` after you install new dependencies:

```powershell
python -m pip freeze > requirements.txt
```

Install dependencies on another machine:

```powershell
python -m pip install -r requirements.txt
```

## 9. Troubleshooting

### ModuleNotFoundError

Activate the virtual environment and reinstall the dependencies:

```powershell
python -m pip install -r requirements.txt
```

### MySQL Connection Error

- Make sure MySQL Server runs.
- Verify your MySQL username and password.
- Check the database name and port.
- Verify the `DATABASE_URL` in `config.py`.
- Make sure PyMySQL is installed.

### Database Does Not Exist

Execute the SQL scripts in the correct order:

```text
1. sql/schema.sql
2. sql/data.sql
```

### Port 8000 Already in Use

Change the application port (`port: int = 8000`) in `config.py`.

## 10. Technology Stack

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
| Data Processing | Pandas |
| Version Control | Git and GitHub |

---

**EcoPulse MVP — AI-Powered Smart Energy Management System**

FH Dortmund | Master of Digital Transformation