# Changelog

## [Unreleased] - 2025-06-29

### Added
- **Global Notification System**: Unified notification control for all app notifications
  - Single "App Notifications" toggle controls alarms, timers, and all other notifications
  - Smart permission request flow with modern UI prompt
  - Progressive disclosure of notification sub-settings
  - Default enabled for better user onboarding experience
  - Automatic permission requests when notifications are enabled

### Changed
- **Settings UI**: Replaced individual notification toggles with hierarchical global control
  - Main "App Notifications" toggle at top level
  - Sub-toggles (bedtime reminders, sleep insights, weather alerts) only visible when enabled
  - Clean, modern interface following iOS/Android design patterns
- **Notification Architecture**: Centralized notification logic for consistency
  - All notification types now respect single global setting
  - Unified permission checking across alarm and timer systems
  - Simplified notification manager with single enablement check

### Improved
- **User Experience**: Dramatically simplified notification management
  - Reduced cognitive load with single primary control
  - Eliminated confusion from multiple notification toggles
  - Better onboarding with smart defaults and automatic permission flow
- **Code Quality**: Cleaner, more maintainable notification architecture
  - Single source of truth for notification state
  - Reduced duplication across notification types
  - Future-proof design for easy addition of new notification types

### Technical
- Updated `stores/settingsStore.ts` with global notification state management
- Enhanced `hooks/useStores.ts` with notification toggle functionality  
- Refactored `lib/notificationManager.ts` for unified permission checking
- Improved `components/NotificationPermissionPrompt.tsx` with smart triggering
- Modified `app/(tabs)/settings.tsx` for progressive disclosure UI

### Documentation
- Added comprehensive implementation documentation
- Updated roadmap to reflect Phase 1 completion
- Created detailed completion summary for global notification system

## Previous Releases
[Previous changelog entries would go here...]
