# EcoPulse MVP — Backend

EcoPulse MVP is a backend REST API built with **FastAPI** and **Uvicorn**. It uses environment-based configuration through **Pydantic Settings** and a local `.env` file.

## 1. Prerequisites

Make sure the following tools are installed:

- Python
- pip
- Git
- Visual Studio Code or another code editor (optional)

## 2. Clone the Repository

Clone the repository and navigate to the backend directory:

```powershell
git clone https://github.com/md-ahad-ali/eco-plus-mvp.git
cd eco-pulse-mvp/backend
```

If you have already cloned the repository, navigate directly to its backend directory.

## 3. Set Up the Virtual Environment

The project uses a Python virtual environment named `.venv` to isolate project dependencies.

### Create a virtual environment

If `.venv` folder does not already exist:

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

With `.venv` activated, install the required packages:

```powershell
pip install -r requirements.txt
```

## 5. Environment Configuration

The backend reads application settings from a `.env` file located in the backend directory.

Create a `.env` file with the following configuration:

```dotenv
APP_NAME=Eco Pulse API
APP_VERSION=1.0.0
HOST=127.0.0.1
PORT=8000
DEBUG=true
```

### Configuration Reference

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Application name | Eco Pulse API |
| `APP_VERSION` | Application version | 1.0.0 |
| `HOST` | Server host address | 127.0.0.1 |
| `PORT` | Server port | 8000 |
| `DEBUG` | Enables development reload | true |

**Configuration notes:**

- `127.0.0.1` makes the API accessible from the local computer.
- `0.0.0.0` listens on all network interfaces.
- `DEBUG=true` enables automatic reloading during development.

Do not commit `.env` files containing secrets or sensitive configuration to Git.

## 6. Run the Backend

Make sure you are in the backend directory and the virtual environment is activated.

Start the application using:

```powershell
python run.py
```

The API will be available at:

**http://127.0.0.1:8000**

To stop the server, press `Ctrl + C`.

## 7. API Endpoints

The following endpoints are available:

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Returns a welcome message and application status |
| `/health` | GET | Returns the API health status |
| `/docs` | GET | Opens interactive Swagger API documentation |
| `/redoc` | GET | Opens alternative ReDoc API documentation |

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

Once the backend is running, access the following documentation interfaces:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

These interfaces allow developers to inspect, execute, and test available API endpoints.

## 8. Dependency Management

After installing or updating dependencies, generate the `requirements.txt` file:

```powershell
python -m pip freeze > requirements.txt
```

Other developers can install the recorded dependencies using:

```powershell
python -m pip install -r requirements.txt
```

Keep `requirements.txt` updated whenever project dependencies change.

## 9. Git Configuration

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
```

Maintain a `.env.example` file containing the required configuration variables and non-sensitive example values.

Commit `.env.example` to Git, but never commit the actual `.env` file.

## 10. Troubleshooting

### ModuleNotFoundError

Make sure the virtual environment is activated and reinstall the dependencies:

```powershell
python -m pip install fastapi uvicorn pydantic-settings
```

### pip Command Not Recognized

Use Python to execute pip directly:

```powershell
python -m pip --version
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

## Technology Stack

- **Backend Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Settings Management:** Pydantic Settings
- **Configuration:** Environment variables and `.env`
- **Programming Language:** Python
- **Version Control:** Git and GitHub

## Development Notes

- Keep dependencies isolated in the `.venv` environment.
- Keep sensitive configuration out of version control.
- Update `requirements.txt` whenever dependencies change.
- Test API endpoints using Swagger UI.
- Follow the existing project structure and coding conventions when adding new features.

---

**EcoPulse MVP — AI-Powered Smart Energy Management System**

FH Dortmund | Master of Digital Transformation