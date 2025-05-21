# Styles

This directory contains global styles and theme-specific CSS for the application.

## Directory Structure

- **globals.css** - Global styles and Tailwind CSS imports
- **themes/** - Theme-specific styles
  - **win98.css** - Windows 98 theme specific styles and animations

## Guidelines

1. **Tailwind Usage**: Prefer Tailwind utility classes in components over custom CSS
2. **Theme Organization**: Keep theme-specific styles in separate files
3. **CSS Variables**: Use CSS variables for theme values to ensure consistency
4. **Animations**: Reusable animations should be defined in theme files
5. **Specificity**: Avoid high specificity selectors and !important when possible
