# MyNFTs.exe - NFT Creator Platform

A retro-styled web application for creating and managing NFT collections using Next.js, ethers.js, and MetaMask integration.

## Project Structure

The project follows a modular approach for better organization and maintainability:

```
.
├── app/                      # Next.js app router
│   ├── layout.tsx            # Root layout with Windows 98 theme
│   ├── page.tsx              # Homepage
│   └── ...                   # Other app pages
│
├── components/               # UI components
│   ├── common/               # Common components
│   │   ├── ThemeProvider.tsx # Theme provider for light/dark mode
│   │   └── ThemeToggle.tsx   # Theme toggle button
│   │
│   ├── features/             # Feature-specific components
│   │   ├── auth/             # Authentication components
│   │   ├── collections/      # NFT collections components
│   │   └── wallet/           # Wallet integration components
│   │       └── hooks/        # Wallet-related hooks
│   │
│   ├── layout/               # Layout components
│   │   ├── Navbar.tsx        # Main navigation bar
│   │   └── Win98Taskbar.tsx  # Windows 98 style taskbar
│   │
│   └── ui/                   # Reusable UI components
│       ├── button.tsx        # Button component
│       ├── dialog.tsx        # Dialog component
│       ├── win98/            # Windows 98 specific UI components
│       └── ...               # Other UI components
│
├── lib/                      # Utilities and hooks
│   ├── hooks/                # Custom React hooks
│   │   └── wallet/           # Wallet hooks (re-exports)
│   │
│   └── utils/                # Utility functions
│       ├── breadcrumbs.ts    # Breadcrumb generation
│       └── index.ts          # Common utilities
│
├── styles/                   # Global styles
│   ├── globals.css           # Global CSS
│   └── themes/               # Theme-specific styles
│       └── win98.css         # Windows 98 theme
│
├── public/                   # Static assets
│   └── assets/
│       ├── fonts/            # Custom fonts
│       └── icons/            # Icons and images
│
└── ...                       # Root config files
```

## Features

- Windows 98 inspired UI design
- Dark/light mode support
- MetaMask wallet integration
- NFT collection management
- Authentication using wallet signatures
- Responsive design
- Next.js App Router architecture
- tRPC for type-safe API development
- Prisma ORM with PostgreSQL database
- PostgreSQL database support
- TypeScript for type safety
- Integration with Prisma Data Platform
- Web3/Ethereum integration via MetaMask

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Web3**: ethers.js, MetaMask integration
- **Styling**: CSS Modules, Tailwind CSS, shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL database

### Installation

```bash
# Install dependencies
bun install
```

### Database Configuration

1. Create a `.env` file in the root directory
2. Add your PostgreSQL database URL:
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"
   ```
3. If using Prisma Data Platform:

   ```
   # Data Proxy URL (from Prisma Data Platform)
   DATABASE_URL="prisma://your-data-proxy-url"

   # Your direct PostgreSQL connection
   DIRECT_URL="postgresql://username:password@hostname:port/database?schema=public"
   ```

### Initialize Database

```bash
# Generate Prisma client
bunx prisma generate

# Create database tables
bunx prisma db push

# Seed initial data
bun run seed
```

### Development

```bash
# Run development server
bun run dev
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `lib/` - Utility functions and shared code
  - `db.ts` - Database client
  - `trpc/` - tRPC implementation
    - `server.ts` - tRPC server setup
    - `client.ts` - tRPC client setup
    - `routers/` - API route handlers
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `styles/` - Global styles

## API Structure with tRPC

The API is built using tRPC for full type-safety between client and server:

- `lib/trpc/server.ts` - Server-side tRPC configuration
- `lib/trpc/client.ts` - Client-side tRPC setup
- `lib/trpc/routers/` - API route implementations:
  - `user.ts` - User-related operations
  - `nft.ts` - NFT operations
  - `collection.ts` - Collection operations
  - `root.ts` - Root router that combines all routers

## Database Schema

The database uses Prisma ORM with the following models:

- `User` - User profiles and wallets
- `NFT` - NFT metadata and ownership
- `Collection` - NFT collections

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Data Platform](https://www.prisma.io/data-platform)

## License

[MIT](LICENSE)
