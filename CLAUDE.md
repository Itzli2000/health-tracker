# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package Manager**: Uses pnpm (configured in package.json)

**Development**:
- `pnpm dev` - Start development server with Vite
- `pnpm build` - TypeScript compilation + production build
- `pnpm preview` - Preview production build

**Testing**:
- `pnpm test` - Run Vitest tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm coverage` - Run tests with coverage report

**Code Quality**:
- `pnpm lint` - Run ESLint linter

**Git Hooks**:
- Pre-commit: Runs `pnpm test`
- Pre-push: Runs `pnpm build`

## Architecture Overview

This is a React-based health tracking application built with Vite and TypeScript. The project follows a domain-driven architecture pattern optimized for health data management.

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand for global state, React Hook Form for forms
- **UI**: shadcn/ui components + Tailwind CSS
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Package Manager**: pnpm

### Key Architecture Documents
- `.claude/documents/architecture-guide.md` - Complete frontend architecture guide with detailed patterns, constraints, and coding standards
- `.claude/agents/health-tracker-frontend-dev.md` - Specialized agent configuration for Health Tracker development

### Critical Constraints
- **NEVER use localStorage for health data** - only for UI preferences
- **NEVER use HTML forms** - always use React Hook Form
- **NEVER use libraries outside approved tech stack**
- **State management hierarchy**: Zustand (global) → React Hook Form (forms) → useState (local UI)

### Project Structure
```
src/
├── app/           # Application setup & providers
├── shared/        # Reusable components, hooks, utils, services
├── domains/       # Feature domains (dashboard, sessions, measurements, etc.)
└── styles/        # Global styles
```

### Domain-Driven Organization
Each feature domain contains:
- `components/` - Feature-specific UI components  
- `hooks/` - Custom hooks for domain logic
- `services/` - API calls and data operations
- Domain page component (e.g., `DashboardPage.jsx`)

### Development Patterns
- Mobile-first responsive design
- Component composition with shadcn/ui
- Form handling with React Hook Form + Zod validation
- Charts with Recharts library
- Import organization: React → External → UI → Internal → Hooks → Services → Utils

### Path Aliases
- `@/` maps to `src/`
- `@components/` maps to `src/components/`

Before making changes, always reference the architecture guide at `.claude/documents/architecture-guide.md` for detailed patterns and constraints.