# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Xcode on macOS) or Android Emulator
- Git

## Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/DiwanMalla/aurora-alarm-clock.git
   cd aurora-alarm-clock
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## Development Commands

```bash
# Development
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Check TypeScript types

# Testing
npm test              # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Project Architecture

### State Management

- **Zustand** for global state (alarms, settings)
- **AsyncStorage** for data persistence
- Custom hooks for store access

### Navigation

- **Expo Router** for file-based routing
- Tab navigation for main screens
- Stack navigation for detailed views

### Styling

- **StyleSheet** for component styles
- Centralized design system in `constants/Design.ts`
- Theme support for light/dark modes

### Testing

- **Jest** for unit tests
- **React Native Testing Library** for component tests
- Custom test utilities in `jest-setup.js`

## Code Style Guidelines

### TypeScript

- Use strict type checking
- Define interfaces for all props and state
- Use explicit return types for complex functions

### Components

- Functional components with hooks
- PropTypes via TypeScript interfaces
- Consistent naming conventions

### Styling

- Use design system constants
- Avoid inline styles
- Platform-specific styles when needed

## Common Development Tasks

### Adding a New Component

1. Create component in `components/ui/`
2. Add TypeScript interface for props
3. Export from `components/ui/index.ts`
4. Write tests in `__tests__/` folder

### Adding a New Screen

1. Create screen in `app/` directory following Expo Router conventions
2. Add navigation types if needed
3. Integrate with existing navigation structure

### Updating State

1. Modify store interface in `stores/`
2. Update store actions and selectors
3. Update component hooks if needed
4. Test state changes

## Troubleshooting

### Common Issues

**Metro bundler errors**

```bash
npm start -- --clear-cache
```

**TypeScript errors**

```bash
npm run type-check
```

**Test failures**

```bash
npm test -- --verbose
```

### Development Tools

- **Expo DevTools** - Browser-based debugging
- **React Native Debugger** - Standalone debugging app
- **Flipper** - Advanced debugging and profiling

## Performance Tips

- Use `React.memo` for expensive components
- Implement proper list virtualization
- Optimize images and assets
- Profile animations for 60fps
- Use worklets for performance-critical animations

## Deployment

### Build for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

### Testing Builds

```bash
# Create development build
npx expo install expo-dev-client
npx expo run:ios --device
npx expo run:android --device
```
