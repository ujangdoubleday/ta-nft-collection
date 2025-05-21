# Lib

This directory contains utilities, hooks, and helper functions used throughout the application.

## Directory Structure

- **hooks/** - Custom React hooks
  - **wallet/** - Wallet-related hooks
    - useWallet.ts - Hook for connecting and interacting with Ethereum wallets
- **utils/** - Utility functions
  - **breadcrumbs.ts** - Functions for generating breadcrumb navigation
  - **index.ts** - Common utility functions like class merging and address formatting

## Guidelines

1. **Code Organization**: Place related functionality in appropriate subdirectories
2. **Exports**: Use named exports and re-export from index files for better imports
3. **Types**: Define and export TypeScript types/interfaces for all data structures
4. **Documentation**: Add JSDoc comments to functions and hooks explaining their purpose and usage
5. **Testing**: Write tests for utility functions to ensure reliability
