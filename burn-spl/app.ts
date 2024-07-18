import { burnTokens, removeAssociatedTokenAccounts } from './lib/solana';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import { SOLANA_RPC_URL, MINT_ADDRESS } from './config';

// Read wallet secret key from secretKey.json
const secretKeyString = fs.readFileSync('./wallets/secretKey.json', 'utf-8');
const secretKey = JSON.parse(secretKeyString).secretKey;
const WALLET = Keypair.fromSecretKey(new Uint8Array(secretKey));

async function main() {
    try {
        console.log(`Executing app.ts script for Solana token operations...`);

        // Example: Burn tokens
        const burnTxId = await burnTokens(WALLET, MINT_ADDRESS, 10); // Burn 10 tokens
        console.log(`Burn transaction sent. Transaction ID: ${burnTxId}`);

        // Example: Remove associated token accounts
        await removeAssociatedTokenAccounts(WALLET, MINT_ADDRESS);

        console.log(`All operations completed successfully.`);
    } catch (error) {
        console.error(`Error in main function:`, error);
    }
}

// Run the main function
main();
