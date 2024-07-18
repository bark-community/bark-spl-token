import { 
    Connection, 
    Keypair, 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    sendAndConfirmTransaction, 
    LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import NodeCache from 'node-cache';

// Load environment variables from .env file
dotenv.config();

// Constants
const MINT_DECIMALS = 9;
const MAX_SUPPLY = 18_446_744_073_700_000_000n; // Max Supply (in smallest units)
const CACHE_TTL = 60 * 60; // 1 hour in seconds

// Load BARK Protocol's keypair from a file
const payerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync('wallet/SecretKeypair.json').toString())));

// Initialize cache
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: CACHE_TTL * 0.2 });

/**
 * Validates a public key string.
 * @param publicKeyString The public key string to validate.
 * @returns True if valid, otherwise throws an error.
 */
function validatePublicKey(publicKeyString: string): boolean {
    try {
        new PublicKey(publicKeyString);
        return true;
    } catch (error) {
        throw new Error(`Invalid public key: ${publicKeyString}`);
    }
}

/**
 * Creates the BARK token mint and associated token account, then mints the max supply to the account.
 * @param connection The Solana connection object
 * @param payerKeypair The keypair used to pay for the transaction
 * @returns The mint public key
 */
export async function createBarkToken(connection: Connection, payerKeypair: Keypair): Promise<PublicKey> {
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

        console.log(`BARK token created with mint address: ${mint.toBase58()}`);

        // Get the BARK token account of the payer's public key, and if it does not exist, create it
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerKeypair,
            mint,
            payerKeypair.publicKey
        );

        console.log(`BARK token account created: ${tokenAccount.address.toBase58()}`);

        // Mint the max supply of tokens to the token account
        await mintTo(
            connection,
            payerKeypair,
            mint,
            tokenAccount.address,
            payerKeypair.publicKey,
            MAX_SUPPLY,
            []
        );

        console.log(`Minted ${MAX_SUPPLY} BARK tokens to ${tokenAccount.address.toBase58()}`);

        // Cache the mint address
        cache.set('barkMint', mint.toBase58());

        return mint;
    } catch (error) {
        console.error('Error creating BARK token:', error);
        throw error;
    }
}

/**
 * Creates a new account on the Solana blockchain.
 * @param connection The Solana connection object
 * @param payerKeypair The keypair used to pay for the transaction
 * @returns The new account's public key
 */
export async function createNewAccount(connection: Connection, payerKeypair: Keypair): Promise<PublicKey> {
    try {
        const newAccount = Keypair.generate();
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payerKeypair.publicKey,
                newAccountPubkey: newAccount.publicKey,
                lamports: await connection.getMinimumBalanceForRentExemption(0),
                space: 0,
                programId: SystemProgram.programId,
            })
        );

        await sendAndConfirmTransaction(connection, transaction, [payerKeypair, newAccount]);

        console.log(`New account created with public key: ${newAccount.publicKey.toBase58()}`);
        return newAccount.publicKey;
    } catch (error) {
        console.error('Error creating new account:', error);
        throw error;
    }
}

/**
 * Transfers SOL to the specified account.
 * @param connection The Solana connection object
 * @param payerKeypair The keypair used to pay for the transaction
 * @param to The public key of the destination account
 * @param amount The amount of SOL to transfer
 */
export async function transferSol(connection: Connection, payerKeypair: Keypair, to: PublicKey, amount: number) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: payerKeypair.publicKey,
                toPubkey: to,
                lamports: amount,
            })
        );

        await sendAndConfirmTransaction(connection, transaction, [payerKeypair]);

        console.log(`Transferred ${amount} lamports to ${to.toBase58()}`);
    } catch (error) {
        console.error('Error transferring SOL:', error);
        throw error;
    }
}

/**
 * Retrieves the BARK token mint address from the cache or creates it if not found.
 * @param connection The Solana connection object
 * @param payerKeypair The keypair used to pay for the transaction
 * @returns The mint public key
 */
export async function getOrCreateBarkMint(connection: Connection, payerKeypair: Keypair): Promise<PublicKey> {
    const cachedMint = cache.get<string>('barkMint');
    if (cachedMint) {
        console.log(`BARK token mint address retrieved from cache: ${cachedMint}`);
        return new PublicKey(cachedMint);
    }
    return createBarkToken(connection, payerKeypair);
}
