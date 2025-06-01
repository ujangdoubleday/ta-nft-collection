# Components Directory Structure

This directory follows a semantic and functional structure for better organization and maintainability.

## Directory Structure

```
components/
├── core/                   # Core application components
│   ├── layout/             # Layout components (main layouts, containers)
│   ├── navigation/         # Navigation components (navbar, sidebar, breadcrumbs)
│   └── providers/          # Context providers and wrappers
├── ui/                     # UI components following Atomic Design
│   ├── atoms/              # Basic building blocks (buttons, inputs, icons)
│   ├── molecules/          # Combinations of atoms (form fields, search bars)
│   ├── organisms/          # Complex UI sections (forms, cards with multiple elements)
│   └── templates/          # Page templates and layouts
├── features/               # Feature-specific components
│   ├── wallet/             # Wallet-related components
│   ├── collections/        # Collection-related components
│   ├── todo/               # Todo-related components
│   ├── home/               # Home page components
│   ├── contact/            # Contact page components
│   └── about/              # About page components
└── shared/                 # Shared components and utilities
    ├── forms/              # Reusable form components
    ├── modals/             # Modal components
    ├── cards/              # Card components
    ├── icons/              # Icon components
    └── hooks/              # Custom React hooks
```

## Guidelines

1. **Core Components**: Base components that form the foundation of the application
2. **UI Components**: Follow Atomic Design principles for better scalability
3. **Feature Components**: Components specific to a feature or page
4. **Shared Components**: Reusable components across different features

## Best Practices

1. Keep components focused on a single responsibility
2. Use index.ts files for exporting components from directories
3. Co-locate related files (styles, tests, utils) with their components
4. Use consistent naming conventions
5. Document complex components with comments or JSDoc
