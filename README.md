# NFT-Next - NFT Creator Platform

**IMPORTANT: This project is currently under heavy development**

This project has several known issues, including:

- Unstructured folder organization
- Multiple bugs in core functionality
- Incomplete features
- Active refactoring in progress

## Installation

### Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL database

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nft-next.git
   cd nft-next
   ```

2. **Install dependencies**

   ```bash
   bun install
   # OR
   npm install
   ```

3. **Configure environment variables**
   - Copy a `.env.example` to `.env` file in the root directory and fill the requirement.

4. **Run the development server**

   ```bash
   bun run dev
   # OR
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## Blockchain Development

For blockchain development and contract deployment:

```bash
# Deploy contracts to Sepolia testnet
npm run deploy:sepolia

# Deploy contracts to local network
npm run deploy:local

# Verify contracts on Sepolia
npm run verify:factory
npm run verify:collection
```

## License

[MIT](LICENSE)
