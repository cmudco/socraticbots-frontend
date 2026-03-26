# Socratic Bots Frontend Development Rules

This document defines coding standards and patterns for the Socratic Bots frontend. Follow these rules to maintain code quality, readability, and developer experience.

---

## 1. Naming & Casing

- **Always use `camelCase`** for all properties, variables, API responses, and state.
- Backend uses `djangorestframework-camel-case` for auto-conversion; FE should expect `camelCase`.
- Never use `snake_case` in TypeScript interfaces or API response types.
- **Auto-conversion reminder**: Every request from FE is converted to `snake_case` by BE, and every response from BE is converted to `camelCase` by BE. FE never needs to handle this manually.

---

## 2. TypeScript Types & Interfaces

- **Use interfaces, not loose types**. Always define proper interfaces for data structures.
- **Single source of truth**: Reuse types defined for BE responses; don't duplicate or recreate similar types.
- **Avoid `Record<string, T>`**: Use explicit interfaces for better readability and type safety.
- **Array syntax**: Use `MyInterface[]` instead of `Array<MyInterface>` for consistency and readability.
- **No `any` types**: Always use proper types; if unsure, define an interface.

**Example:**

```typescript
// Good - Explicit interface
interface Bot {
  id: number
  name: string
  systemPrompt: string
  voiceConfig?: VoiceConfig
}

// Bad - Loose typing
type Bot = Record<string, any>
```

---

## 3. Enums & Constants

- Use TypeScript `enum` or `const` objects for finite option sets.
- Store constants in `src/constants/` organized by domain.
- Never use string literals for type checks; use enum values for robust validation.

**Example:**

```typescript
// constants/bot.ts
export const BotMode = {
  CHAT: 'chat',
  VOICE: 'voice',
  HYBRID: 'hybrid',
} as const;

export type BotMode = (typeof BotMode)[keyof typeof BotMode];

// Usage
if (bot.mode === BotMode.VOICE) {
  // Handle voice bot
}
```

---

## 4. Imports

- All imports at top of file; no inline imports.
- Group imports: React → external libs → internal paths → relative paths.
- Use path aliases (`@/`) for cleaner imports.

**Example:**

```typescript
// React
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// External libraries
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuthStore } from '@/stores/authStore';

import { BotService } from '@/services/botService';

// Internal paths (using @ alias)
import { Button } from '@/components/ui/Button';

import { Bot, VoiceConfig } from '@/types/bot';

// Relative paths
import { BotCard } from './BotCard';
```

---

## 5. State Management (Zustand)

### Store Organization

```
src/stores/
├── authStore.ts       # Authentication state
├── chatStore.ts       # Chat/conversation state
├── botStore.ts        # Bot configuration state
├── voiceStore.ts      # Voice agent state
└── uiStore.ts         # UI state (modals, sidebars)
```

### Store Pattern

**Good** - Clean Zustand store with typed interface:

```typescript
interface BotState {
  bots: Bot[];
  selectedBot: Bot | null;
  isLoading: boolean;

  // Actions
  setBots: (bots: Bot[]) => void;
  selectBot: (bot: Bot) => void;
  clearSelection: () => void;
}

export const useBotStore = create<BotState>(set => ({
  bots: [],
  selectedBot: null,
  isLoading: false,

  setBots: bots => set({ bots }),
  selectBot: bot => set({ selectedBot: bot }),
  clearSelection: () => set({ selectedBot: null }),
}));
```

### Store Best Practices

1. **Keep stores focused**: One store per domain concern
2. **Actions in store**: Define state mutations as store actions
3. **Derived state**: Use selectors for computed values
4. **No async in stores**: Use TanStack Query for async operations

---

## 6. Server State (TanStack Query)

### Query Patterns

**Good** - Query with proper typing and caching:

```typescript
// hooks/useBots.ts
export const useBots = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: () => BotService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBot = (botId: number) => {
  return useQuery({
    queryKey: ['bots', botId],
    queryFn: () => BotService.getById(botId),
    enabled: !!botId,
  });
};
```

### Mutation Patterns

**Good** - Mutation with optimistic updates:

```typescript
export const useCreateBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBotDTO) => BotService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });
};
```

### Query Key Conventions

```typescript
// Consistent query key structure
['bots'][('bots', botId)][('bots', botId, 'conversations')][ // All bots // Single bot // Bot's conversations
  ('conversations', convId, 'transcript')
]; // Conversation transcript
```

---

## 7. Service Layer (API Integration)

### Service Organization

