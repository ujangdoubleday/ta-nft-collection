# Lib

This directory contains all non-React utility code, services, and shared logic.

## Directory Structure

- `api/` - API-related code

  - `trpc/` - tRPC router and procedure definitions
  - `services/` - Service implementations for external APIs
    - `pinata/` - Pinata IPFS service integration
    - `blockchain/` - Blockchain interaction services
    - `storage/` - File storage services

- `auth/` - Authentication-related code

  - `next-auth/` - NextAuth.js configuration
  - `siwe/` - Sign-in with Ethereum implementation

- `blockchain/` - Blockchain-specific utilities

  - `contracts/` - Contract ABIs and interaction helpers
  - `utils/` - Blockchain-related utility functions
  - `hooks/` - Custom React hooks for blockchain interactions

- `db/` - Database-related code

  - `prisma/` - Prisma client and helpers
  - `schema/` - Zod schemas for data validation

- `utils/` - Utility functions organized by domain

  - `formatting/` - Date, number, string formatting utilities
  - `validation/` - Input validation helpers
  - `helpers/` - General helper functions

- `hooks/` - Custom React hooks

- `types/` - TypeScript type definitions

## Best Practices

- Keep utilities focused on a single responsibility
- Write unit tests for critical utility functions
- Use proper TypeScript typing for all exports
- Document complex functions with JSDoc comments
