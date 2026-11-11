# EcoPulse MVP — Backend

EcoPulse MVP is a backend REST API built with **FastAPI** and **Uvicorn**. It uses environment-based configuration through **Pydantic Settings** and a local `.env` file.

## 1. Prerequisites

Make sure the following tools are installed:

- Python 3.10 or later
- pip
- Git
- MySQL Server 8.0 or later
- MySQL Workbench (optional, for database management)
- Visual Studio Code or another code editor (optional)

## 2. Clone the Repository

Clone the repository and navigate to the backend directory:

```powershell
git clone https://github.com/md-ahad-ali/eco-plus-mvp.git
cd eco-plus-mvp/backend
```

If you have already cloned the repository, navigate directly to its backend directory.

## 3. Set Up the Virtual Environment

The project uses a Python virtual environment named `.venv` to isolate project dependencies.

### Create a virtual environment

If the `.venv` folder does not already exist:

```powershell
python -m venv .venv
```

Alternatively, use the Python launcher:

```powershell
py -m venv .venv
```

### Activate the virtual environment

In PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

After successful activation, your terminal prompt should display `(.venv)`.

### If PowerShell blocks activation

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate the environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Verify the environment

```powershell
python -c "import sys; print(sys.executable)"
```

The output should point to:

```text
backend\.venv\Scripts\python.exe
```

To deactivate the environment:

```powershell
deactivate
```

**Note:** Activate the virtual environment whenever you open a new terminal before installing dependencies or running the backend.

## 4. Install Dependencies

With `.venv` activated, install all required Python packages:

```powershell
pip install -r requirements.txt
```


## 5. MySQL Database Setup

EcoPulse uses **MySQL** as its relational database.

Before starting the backend, make sure MySQL Server is installed and running.

### 5.1 Start MySQL Server


```text
backend/
│
├── sql/
│   ├── schema.sql
│   └── data.sql
│
├── config.py
├── requirements.txt
├── run.py
└── ...
```

Open MySQL Workbench and connect to your local MySQL Server.

Open the following SQL file:

```text
backend/sql/schema.sql
```

Execute the entire script.

This creates the `ecopulse` database and its required tables.

### 5.2 Insert Initial Data

After successfully executing `schema.sql`, open:

```text
backend/sql/data.sql
```

Execute the entire script to insert the initial application data.

**Important:** Always execute `schema.sql` before `data.sql` because the initial data depends on the database tables already existing.

### 5.3 Verify Database Setup

Execute the following SQL commands in MySQL Workbench:

```sql
USE ecopulse;

SHOW TABLES;

SELECT * FROM users;
```

If the tables and initial records appear, the database has been initialized successfully.

### Alternative: Execute SQL Files Using MySQL Command Line

You can also initialize the database from PowerShell.

From the project root directory, run:

```powershell
mysql -u root -p < backend/sql/schema.sql
```

Then execute:

```powershell
mysql -u root -p ecopulse < backend/sql/data.sql
```

## 6. Configure MySQL Connection

The database connection is configured in:

```text
backend/config.py
```

Open this file and locate the following configuration:

```python
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@127.0.0.1:3306/ecopulse"
)
```

**You must update the MySQL connection details according to your local MySQL configuration.**

For example, if your MySQL username is `root`, your password is `your_mysql_password`, and your database name is `ecopulse`, configure it as follows:

```python
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:your_mysql_password@127.0.0.1:3306/ecopulse"
)
```

Replace the following values:

| Configuration | Description |
|---|---|
| `root` | Your MySQL username |
| `your_mysql_password` | Your MySQL password |
| `127.0.0.1` | MySQL server address |
| `3306` | MySQL port |
| `ecopulse` | Database name |


### Alternative: Use Environment Variables

You can also configure the connection through the `.env` file.

```dotenv
DATABASE_URL=mysql+pymysql://root:your_mysql_password@127.0.0.1:3306/ecopulse
```

The environment variable takes precedence over the fallback URL in `config.py`.

## 7. Environment Configuration

The backend reads application settings from a `.env` file located in the backend directory.

Create a `.env` file:

```dotenv
APP_NAME=Eco Pulse API
APP_VERSION=1.0.0
HOST=127.0.0.1
PORT=8000
DEBUG=true

DATABASE_URL=mysql+pymysql://root:your_mysql_password@127.0.0.1:3306/ecopulse

SECRET_KEY=replace_with_a_secure_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

TARIFF_EUR_PER_KWH=0.30
CO2_KG_PER_KWH=0.40
BENCHMARK_KWH_PER_SQM_DAY=0.06

FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password
SMTP_FROM=your_email@gmail.com
SMTP_USE_TLS=true
```

Replace the example database credentials, JWT secret, and SMTP credentials with your own values.