```
src/services/
├── api.ts              # Axios instance with interceptors
├── authService.ts      # Authentication API calls
├── botService.ts       # Bot CRUD operations
├── conversationService.ts  # Conversation management
├── voiceService.ts     # Voice agent operations
└── types.ts            # Shared service types
```

### Service Pattern

**Good** - Typed service with clean API methods:

```typescript
// services/botService.ts
import { Bot, CreateBotDTO, UpdateBotDTO } from '@/types/bot';

import api from './api';

export const BotService = {
  getAll: async (): Promise<Bot[]> => {
    const { data } = await api.get('/bots/');
    return data;
  },

  getById: async (id: number): Promise<Bot> => {
    const { data } = await api.get(`/bots/${id}/`);
    return data;
  },

  create: async (dto: CreateBotDTO): Promise<Bot> => {
    const { data } = await api.post('/bots/', dto);
    return data;
  },

  update: async (id: number, dto: UpdateBotDTO): Promise<Bot> => {
    const { data } = await api.patch(`/bots/${id}/`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bots/${id}/`);
  },
};
```

### API Instance Configuration

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401, refresh token, etc.
    return Promise.reject(error);
  }
);

export default api;
```

---

## 8. Components

### One Component Per File

Each React component must be in its own file. Never define multiple components in a single file, even if they are small helper components.

### Component Organization

```
src/components/
├── ui/                 # Reusable UI primitives (Button, Input, Dialog)
├── layout/             # Layout components (Sidebar, Header, PageContainer)
├── bots/               # Bot-related components
├── chat/               # Chat interface components
├── voice/              # Voice agent components
└── common/             # Shared business components
```

### Component Pattern

**Good** - Clean component with proper types:

```typescript
// components/bots/BotCard.tsx
interface BotCardProps {
  bot: Bot
  onSelect: (bot: Bot) => void
  isSelected?: boolean
}

export const BotCard = ({ bot, onSelect, isSelected = false }: BotCardProps) => {
  const handleClick = useCallback(() => {
    onSelect(bot)
  }, [bot, onSelect])

  return (
    <div
      className={cn(
        "rounded-lg border p-4 cursor-pointer transition-colors",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={handleClick}
    >
      <h3 className="font-semibold">{bot.name}</h3>
      <p className="text-sm text-muted-foreground">{bot.systemPrompt}</p>
    </div>
  )
}
```

---

## 9. Styling (Tailwind CSS v4)

### Always Use Tailwind

- **Always use Tailwind CSS** for styling components
- Never create separate `.css` files unless absolutely mandatory (e.g., global styles)
- Use Tailwind utility classes directly in component JSX/TSX

### Use `cn()` Utility for Class Merging

```typescript
import { cn } from '@/lib/utils'

<button
  className={cn(
    "px-4 py-2 rounded-md font-medium",
    variant === "primary" && "bg-primary text-white",
    variant === "secondary" && "bg-secondary text-secondary-foreground",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  {children}
</button>
```

