# Solana Token Burning Application

This TypeScript application interacts with the Solana blockchain to burn tokens from a specified mint. It uses the `@solana/web3.js` and `@solana/spl-token` libraries to perform the burning operation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Documentation](#documentation)
- [License](#license)

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (version 14 or higher recommended)
- npm (Node Package Manager)
- TypeScript (installed globally if not using in project)

## Folder & File strucrure

```solana-token-management/
│
├── src/
│   ├── app.ts          // Main TypeScript application file
│   ├── config/         // Configuration files
│   │   └── index.ts    // Configuration module
│   ├── lib/            // Utility and helper modules
│   │   └── solana.ts   // Solana connection and utility functions
│   ├── wallets/        // Wallet-related files
│   │   └── secretKey.json  // JSON file containing wallet secret key
│   └── README.md       // Documentation file
│
├── dist/               // Compiled JavaScript files (generated after build)
│
├── node_modules/       // Installed npm packages
│
├── package.json        // npm package configuration file
├── tsconfig.json       // TypeScript compiler configuration file
└── README.md           // Project README file (overview, setup instructions, etc.)
```

## Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. **Solana RPC URL**: Replace `SOLANA_RPC_URL` in `app.ts` with the desired Solana RPC URL. Example:

   ```typescript
   const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
   ```

2. **Mint Address**: Replace `MINT_ADDRESS` in `app.ts` with the mint address of the token you want to burn. Example:

   ```typescript
   const MINT_ADDRESS = '1234wEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
   ```

3. **Wallet Secret Key**: Replace `YOUR_SECRET_KEY_HERE` in `app.ts` with your actual wallet's secret key. Keep this key secure and do not share it publicly.

## Usage

To run the application, execute the following command:

```bash
ts-node app.ts
```

This command will start the token burning process on the specified Solana network. Follow the console logs for updates on the burning operation.

## Documentation

### Script Explanation

- **Initialization**: Sets up necessary constants, imports, and creates a Solana connection.

- **Token Burning Process**:
  1. **Fetch Associated Token Account Address**: Retrieves the associated token account address for the owner's wallet.
  2. **Create Burn Instructions**: Constructs burn instructions using `createBurnCheckedInstruction` from `@solana/spl-token`.
  3. **Fetch Blockhash**: Fetches the latest blockhash from the Solana blockchain.
  4. **Assemble Transaction**: Constructs and signs a transaction containing the burn instruction.
  5. **Send Transaction**: Sends the signed transaction to the Solana network.
  6. **Confirm Transaction**: Waits for the transaction to be confirmed on the blockchain.

### Error Handling

The application includes basic error handling to catch and log errors that may occur during the token burning process.

### Logging

Logs are used extensively to provide feedback on each step of the process, indicating success (`✅`) or failure (`❌`).

### Security

Ensure that sensitive information such as wallet secret keys (`secretKeyString`) and RPC URLs (`SOLANA_RPC_URL`) are kept secure and not exposed in public repositories.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Adjust the content as per your specific application details and preferences. This documentation will help users understand how to set up, configure, and use your Solana token burning application effectively.