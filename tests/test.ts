import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import assert from 'assert';

// Load environment variables from .env file
dotenv.config();

// Load Test keypair from a file
const payerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync('wallet/testSecretKeypair.json').toString())));

const MINT_DECIMALS = 9;
const MAX_SUPPLY = 18_446_744_073_700_000_000n; // Max Supply (in smallest units)

async function createBarkToken(connection: Connection, payerKeypair: Keypair): Promise<PublicKey> {
    try {
        // Generate a new keypair for the mint
        const mint = await createMint(
            connection,
            payerKeypair,
            payerKeypair.publicKey,
            null,
            MINT_DECIMALS, // Decimals
            TOKEN_PROGRAM_ID
        );

        console.log(`Test token created with mint address: ${mint.toBase58()}`);
        return mint;
    } catch (error) {
        console.error('Error creating Test  token:', error);
        throw error;
    }
}

async function createTokenAccount(connection: Connection, payerKeypair: Keypair, mint: PublicKey): Promise<PublicKey> {
    try {
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerKeypair,
            mint,
            payerKeypair.publicKey
        );

        console.log(`Test Token Account: ${tokenAccount.address.toBase58()}`);
        return tokenAccount.address;
    } catch (error) {
        console.error('Error creating test token account:', error);
        throw error;
    }
}

async function mintTokens(connection: Connection, payerKeypair: Keypair, mint: PublicKey, destination: PublicKey) {
    try {
        await mintTo(
            connection,
            payerKeypair,
            mint,
            destination,
            payerKeypair.publicKey,
            MAX_SUPPLY,
            []
        );

        console.log(`Minted ${MAX_SUPPLY} Test tokens to ${destination.toBase58()}`);
    } catch (error) {
        console.error('Error minting Test tokens:', error);
        throw error;
    }
}

async function main() {
    const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'), 'confirmed');

    try {
        const mint = await createBarkToken(connection, payerKeypair);
        assert(mint, 'Mint was not created');
        
        const tokenAccount = await createTokenAccount(connection, payerKeypair, mint);
        assert(tokenAccount, 'Token account was not created');

        await mintTokens(connection, payerKeypair, mint, tokenAccount);
        console.log('All tests passed successfully!');
    } catch (error) {
        console.error('Failed to execute Test token operations:', error);
    }
}

main();
