# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the React frontend of the Socratic Books project.

## Project Architecture

This is a React/TypeScript frontend for an AI-powered Socratic learning platform that integrates with the DARE backend for authentication and LLM services. The application focuses on educational chat interactions with AI tutors and progress tracking.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Code quality
npm run lint          # ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Prettier formatting
npm run format:check  # Check formatting
npm run preview       # Preview build

# Package management
npm install           # Install dependencies
```

## Tech Stack & Patterns

### Core Technologies
- **React 19**: Latest React with functional components and hooks
- **TypeScript**: Full type safety throughout the application
- **Vite**: Modern build tool with fast HMR
- **Zustand**: Lightweight state management (not Redux)
- **React Router v7**: Client-side routing
- **Tailwind CSS v4**: Utility-first styling with latest version
- **React Hook Form**: Form handling with Zod validation
- **TanStack Query**: Server state management and caching
- **Radix UI**: Headless component primitives
- **TipTap**: Rich text editor for chat interfaces

### State Management Architecture

**Zustand Store Pattern:**
```typescript
// Uses Zustand instead of Redux
interface AppState {
  user: UserState,
  chat: ChatState,
  files: FileState,
  theme: ThemeState
}
```

**State Management Patterns:**
- Zustand stores for global state
- TanStack Query for server state and caching
- Local component state with useState/useReducer
- React Hook Form for form state

### Component Architecture

**Component Organization:**
```
src/
├── components/        # Reusable UI components
├── pages/            # Route-level page components
├── hooks/            # Custom React hooks
├── services/         # API layer and external services
├── stores/           # Zustand stores
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── lib/              # Library configurations
```

**Component Patterns:**
- Functional components with TypeScript interfaces
- Custom hooks for business logic
- Compound component pattern for complex UI
- Form components with React Hook Form + Zod validation

### Styling Patterns

**Tailwind CSS v4 Architecture:**
- Latest Tailwind v4 with native CSS architecture
- CSS custom properties for theme system
- Component-first approach with `@apply` directives
- Dark mode support with CSS custom properties
- Responsive design patterns

**Component Styling Pattern:**
```typescript
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground"
      }
    }
  }
)
```

### API Integration Patterns

**TanStack Query Integration:**
```typescript
// API layer with React Query
export const useChatsQuery = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => fetchChats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

**Axios Configuration:**
- Base URL configuration for Socratic Books backend
- Request/response interceptors for auth tokens
- Error handling middleware

### Authentication & DARE Integration

**Authentication Flow:**
- JWT-based authentication through Socratic Books backend
- Backend communicates with DARE backend for user auth
- Token management with automatic refresh
- Protected route components

**DARE Backend Integration:**
- Socratic Books backend acts as proxy to DARE
- Authentication, file processing, and LLM services from DARE
- Seamless user experience across both platforms

### Form Management

**React Hook Form + Zod Pattern:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1, 'Message is required')
})

const ChatForm = () => {
  const form = useForm({
    resolver: zodResolver(schema)
  })
}
```

### Chat Interface Patterns

**TipTap Rich Text Editor:**
- Extensible rich text editing for chat inputs
- Custom extensions for educational content
- Markdown support for formatting
- Placeholder extensions for user guidance

**Streaming Chat Responses:**
- Server-sent events for real-time AI responses
- Progressive message building
- Typing indicators and loading states

### File Management

**File Upload & Processing:**
- React Dropzone for drag-and-drop uploads
- File type validation and size limits
- Progress tracking for processing status
- Integration with DARE backend for file processing

### Educational Features

**Progress Tracking:**
- AI-powered assessment of student understanding
- Learning milestone tracking
- Personalized learning paths
- Progress visualization components

**Socratic Method Implementation:**
- Question-based learning interactions
- AI tutors that guide rather than provide direct answers
- Critical thinking prompts and exercises

### Route Architecture

**React Router v7 Patterns:**
```typescript
// Data loading with new React Router patterns
export const loader = ({ params }) => {
  return defer({
    chat: getChatData(params.chatId),
    messages: getMessagesData(params.chatId)
  })
}
```

### TypeScript Patterns

**Type Organization:**
```
src/types/
├── api.ts           # API response types
├── chat.ts          # Chat-related types
├── user.ts          # User & auth types
└── common.ts        # Shared utility types
```

### UI Component System

**Radix UI + Custom Components:**
- Accessible component primitives
- Consistent design system
- Theme-aware components
- Educational-specific UI patterns

### Environment Configuration

**Environment Variables:**
```typescript
// Vite environment configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const DARE_BACKEND_URL = import.meta.env.VITE_DARE_BACKEND_URL
```

### Development Patterns

**Code Quality:**
- **ESLint**: Enhanced configuration for React 19
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality checks
- **lint-staged**: Pre-commit formatting and linting

**Performance Patterns:**
- React.lazy() for code splitting
- Memoization with useMemo/useCallback
- TanStack Query for efficient data fetching
- Virtual scrolling for large chat histories

### Educational Platform Features

**AI Tutor Integration:**
- Multiple AI model support via DARE backend
- Educational prompt engineering
- Adaptive learning based on student responses
- Context-aware tutoring sessions

**Book & Chapter Management:**
- Structured learning content organization
- Chapter-based progress tracking
- Note-taking and annotation features
- Cross-referencing between materials

### Development Workflow

**Working Directory:**
- Work from root DARE directory when developing Socratic Books
- This provides access to both Socratic Books and DARE backend
- Frontend runs on different port than DARE frontend

**Integration Testing:**
- Test authentication flow with DARE backend
- Verify file processing pipeline
- Chat functionality with AI models
- Progress tracking accuracy

### Common Development Tasks

**Adding New Chat Features:**
1. Update chat types in `types/chat.ts`
2. Create API functions in `services/`
3. Add TanStack Query hooks
4. Update chat components

**Adding New Educational Components:**
1. Follow Radix UI patterns for accessibility
2. Implement educational interaction patterns
3. Add progress tracking integration
4. Test with different learning scenarios

**Backend Communication:**
- All API calls go through Socratic Books backend
- Backend handles DARE integration automatically
- Frontend remains agnostic of DARE backend details

### Deployment Considerations

- Build optimization for educational content
- CDN configuration for static assets
- Environment-specific API endpoints
- Performance monitoring for learning analytics