# Clock - React Native Mobile App

A modern React Native mobile application built with Expo Router, TypeScript, and cutting-edge mobile development patterns.

## 🚀 Features

- **Modern Architecture**: Built with Expo Router for file-based navigation
- **TypeScript**: Full type safety throughout the application
- **Smooth Animations**: 60fps animations using React Native Reanimated
- **Haptic Feedback**: Platform-specific haptic feedback for enhanced UX
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Touch-First**: Optimized for mobile touch interactions
- **Custom Components**: Reusable animated buttons, cards, and loading spinners
- **Persistent Storage**: AsyncStorage integration with custom hooks
- **Device Orientation**: Real-time orientation and screen size detection

## 📱 Technologies Used

- **React Native**: Core mobile framework
- **Expo Router**: File-based routing with tabs navigation
- **TypeScript**: Strict typing for all components and utilities
- **Expo Vector Icons**: Icon library for consistent UI
- **React Native Reanimated**: Smooth animations and transitions
- **React Native Gesture Handler**: Advanced gesture recognition
- **AsyncStorage**: Persistent data storage
- **Expo Haptics**: Platform-specific haptic feedback

## 🏗️ Project Structure

```
/app/                 # App routes (Expo Router convention)
  /(tabs)/            # Tab navigation screens
    index.tsx         # Home screen
    two.tsx           # Explore screen
  _layout.tsx         # Root layout
  modal.tsx           # Modal screen
/components/          # Reusable UI components
  AnimatedButton.tsx  # Animated button with haptic feedback
  Card.tsx            # Flexible card component
  LoadingSpinner.tsx  # Animated loading spinner
/hooks/               # Custom React hooks
  useKeyboard.ts      # Keyboard visibility detection
  useAsyncStorage.ts  # Persistent storage hook
  useDeviceOrientation.ts # Device orientation tracking
/lib/                 # Utility functions
  haptics.ts          # Haptic feedback utilities
  utils.ts            # General utility functions
/types/               # TypeScript type definitions
  index.ts            # Common types
/constants/           # App constants and configuration
/assets/              # Images, fonts, and other assets
```

## 🎯 Key Components

### AnimatedButton

- Smooth scale animations on press
- Haptic feedback integration
- Multiple variants (primary, secondary, outline)
- Loading states with spinner
- Configurable sizes (small, medium, large)

### Card

- Flexible container component
- Optional press interactions
- Smooth animations when pressable
- Title and subtitle support
- Shadow and elevation effects

### Custom Hooks

- **useDeviceOrientation**: Track screen dimensions and orientation
- **useKeyboard**: Monitor keyboard visibility and height
- **useAsyncStorage**: Persistent storage with loading states

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional, can run on device)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clock
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Run on your preferred platform:

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

## 📱 Development

### Running the App

- **Development**: `npm start` - Opens Expo DevTools
- **iOS**: `npm run ios` - Runs on iOS Simulator
- **Android**: `npm run android` - Runs on Android Emulator
- **Web**: `npm run web` - Runs in web browser

### Testing

```bash
npm test
```

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🎨 Design Principles

### Mobile-First Design

- Touch-friendly button sizes (minimum 44px)
- Optimized for thumb navigation
- Platform-specific UI patterns
- Responsive layouts for all screen sizes

### Performance

- Optimized animations running at 60fps
- Efficient state management
- Lazy loading where appropriate
- Minimal bundle size optimization

### Accessibility

- Proper accessibility labels
- Screen reader support
- High contrast support
- Keyboard navigation support

## 🔧 Configuration

### Environment Setup

The app uses Expo's managed workflow for simplified development and deployment.

### Platform-Specific Features

- iOS: Native haptic feedback patterns
- Android: Vibration fallbacks for haptics
- Web: Touch-friendly responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Expo Vector Icons](https://icons.expo.fyi/)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
