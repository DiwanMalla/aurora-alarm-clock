# 🌅 Aurora Clock

A beautiful, modern alarm clock app built with React Native and Expo.

## � Features

- **Digital & Analog Clocks** - Toggle between beautiful clock displays
- **Smart Alarms** - Intelligent alarm management with snooze and custom sounds
- **Weather Integration** - Weather-aware alarm adjustments
- **Health Tracking** - Sleep insights and bedtime reminders
- **Smart Home** - Integration with Philips Hue and Google Home
- **Dark Mode** - Beautiful themes for day and night

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🔄 CI/CD Pipeline

This project includes a complete CI/CD pipeline using GitHub Actions:

- **Continuous Integration**: Automated testing, linting, and type checking on every PR
- **Build & Release**: Automated Android/iOS builds on git tags
- **Preview Builds**: Expo preview builds for PR testing
- **Dependency Updates**: Automated dependency management with Dependabot

[![CI Status](https://github.com/yourusername/clock/workflows/Continuous%20Integration/badge.svg)](https://github.com/yourusername/clock/actions)
[![Build Status](https://github.com/yourusername/clock/workflows/Build%20%26%20Release/badge.svg)](https://github.com/yourusername/clock/actions)

For detailed CI/CD setup instructions, see [CI/CD Documentation](docs/development/CI_CD.md).

## 🏗️ Tech Stack

- **React Native** with Expo Router
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native Reanimated** for smooth animations
- **AsyncStorage** for data persistence
- **Jest & Testing Library** for testing

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   └── (tabs)/            # Tab navigation screens
├── components/            # Reusable UI components
│   └── ui/               # Core UI components
├── constants/            # Design system and constants
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── docs/                # Project documentation
│   ├── planning/        # Roadmaps and task lists
│   ├── progress/        # Completion summaries
│   └── development/     # Development guides
└── __tests__/           # Test files
```

## 📚 Documentation

- **[Roadmap](docs/planning/ROADMAP.md)** - Complete development roadmap
- **[Tasks](docs/planning/TASKS.md)** - Current and upcoming tasks
- **[Progress](docs/progress/)** - Weekly completion summaries
- **[Development Guide](docs/development/)** - Setup and development guidelines

## 🎨 Design System

Aurora Clock follows a comprehensive design system with:

- Consistent color palette for light and dark themes
- Typography scale following iOS Human Interface Guidelines
- Standardized spacing and component sizing
- Smooth animations and transitions

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

## 📱 Development Status

- ✅ **Week 1**: Foundation, design system, core components
- ✅ **Week 2**: Navigation, clock display, settings screen
- 🚧 **Week 3**: Advanced alarm features and gestures
- 📅 **Week 4**: Smart features and integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Expo Vector Icons](https://icons.expo.fyi/)
- Animations by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Aurora Clock** - Wake up to a beautiful sunrise every day 🌅
/assets/ # Images, fonts, and other assets

````

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
````

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
