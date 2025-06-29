## Global Notification Settings Implementation Summary

### ✅ Changes Made:

1. **Updated Settings Store** (`stores/settingsStore.ts`):

   - Changed `NotificationSettings` interface to have a global `enabled` property
   - Removed individual `alarmNotifications` and `timerNotifications` toggles
   - Added `toggleNotifications()` method that automatically requests permissions when enabled
   - Default notification setting is ON for better UX

2. **Updated Settings UI** (`app/(tabs)/settings.tsx`):

   - Replaced individual notification toggles with single "App Notifications" toggle
   - Sub-toggles (bedtime, sleep insights, weather) only show when global setting is ON
   - Clean, hierarchical UI structure

3. **Updated Notification Manager** (`lib/notificationManager.ts`):

   - Simplified `areNotificationsEnabled()` to check global setting only
   - All notification types (alarms, timers) now respect the single global setting
   - Centralized permission and setting logic

4. **Updated Hooks** (`hooks/useStores.ts`):

   - Added `toggleNotifications` method to notification settings hook
   - Exposed permission management methods

5. **Enhanced Permission Prompt** (`components/NotificationPermissionPrompt.tsx`):
   - Updated hook to show prompt when notifications are enabled for first time
   - Listens to settings changes to trigger prompt automatically
   - Works with the global notification paradigm

### 🎯 User Experience:

- **Simple Toggle**: Single "App Notifications" toggle for all notifications
- **Smart Permissions**: Automatically requests permission when toggled ON
- **Progressive Disclosure**: Sub-toggles only visible when notifications are enabled
- **Default Enabled**: Notifications default to ON for better onboarding
- **One-Time Prompt**: Permission prompt shown only when needed

### 🔧 Technical Benefits:

- **Centralized Logic**: All notification scheduling respects global setting
- **Consistent Behavior**: Alarms, timers, and other notifications unified
- **Clean Architecture**: Single source of truth for notification state
- **Future-Proof**: Easy to add new notification types

### ✅ Testing Needed:

1. Toggle notifications OFF → ON: Should request permissions
2. Schedule timer with notifications OFF: Should not create notification
3. Schedule alarm with notifications OFF: Should not create notification
4. Sub-toggles should only appear when main toggle is ON
5. Permission prompt should appear only when appropriate
