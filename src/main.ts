import { Connection, clusterApiUrl } from '@solana/web3.js';
import { createBarkToken } from './mint';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Entry point function
async function main() {
    // Create a connection to the Solana cluster
    const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed');

    // Load payer keypair from a file
    const payerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync('wallet/SecretKeypair.json').toString())));

    try {
        // Create BARK token mint and associated operations
        const mint = await createBarkToken(connection, payerKeypair);
        console.log(`BARK token mint address: ${mint.toBase58()}`);
    } catch (error) {
        console.error('Failed to mint BARK tokens:', error);
    }
}

main().catch(err => {
    console.error('Unexpected error:', err);
});
