# Frontend Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone <your-frontend-repo-url>
cd rapprochement-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Environment Variables

See `.env.example` for required configuration:
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000)

## Build for Production

```bash
npm run build
# or
yarn build
```

The production build will be in the `dist/` directory.

## Project Structure

```
front/
├── components/         # React components
├── services/          # API service layer
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Features

- 📊 Dashboard with real-time metrics
- 📁 File upload (CSV/PDF)
- 🔄 Automatic reconciliation
- 🤖 AI-assisted matching (Gemini)
- 📈 Reports and visualizations
- 📥 Export (Excel, PDF, CSV)
- 🔐 User authentication
- 📝 Regularization entries (PCN compliant)

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide Icons
