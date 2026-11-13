# EcoPulse MVP — Frontend

EcoPulse MVP is a web-based frontend application built with **React, TypeScript, and Vite**. It provides an interactive user interface for the AI-Powered Smart Energy Management System.

## 1. Prerequisites

Make sure you installed the following tools:

- Node.js 24+
- npm
- Git

## 2. Clone the Repository

Clone the repository and go to the frontend directory:

```powershell
git clone https://github.com/md-ahad-ali/eco-plus-mvp.git
cd eco-plus-mvp/ui
```

If you already cloned the repository, go directly to the `ui` directory.

## 3. Install Dependencies

Install all required frontend dependencies:

```powershell
npm install
```

## 4. Run the Development Server

Start the Vite development server:

```powershell
npm run dev
```

After a successful start, the terminal shows:

```text
VITE ready

Local: http://localhost:5173/
```

Open the following URL in your browser:

**http://localhost:5173/**

Vite supports Hot Module Replacement (HMR). The application updates automatically when you change source files.

Press `Ctrl + C` to stop the development server.

## 5. Demo Accounts

Start the backend first, then log in with one of these accounts:

| User Role | Username | Password |
|---|---|---|
| Building Manager | `demo_manager` | `123456` |
| Admin | `demo_admin` | `123456` |

## 6. Available Scripts

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |

## 7. Project Structure

```text
ui/
├── public/                  # Static public assets
├── src/
│   ├── api/                 # API integration and requests
│   ├── assets/              # Images and static assets
│   ├── components/          # Reusable UI components
│   ├── data/                # Application data
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Application layouts
│   ├── lib/                 # Utility functions and libraries
│   ├── pages/               # Application pages
│   │   └── auth/            # Authentication pages
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── index.html               # HTML entry point
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 8. Build for Production

Generate an optimized production build:

```powershell
npm run build
```

The production files appear in the `dist/` directory.

To preview the production build locally:

```powershell
npm run preview
```

## 9. Backend Integration

The frontend communicates with the EcoPulse backend through REST API endpoints.

Make sure the backend runs before you test features that need API communication. See the [Backend README](../backend/README.md) for setup steps.

**Backend API:**

```text
http://127.0.0.1:8000
```

**Backend API Documentation:**

```text
http://127.0.0.1:8000/docs
```

## 10. Troubleshooting

### Dependencies Not Installed

Run:

```powershell
npm install
```

### Port 5173 Already in Use

Vite may select another available port automatically. You can also set a port yourself:

```powershell
npm run dev -- --port 5174
```

### TypeScript Build Errors

Run the production build to find TypeScript and compilation errors:

```powershell
npm run build
```

### Clear Dependencies and Reinstall

If dependency issues occur, try:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## 11. Technology Stack

| Component | Technology |
|---|---|
| UI Library | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| API Communication | Fetch API |
| Package Manager | npm |

## 12. Development Notes

- Run `npm install` after you clone the repository.
- Use `npm run dev` for local development.
- Follow the existing component and folder structure.
- Keep components reusable and maintainable.
- Use the `api/` directory for backend communication.
- Use the `hooks/` directory for reusable React hooks.
- Run `npm run build` before you commit changes to verify the production build.

---

**EcoPulse MVP — AI-Powered Smart Energy Management System**

FH Dortmund | Master of Digital Transformation