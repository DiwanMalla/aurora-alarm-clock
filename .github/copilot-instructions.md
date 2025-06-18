# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a React Native mobile application built with Expo Router and TypeScript. The project follows modern mobile development patterns with a focus on native mobile app experience, smooth animations, and intuitive navigation.

## Key Technologies

- **React Native**: Core mobile framework
- **Expo Router**: File-based routing with tabs navigation
- **TypeScript**: Strict typing for all components and utilities
- **Expo Vector Icons**: Icon library for consistent UI
- **React Native Reanimated**: Smooth animations and transitions
- **React Navigation**: Navigation library for tab and stack navigation

## Mobile Design Patterns to Follow

- **Touch-First Design**: Always prioritize touch interactions and gestures
- **Native Mobile UX**: Implement platform-specific patterns (iOS/Android)
- **Bottom Tab Navigation**: Primary navigation pattern
- **Card-based Layouts**: Content organization in cards
- **Touch-friendly Elements**: Minimum 44px touch targets
- **Smooth Animations**: Use Reanimated for 60fps animations
- **Modal Presentations**: Full-screen modals for detailed views
- **Pull-to-refresh**: Where applicable for data refreshing
- **Swipe Gestures**: Implement where appropriate

## File Structure Preferences

- App routes in `/app/` following Expo Router conventions
- Reusable components in `/components/` organized by feature
- Custom hooks in `/hooks/`
- Utilities and helpers in `/lib/`
- Type definitions in `/types/`
- Constants and configuration in `/constants/`
- Assets (images, fonts) in `/assets/`

## Coding Standards

- Use functional components with hooks
- Implement proper TypeScript typing
- Use Expo Router for navigation (no React Navigation directly)
- Follow React Native naming conventions
- Implement proper error boundaries
- Add loading states for async operations
- Use platform-specific code when necessary (Platform.OS)
- Include proper accessibility labels (accessibilityLabel, accessibilityRole)

## Component Guidelines

- Create atomic, reusable components
- Use StyleSheet.create for performance
- Implement responsive designs for different screen sizes
- Use safe area context for proper layout
- Handle keyboard avoidance properly
- Implement proper focus management

## Animation Guidelines

- Use React Native Reanimated for complex animations
- Prefer spring animations for natural feel
- Use worklets for performance-critical animations
- Implement gesture-driven animations where appropriate
- Keep animations under 300ms for quick interactions

## Platform Considerations

- Test on both iOS and Android
- Use Platform.select() for platform-specific styling
- Consider platform-specific navigation patterns
- Handle safe areas properly on different devices
- Implement proper status bar management

## Performance Best Practices

- Use React.memo for expensive components
- Implement proper list virtualization with FlatList
- Optimize images with proper resizing
- Use lazy loading where appropriate
- Minimize bundle size with proper imports
- Profile animations for 60fps performance
