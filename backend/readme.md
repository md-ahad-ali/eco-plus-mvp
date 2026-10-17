# Eco Pulse MVP — Backend

Eco Pulse MVP is a backend REST API built with **FastAPI** and **Uvicorn**. It uses environment-based configuration through Pydantic Settings and a local `.env` file.

## 1. Requirements

Before getting started, make sure you have installed:

- Python
- pip
- Git
- Visual Studio Code or another code editor (optional)

## 2. Clone the Repository

Clone the GitHub repository and navigate to the backend directory:

```powershell
git clone YOUR_REPOSITORY_URL
cd eco-pulse-mvp\backend
```

Replace `YOUR_REPOSITORY_URL` with the actual GitHub repository URL.

If you have already cloned the repository, navigate directly to its backend directory.

## 3. Activate the Virtual Environment

The project uses a Python virtual environment named `.venv` to keep dependencies separate from your system-wide Python installation.

### If `.venv` already exists

Activate it in PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

When activation succeeds, your terminal prompt should begin with `(.venv)`.
If you want to deactivate .venv write `deactivate`

### If `.venv` does not exist

Create it:

```powershell
python -m venv .venv
```

If the `python` command is unavailable, try:

```powershell
py -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

### If PowerShell blocks activation

Run the following command in the current PowerShell session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate the environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

This policy change applies only to the current PowerShell process.

### Verify activation

```powershell
python -c "import sys; print(sys.executable)"
```

The output should point to the Python executable inside `backend\.venv\Scripts\python.exe`.

**Important:** Activate `.venv` before installing dependencies or running the backend. Reactivate it whenever you open a new terminal.

## 4. Install Dependencies

With `.venv` activated, install the required packages:

```powershell
python -m pip install fastapi uvicorn pydantic-settings
```

Use `python -m pip` to ensure packages are installed into the Python environment currently active in the terminal.

## 5. Configure Environment Variables

The backend reads its settings from a `.env` file in the backend directory.

Create a local `.env` file with the following values:

```dotenv
APP_NAME=Eco Pulse API
APP_VERSION=1.0.0
HOST=127.0.0.1
PORT=8000
DEBUG=true
```

### Configuration reference

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | API application name | `Eco Pulse API` |
| `APP_VERSION` | API version | `1.0.0` |
| `HOST` | Server bind address | `127.0.0.1` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Enables development reload | `true` |

- `127.0.0.1` makes the API accessible from the local computer.
- `0.0.0.0` listens on all network interfaces. Use it only when network access is intended and appropriately secured.
- `DEBUG=true` enables automatic reloading during development.

Do not commit secrets, credentials, or other sensitive values in `.env`.

## 6. Run the Backend

Ensure that your terminal is in the backend directory and `.venv` is active.

Start the application:

```powershell
python run.py
```

The API will be available at:

`http://127.0.0.1:8000`

To stop the server, press `Ctrl + C`.

## 7. API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Returns a welcome message and application status |
| `/health` | GET | Returns the API health status |
| `/docs` | GET | Opens the interactive Swagger API documentation |
| `/redoc` | GET | Opens the alternative ReDoc API documentation |

### Example responses

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

### API documentation

Once the backend is running, open:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

These interfaces allow developers to inspect and test the available endpoints.

## 8. Dependency Management

After installing or updating project dependencies, update `requirements.txt` from the active virtual environment:

```powershell
python -m pip freeze > requirements.txt
```

Other developers can then install the recorded dependencies with:

```powershell
python -m pip install -r requirements.txt
```

Keep `requirements.txt` updated whenever project dependencies change.

## 9. Git and Environment Files

The `.gitignore` file should exclude local environments, temporary Python files, and local configuration:

```gitignore
.venv/
__pycache__/
*.py[cod]
.env
.pytest_cache/
```

The `.venv` directory should not be committed to Git. Each developer should create their own virtual environment.

For shared configuration, maintain a `.env.example` file containing the required variable names and non-sensitive example values. Commit `.env.example`, but keep the actual `.env` file local.

## 10. Troubleshooting

### `ModuleNotFoundError`

Activate `.venv` and reinstall the dependencies:

```powershell
python -m pip install fastapi uvicorn pydantic-settings
```

### PowerShell blocks activation

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Port 8000 is already in use

Change `PORT` in `.env`, for example:

```dotenv
PORT=8001
```

Restart the backend and use `http://127.0.0.1:8001` instead.

### Confirm installed dependencies

```powershell
python -m pip list
```

### Deactivate the virtual environment

When finished, run:

```powershell
deactivate
```

---

## Technology Stack

- **Framework:** FastAPI
- **ASGI server:** Uvicorn
- **Settings management:** Pydantic Settings
- **Environment configuration:** `.env`
- **Version control:** Git and GitHub

## Development Notes

- Keep dependencies isolated in `.venv`.
- Keep environment-specific configuration out of version control.
- Update `requirements.txt` when dependencies change.
- Test API endpoints through Swagger UI before submitting changes.
- Follow the repository's existing conventions when adding new endpoints or features.