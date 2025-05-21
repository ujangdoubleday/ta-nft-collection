# Components

This directory contains all React components used in the application, organized by their specific purpose.

## Directory Structure

- **common/** - Shared UI components that are used across multiple parts of the application but aren't purely UI elements
  - ThemeProvider.tsx - Context provider for theme management
  - ThemeToggle.tsx - Button for switching between light and dark mode
- **features/** - Feature-specific components organized by domain

  - **auth/** - Authentication-related components
  - **collections/** - NFT collection management components
  - **wallet/** - Wallet integration components

- **layout/** - Components for application layout

  - Navbar.tsx - Top navigation bar
  - Win98Taskbar.tsx - Windows 98 style taskbar for the bottom of the screen

- **ui/** - Reusable UI components that form the design system
  - button.tsx - Button component
  - dialog.tsx - Modal dialog component
  - **win98/** - Windows 98 specific UI components
    - Win98Spinner.tsx - Loading spinner in Windows 98 style

## Guidelines

1. **Component Organization**: Place components in the appropriate directory based on their purpose
2. **Naming Conventions**: Use PascalCase for component files and component names
3. **Component Structure**: Each component should have a clear, single responsibility
4. **CSS**: Use Tailwind CSS utility classes for styling when possible
