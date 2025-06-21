# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 🧠 Memory & Context Management

### Project Memory System
- **Always reference** the `docs/progress/` folder for historical context and completed features
- **Check latest progress** in `docs/progress/WEEK*_COMPLETION_SUMMARY.md` files before making suggestions
- **Update memory files** after significant changes or feature completions
- **Maintain context** by reading recent git commit messages and changelog entries
- **Reference roadmap** in `docs/planning/ROADMAP.md` for feature status and priorities

### Daily Context Update Protocol
1. **Read latest progress summary** from `docs/progress/` folder
2. **Check recent commits** for changes since last session  
3. **Review current roadmap status** in `docs/planning/ROADMAP.md`
4. **Identify active feature branches** and in-progress work
5. **Update understanding** based on code changes and documentation

### Memory Persistence Strategy
- **Document all major decisions** in `docs/development/` folder
- **Track feature completions** in roadmap with ✅ markers
- **Log architectural changes** in `docs/development/PROJECT_STRUCTURE.md`
- **Record user feedback** and requested changes in commit messages
- **Maintain changelog** for version tracking and memory continuity

### Context Recovery Commands
When starting a new session, always:
```bash
# Check recent activity
git log --oneline -10
# Review latest documentation
cat docs/progress/WEEK*_COMPLETION_SUMMARY.md | tail -20
# Check roadmap status  
grep -n "✅\|❌\|🚧" docs/planning/ROADMAP.md
```

## Project Overview

This is a React Native mobile application built with Expo Router and TypeScript. The project follows modern mobile development patterns with a focus on native mobile app experience, smooth animations, and intuitive navigation.

### 🎯 Current Project Status (Auto-Update Daily)
**Last Updated**: 2025-06-21
**Active Development Phase**: Phase 1 - Core Features & UI/UX Enhancements
**Current Focus**: Timer/Stopwatch implementation and alarm management improvements

#### ✅ Recently Completed Features:
- Full-screen alarm creation/editing UI with iPhone-style time picker
- Enhanced AlarmCard with 3-dot options menu (removed swipe gestures)
- Timer screen with presets and manual time adjustment
- Stopwatch screen with lap tracking and best/worst indicators
- Updated navigation structure with Timer and Stopwatch tabs
- Removed quick add functionality per user feedback

#### 🚧 Current Tasks:
- Fix setInterval/clearInterval issues in Timer/Stopwatch components
- Test and debug new UI/UX implementations
- Optimize performance and fix linting issues

#### 📋 Next Priorities:
- Audio system implementation for timers
- Notification system for alarms
- Performance optimization and testing

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

## 💾 Workspace Memory Guidelines

### Code Context Awareness
- **Always check** `components/ui/` for existing reusable components before creating new ones
- **Reference** `hooks/` for custom hooks like `useTheme`, `useTimeFormat`, `useStores`
- **Follow** established patterns in `constants/Design.ts` for spacing, typography, and colors
- **Use** existing stores in `stores/` (alarmStore, settingsStore) for state management
- **Check** `types/index.ts` for existing TypeScript interfaces and types

### Feature State Tracking
- **AlarmCard Component**: ✅ Enhanced with 3-dot menu, removed swipe gestures
- **Alarm Creation**: ✅ Full-screen experience with iPhone-style picker
- **Timer Implementation**: 🚧 Created but needs setInterval fixes
- **Stopwatch Implementation**: 🚧 Created but needs optimization
- **Navigation Structure**: ✅ Updated with Timer/Stopwatch tabs
- **Quick Add Feature**: ✅ Removed per user request

### User Preferences & Decisions
- **UI/UX Style**: Modern iOS/Android-inspired design with cards and smooth animations
- **Interaction Pattern**: Touch-friendly (44px targets), no swipe gestures for primary actions
- **Navigation**: Tab-based with full-screen experiences for creation flows
- **Audio**: Placeholder implementation, needs expo-av integration
- **Testing**: Continuous testing preferred during development

### Development Environment Context
- **Platform**: macOS with VS Code
- **Shell**: zsh
- **Package Manager**: npm
- **Testing**: Expo development server for live testing
- **Version Control**: Git with detailed commit messages for memory tracking

## 🔄 Auto-Update Instructions for Copilot

### Before Each Session
1. **Read this file completely** to understand current project state
2. **Check git log** for recent changes and commit messages
3. **Review** any error files or test results from previous sessions
4. **Update** the "Current Project Status" section if significant changes occurred
5. **Note** any user preferences or feedback from previous interactions

### After Major Changes
1. **Update** feature status in this file (✅ completed, 🚧 in progress, ❌ removed)
2. **Document** architectural decisions in `docs/development/`
3. **Update** roadmap progress in `docs/planning/ROADmap.md`
4. **Create** progress summaries in `docs/progress/` for significant milestones
5. **Commit** documentation changes with descriptive messages

### Memory Preservation Format
```markdown
## Session Memory: [Date]
**Changes Made**: Brief description of changes
**User Feedback**: Any specific requests or preferences mentioned
**Technical Notes**: Important implementation details to remember
**Next Session**: Planned continuation points
```