### Configuration Reference

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | Eco Pulse API |
| `APP_VERSION` | Application version | 1.0.0 |
| `HOST` | Server host address | 127.0.0.1 |
| `PORT` | Server port | 8000 |
| `DEBUG` | Development reload | true |
| `DATABASE_URL` | MySQL connection URL | Local MySQL |
| `SECRET_KEY` | JWT signing secret | Development fallback |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiration | 1440 |
| `TARIFF_EUR_PER_KWH` | Electricity tariff | 0.30 |
| `CO2_KG_PER_KWH` | CO2 emission factor | 0.40 |
| `BENCHMARK_KWH_PER_SQM_DAY` | Energy consumption benchmark | 0.06 |
| `FRONTEND_URL` | Frontend application URL | http://localhost:5173 |
| `SMTP_HOST` | SMTP server | smtp.gmail.com |
| `SMTP_PORT` | SMTP port | 587 |
| `SMTP_USERNAME` | Sender email address | User-defined |
| `SMTP_PASSWORD` | Google App Password | User-defined |
| `SMTP_FROM` | Sender email address | User-defined |
| `SMTP_USE_TLS` | Enables SMTP TLS | true |

**Configuration notes:**

- `127.0.0.1` makes the API accessible from the local computer.
- `0.0.0.0` listens on all network interfaces.
- `DEBUG=true` enables automatic reloading during development.
- Google SMTP requires a Google App Password when using Gmail authentication.
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440` represents 24 hours.
- Keep `.env` private and never commit it to Git.

## 8. Run the Backend

Make sure:

1. MySQL Server is running.
2. The `ecopulse` database has been created.
3. `schema.sql` and `data.sql` have been executed.
4. MySQL credentials in `config.py` or `.env` are correct.
5. The Python virtual environment is activated.
6. All dependencies are installed.

Navigate to the backend directory and start the application:

```powershell
python run.py
```

The API will be available at:

**http://127.0.0.1:8000**

To stop the server, press `Ctrl + C`.

## 9. API Endpoints

The following basic endpoints are available:

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Returns a welcome message and application status |
| `/health` | GET | Returns the API health status |
| `/docs` | GET | Interactive Swagger API documentation |
| `/redoc` | GET | Alternative ReDoc API documentation |

Additional authentication, energy management, analytics, and other application endpoints are available through the API documentation.

### Example Responses

**GET /**

```json
{
  "message": "Welcome to Eco Pulse API!",
  "status": "running"
}
```

**GET /health**

```json
{
  "status": "healthy"
}
```

### Interactive API Documentation

Once the backend is running, access:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

These interfaces allow developers to inspect, execute, and test the available API endpoints.

## 10. Dependency Management

After installing or updating dependencies, generate the `requirements.txt` file:

```powershell
python -m pip freeze > requirements.txt
```

Other developers can install the recorded dependencies using:

```powershell
python -m pip install -r requirements.txt
```

Keep `requirements.txt` updated whenever project dependencies change.

## 11. Git Configuration

The `.gitignore` file should exclude virtual environments, temporary Python files, and local configuration files.

Recommended `.gitignore` entries:

```gitignore
# Virtual environment
.venv/

# Python cache
__pycache__/
*.py[cod]

# Environment variables
.env

# Testing
.pytest_cache/

# IDE
.vscode/
.idea/
```

Maintain a `.env.example` file containing the required configuration variables and non-sensitive example values.

Commit `.env.example` to Git, but never commit the actual `.env` file or credentials.

## 12. Troubleshooting

### ModuleNotFoundError

Make sure the virtual environment is activated and reinstall the dependencies:

```powershell
python -m pip install -r requirements.txt
```

### pip Command Not Recognized

Use Python to execute pip directly:

```powershell
python -m pip --version
```

### MySQL Connection Error

If the backend cannot connect to MySQL:

1. Make sure MySQL Server is running.
2. Verify the MySQL username and password.
3. Verify the database name is `ecopulse`.
4. Check that the MySQL port is correct (default: 3306).
5. Check the `DATABASE_URL` in `backend/config.py` or `.env`.
6. Confirm that PyMySQL is installed.

Install PyMySQL if necessary:

```powershell
python -m pip install pymysql
```

### Database Does Not Exist

Execute the SQL scripts in the correct order:

```text
1. backend/sql/schema.sql
2. backend/sql/data.sql
```

### PowerShell Blocks Virtual Environment Activation

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Port 8000 Is Already in Use

Change the port in `.env`:

```dotenv
PORT=8001
```

Restart the backend and access it at:

http://127.0.0.1:8001

### Check Installed Dependencies

```powershell
python -m pip list
```

## 13. Technology Stack

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
| Configuration | Environment Variables and `.env` |
| Version Control | Git and GitHub |

## 14. Development Notes

- Keep dependencies isolated in the `.venv` environment.
- Keep sensitive configuration out of version control.
- Update `requirements.txt` whenever dependencies change.
- Initialize the database using the provided SQL files.
- Update the MySQL connection credentials in `backend/config.py` or `.env`.
- Test API endpoints using Swagger UI.
- Keep `.env.example` updated whenever new environment variables are introduced.
- Follow the existing project structure and coding conventions when adding new features.

---

**EcoPulse MVP — AI-Powered Smart Energy Management System**

FH Dortmund | Master of Digital Transformation