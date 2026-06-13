# School Management System

A modern, responsive School Management System featuring a React frontend built with Vite and a lightweight Python Flask backend.

## 📁 Project Structure

```text
school/
├── client/          # Frontend React + Vite application
│   ├── src/         # Source code (Components, Pages, Assets)
│   ├── package.json # NPM dependencies & scripts
│   └── vite.config.js
├── server/          # Backend Flask API
│   ├── app.py       # Main backend entry point and API endpoints
│   ├── database.py  # SQLite Database schema and initialization logic
│   └── pyproject.toml # Python dependencies configuration
├── .gitignore       # Root-level Git ignore settings
└── README.md        # This file
```

---

## 🛠️ Prerequisites

Before you run the project on any computer, make sure you have the following installed:
1. **Node.js** (v18.x or later recommended) - [Download Node.js](https://nodejs.org/)
2. **Python** (v3.10 or later recommended) - [Download Python](https://www.python.org/)
3. **`uv`** (Fast Python package installer and manager - recommended) - [Install UV](https://github.com/astral-sh/uv)
   - *Optional but highly recommended. If you don't use `uv`, you can fall back to standard `pip` and virtual environments.*

---

## 🚀 Running the Project Locally

To run this project, you need to start both the **Backend Server** and the **Frontend Client**.

### 1. Run the Backend (Flask API)
Open a terminal inside the `server/` directory and run:

**Using `uv` (Fastest & recommended):**
```bash
# Installs dependencies and starts the server
uv run app.py
```

**Using Standard Python (Alternative):**
```bash
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment:
# On Windows (cmd):
.venv\Scripts\activate.bat
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt   # or run: pip install flask flask-cors

# Start the Flask app
python app.py
```
> **Note:** The server will automatically initialize a local SQLite database named `school.db` with default seed data (Admin, Teacher, and Parent accounts) if it does not exist yet.

The backend server runs on: **`http://localhost:5000`**

### 2. Run the Frontend (React Client)
Open a new, separate terminal inside the `client/` directory and run:

```bash
# Install package dependencies
npm install

# Start the development server
npm run dev
```

The frontend client will start running. You can open it in your browser (typically **`http://localhost:5173`**).

---

## 👥 Seed User Credentials

When the database initializes for the first time, it seeds the following testing credentials:

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` |
| **Teacher** | `teacher@school.com` | `teacher123` |
| **Parent** | `parent@school.com` | `parent123` |

---

## 💻 Instructions for Another PC (Clone & Setup)

To run this project on another computer, follow these simple steps:

### 1. Clone the Repository
Open a terminal on the destination PC and run:
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd school
```

### 2. Run the Backend
```bash
cd server
uv run app.py
```
*(Alternatively, follow the Python virtual environment setup listed in the **Running the Project Locally** section.)*

### 3. Run the Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
