# Components

This directory contains all React components used throughout the application.

## Directory Structure

- `ui/` - Reusable UI components (buttons, inputs, cards, etc.)

  - `primitives/` - Basic UI building blocks
  - `compound/` - Components composed of multiple primitives
  - `feedback/` - Loading states, toasts, alerts, etc.
  - `data-display/` - Tables, lists, charts, etc.
  - `layout/` - Layout-related components

- `common/` - Shared components used across multiple features

  - `navigation/` - Navigation components like navbar, sidebar, etc.
  - `forms/` - Form-related components and wrappers
  - `modals/` - Common modal components
  - `cards/` - Card variations and card-based components

- `features/` - Feature-specific components organized by domain

  - Each subdirectory represents a specific feature area (collections, wallet, etc.)

- `providers/` - Context providers and wrappers for the application

## Best Practices

- Keep components focused on a single responsibility
- For components with complex logic, separate logic into custom hooks in `lib/hooks`
- Export components through index files for cleaner imports
- Use TypeScript interfaces to define component props
