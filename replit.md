# Overview

TaskCatalyst is an AI-powered productivity application that leverages the Zeigarnik Effect to help users overcome procrastination and build momentum. The app automatically generates micro-tasks (called "catalysts") designed to eliminate startup friction and create unstoppable momentum toward completing larger tasks. Users can create tasks, receive AI-generated actionable subtasks, track their progress, and analyze their productivity patterns through a comprehensive dashboard.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components with Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with dark theme support and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Icons**: Lucide React for consistent iconography

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Authentication**: Replit-based OIDC authentication with session management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type validation and API contract enforcement

## Data Storage
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL with connect-pg-simple for session persistence
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Connection Pooling**: Neon serverless connection pooling for scalable database access

## Authentication & Authorization
- **Provider**: Replit OIDC for seamless development environment integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: HTTP-only cookies with secure session configuration
- **User Management**: Automatic user creation/update on authentication

## AI Integration
- **Primary Provider**: OpenAI API using GPT-4o model for catalyst generation
- **Fallback Support**: Anthropic Claude SDK included for redundancy
- **Prompt Engineering**: Specialized prompts optimized for generating micro-tasks that overcome psychological barriers
- **Response Format**: Structured JSON responses with content and time estimates

## Payment Processing
- **Provider**: Stripe for subscription management
- **Integration**: React Stripe.js for frontend payment forms
- **Features**: Subscription tiers, customer portal, and webhook handling
- **Security**: Server-side payment processing with secure API key management

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC service
- **Payment Processing**: Stripe payment platform
- **AI Services**: OpenAI GPT-4o API (primary), Anthropic Claude API (secondary)

## Development & Deployment
- **Build Tools**: Vite for frontend bundling, esbuild for server compilation
- **Development Environment**: Replit cartographer for live development
- **Runtime Monitoring**: Custom error overlay and logging middleware
- **Package Management**: npm with lockfile version 3

## UI & Styling
- **Component Library**: Radix UI primitives for accessibility
- **Design System**: shadcn/ui component collection
- **Styling Framework**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Typography**: Inter font family from Google Fonts

## Data & Validation
- **ORM**: Drizzle with PostgreSQL dialect
- **Validation**: Zod for schema validation and type inference
- **State Management**: TanStack Query for server state
- **Date Handling**: date-fns for date manipulation and formatting