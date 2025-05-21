# Pixel Vault - NFT Creator Platform

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

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Web3**: ethers.js, MetaMask integration
- **Styling**: CSS Modules, Tailwind CSS, shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask extension

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/nft-next.git
   cd nft-next
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn
   ```

3. Run the development server:

   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Architecture

The application uses a modular architecture with clear separation of concerns:

- **Components**: UI components organized by functionality
- **Hooks**: Custom React hooks for data fetching and state management
- **Utils**: Utility functions for common operations
- **Styles**: Global styles and theme-specific CSS

## License

[MIT](LICENSE)