### Class Variance Authority (CVA) for Variants

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export const Button = ({ variant, size, children }: ButtonProps) => {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
```

---

## 10. Forms (React Hook Form + Zod)

### Form Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createBotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  mode: z.enum(['chat', 'voice', 'hybrid']),
  voiceId: z.string().optional(),
})

type CreateBotForm = z.infer<typeof createBotSchema>

export const CreateBotDialog = () => {
  const { mutate: createBot, isPending } = useCreateBot()

  const form = useForm<CreateBotForm>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: '',
      systemPrompt: '',
      mode: 'chat',
    },
  })

  const onSubmit = (data: CreateBotForm) => {
    createBot(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 11. useEffect Best Practices

- **Keep dependencies minimal**: Don't add unnecessary dependencies that can cause infinite renders
- **Use eslint-disable when appropriate**: If a dependency causes issues, use `// eslint-disable-next-line react-hooks/exhaustive-deps`
- **Avoid multiple useEffects for related logic**: Combine related side effects when possible
- **Run once on mount**: For data fetching, prefer TanStack Query over useEffect

**Prefer TanStack Query over useEffect for data fetching:**

```typescript
// Bad - useEffect for data fetching
useEffect(() => {
  fetchBots().then(setBots);
}, []);

// Good - TanStack Query
const { data: bots } = useBots();
```

---

## 12. Type Organization

```
src/types/
├── api.ts           # Generic API response types
├── auth.ts          # User & authentication types
├── bot.ts           # Bot-related types
├── conversation.ts  # Chat/conversation types
├── voice.ts         # Voice agent types
└── common.ts        # Shared utility types
```

### Type Definition Pattern

```typescript
// types/bot.ts
export interface Bot {
  id: number;
  name: string;
  systemPrompt: string;
  mode: BotMode;
  modelId: number;
  temperature: number;
  voiceConfig?: VoiceConfig;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceConfig {
  voiceId: string;
  agentId?: string;
  language: string;
  firstMessage?: string;
}

export interface CreateBotDTO {
  name: string;
  systemPrompt: string;
  mode: BotMode;
  modelId: number;
  temperature?: number;
  voiceConfig?: Partial<VoiceConfig>;
}

export interface UpdateBotDTO extends Partial<CreateBotDTO> {}
```

---

## 13. Data Schema Design (Clean BE-FE Contracts)

### Separate Fields for Different Data Types

When a field can contain different data structures based on context, **use separate named fields** instead of union types.

**Bad** - Ambiguous union type:

```typescript
interface Bot {
  config?: VoiceConfig | ChatConfig; // Which one is it?!
}
```

**Good** - Separate named fields:

```typescript
interface Bot {
  /** Voice configuration (when mode === 'voice' or 'hybrid') */
  voiceConfig?: VoiceConfig;

  /** Chat configuration (when mode === 'chat' or 'hybrid') */
  chatConfig?: ChatConfig;
}
```

### Usage Pattern

```typescript
// Check which config based on mode
if (bot.mode === BotMode.VOICE && bot.voiceConfig) {
  // Use bot.voiceConfig (typed as VoiceConfig)
  startVoiceSession(bot.voiceConfig.agentId);
} else if (bot.chatConfig) {
  // Use bot.chatConfig (typed as ChatConfig)
  startChatSession(bot.chatConfig.systemPrompt);
}
```

---

## 14. Hooks Organization

```
src/hooks/
├── useAuth.ts           # Authentication hook
├── useBots.ts           # Bot queries & mutations
├── useConversations.ts  # Conversation management
├── useVoice.ts          # Voice agent integration
├── useMediaQuery.ts     # Responsive utilities
└── useDebounce.ts       # Utility hooks
```

### Custom Hook Pattern

```typescript
// hooks/useVoiceAgent.ts
import { useCallback, useState } from 'react';

import { useConversation } from '@elevenlabs/react';

interface UseVoiceAgentOptions {
  agentId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useVoiceAgent = ({ agentId, onConnect, onDisconnect }: UseVoiceAgentOptions) => {
  const [isConnected, setIsConnected] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      onConnect?.();
    },
    onDisconnect: () => {
      setIsConnected(false);
      onDisconnect?.();
    },
  });

  const start = useCallback(async () => {
    await conversation.startSession({ agentId });
  }, [agentId, conversation]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    isConnected,
    start,
    stop,
    status: conversation.status,
  };
};
```

---

## 15. ElevenLabs Integration Patterns

### Using @elevenlabs/react

```typescript
import { useConversation } from '@elevenlabs/react'

export const VoiceChat = ({ agentId }: { agentId: string }) => {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  })

  const handleStart = async () => {
    // Get signed URL from backend
    const { signedUrl } = await VoiceService.getSignedUrl(agentId)
    await conversation.startSession({ signedUrl })
  }

  return (
    <div>
      <p>Status: {conversation.status}</p>
      <Button onClick={handleStart}>Start Conversation</Button>
      <Button onClick={() => conversation.endSession()}>End</Button>
    </div>
  )
}
```

---

## 16. Code Smells to Avoid

| Smell                           | Solution                          |
| ------------------------------- | --------------------------------- |
| `any` types                     | Define proper interfaces          |
| Inline imports                  | Move to top of file               |
| Multiple components in one file | One component per file            |
| `Record<string, any>`           | Use explicit interfaces           |
| useEffect for data fetching     | Use TanStack Query                |
| Prop drilling                   | Use Zustand stores or context     |
| Hardcoded strings               | Use constants/enums               |
| Giant components                | Split into focused sub-components |

---

## Summary

1. **TypeScript everywhere** - No `any`, use interfaces
2. **Zustand for local state** - Keep stores focused and typed
3. **TanStack Query for server state** - Queries, mutations, caching
4. **Service layer for API** - Typed methods in dedicated files
5. **One component per file** - Clean, focused components
6. **Tailwind only** - No separate CSS files
7. **React Hook Form + Zod** - Type-safe form handling
8. **Path aliases** - Use `@/` for clean imports
9. **Separate types by domain** - Organized in `types/` directory
10. **CamelCase from backend** - BE handles conversion automatically
