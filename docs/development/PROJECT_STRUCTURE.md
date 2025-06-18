# Project Structure

```
aurora-alarm-clock/
├── README.md                          # Main project documentation
├── package.json                       # Dependencies and scripts
├── app.json                          # Expo configuration
├── tsconfig.json                     # TypeScript configuration
├── eslint.config.js                  # ESLint configuration
├── jest.config.js                    # Jest testing configuration
├── jest-setup.js                     # Jest setup and mocks
├── .prettierrc.json                  # Prettier configuration
├── .gitignore                        # Git ignore rules
│
├── app/                              # Expo Router screens
│   ├── _layout.tsx                   # Root layout configuration
│   └── (tabs)/                       # Tab navigation group
│       ├── _layout.tsx               # Tab layout configuration
│       ├── index.tsx                 # Clock screen (main)
│       ├── alarms.tsx                # Alarms management screen
│       └── settings.tsx              # Settings screen
│
├── components/                       # Reusable UI components
│   └── ui/                          # Core UI component library
│       ├── index.ts                  # Component exports
│       ├── TimePicker.tsx            # Time selection component
│       ├── AlarmCard.tsx             # Alarm display card
│       ├── Switch.tsx                # Toggle switch component
│       ├── Modal.tsx                 # Modal dialog component
│       ├── TextInput.tsx             # Styled text input
│       ├── Label.tsx                 # Text label component
│       └── __tests__/                # Component tests
│           └── TimePicker.test.tsx   # Example component test
│
├── constants/                        # App constants and configuration
│   └── Design.ts                     # Design system (colors, typography, spacing)
│
├── hooks/                           # Custom React hooks
│   └── useStores.ts                 # Store access hooks
│
├── stores/                          # Zustand state management
│   ├── alarmStore.ts                # Alarm state and actions
│   ├── settingsStore.ts             # App settings state
│   └── __tests__/                   # Store tests
│       └── alarmStore.test.ts       # Example store test
│
├── types/                           # TypeScript type definitions
│   └── index.ts                     # Common type definitions
│
├── lib/                             # Utility functions
│   └── utils.ts                     # General utility functions
│
├── assets/                          # Static assets
│   ├── images/                      # Image assets
│   └── fonts/                       # Custom fonts
│
├── docs/                            # Project documentation
│   ├── README.md                    # Documentation index
│   ├── planning/                    # Project planning documents
│   │   ├── ROADMAP.md               # Complete development roadmap
│   │   └── TASKS.md                 # Current and upcoming tasks
│   ├── progress/                    # Weekly completion summaries
│   │   ├── WEEK1_COMPLETION_SUMMARY.md
│   │   └── WEEK2_COMPLETION_SUMMARY.md
│   ├── development/                 # Development guides
│   │   └── SETUP.md                 # Environment setup guide
│   └── archive/                     # Archived documentation
│       ├── ALARM_CLOCK_PLAN.md      # Original planning document
│       ├── TECHNICAL_SPEC.md        # Technical specifications
│       ├── AUDIO_SYSTEM_SPEC.md     # Audio system design
│       ├── BUDGET_ANALYSIS.md       # Project budget analysis
│       └── FEASIBILITY_ANALYSIS.md  # Feasibility study
│
└── coverage/                        # Test coverage reports (generated)
```

## Key Directories

### `/app` - Expo Router Screens

Contains all application screens following Expo Router file-based routing conventions. The `(tabs)` directory creates a tab navigator with three main screens.

### `/components/ui` - UI Component Library

Core reusable components with consistent styling, TypeScript interfaces, and comprehensive testing. All components follow the design system.

### `/constants` - Design System

Centralized design tokens including colors, typography, spacing, and other design constants. Supports both light and dark themes.

### `/stores` - State Management

Zustand stores for global application state with AsyncStorage persistence. Includes alarms, settings, and other app-wide state.

### `/hooks` - Custom Hooks

React hooks for accessing stores, device capabilities, and other reusable logic patterns.

### `/docs` - Documentation

Well-organized documentation including planning, progress tracking, and development guides. Keeps the root directory clean.

## File Naming Conventions

- **Components**: PascalCase (e.g., `TimePicker.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useStores.ts`)
- **Stores**: camelCase ending with 'Store' (e.g., `alarmStore.ts`)
- **Screens**: camelCase (e.g., `index.tsx`, `settings.tsx`)
- **Constants**: PascalCase (e.g., `Design.ts`)
- **Types**: camelCase (e.g., `index.ts`)

## Import Structure

```typescript
// External libraries
import React from 'react';
import { View, Text } from 'react-native';

// Internal imports (relative paths)
import { Colors, Typography } from '@/constants/Design';
import { useAlarms } from '@/hooks/useStores';
import { TimePicker } from '@/components/ui';
```

This structure promotes:

- **Scalability**: Easy to add new features and components
- **Maintainability**: Clear separation of concerns
- **Testability**: Co-located tests with source code
- **Documentation**: Comprehensive docs organization
- **Reusability**: Modular component and hook design
