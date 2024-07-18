import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import fs from 'fs';

// Constants for token operations
const MINT_ADDRESS = '1234wEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'; // Replace with the mint you want to manage
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'; // Replace with your desired Solana RPC URL

// Read wallet secret key from secretKey.json
const secretKeyString = fs.readFileSync('wallet/secretKey.json', 'utf-8');
const secretKey = JSON.parse(secretKeyString).secretKey;
const WALLET = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Solana network connection
const SOLANA_CONNECTION = new Connection(SOLANA_RPC_URL, 'confirmed');

async function removeAssociatedTokenAccounts() {
    try {
        console.log(`Attempting to remove associated token accounts for Mint: ${MINT_ADDRESS} using Owner Wallet: ${WALLET.publicKey.toString()}`);

        // Step 1 - Fetch all Associated Token Accounts
        console.log(`Step 1 - Fetching Associated Token Accounts`);
        const associatedAccounts = await SOLANA_CONNECTION.getTokenAccountsByOwner(WALLET.publicKey, { mint: new PublicKey(MINT_ADDRESS) });
        console.log(`    ✅ Found ${associatedAccounts.value.length} associated token accounts`);

        // Step 2 - Create Remove Instructions for each associated account
        if (associatedAccounts.value.length > 0) {
            console.log(`Step 2 - Creating Remove Instructions`);
            const instructions = associatedAccounts.value.map(account => {
                return createAssociatedTokenAccountInstruction({
                    programId: TOKEN_PROGRAM_ID,
                    associatedTokenAddress: account.pubkey,
                    payer: WALLET.publicKey,
                    owner: WALLET.publicKey,
                    mint: new PublicKey(MINT_ADDRESS)
                });
            });

            // Step 3 - Fetch Blockhash
            console.log(`Step 3 - Fetch Blockhash`);
            const { blockhash } = await SOLANA_CONNECTION.getLatestBlockhash('finalized');
            console.log(`    ✅ Latest Blockhash: ${blockhash}`);

            // Step 4 - Assemble Transaction
            console.log(`Step 4 - Assemble Transaction`);
            const transaction = new Transaction();
            instructions.forEach(instruction => transaction.add(instruction));
            transaction.recentBlockhash = blockhash;
            transaction.sign(WALLET);

            console.log(`    ✅ Transaction Created and Signed`);

            // Step 5 - Send Transaction
            console.log(`Step 5 - Execute Transaction`);
            const txid = await SOLANA_CONNECTION.sendTransaction(transaction, [WALLET], {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
            });
            console.log(`    ✅ Transaction sent to network. Transaction ID: ${txid}`);

            // Step 6 - Confirm Transaction
            console.log(`Waiting for confirmation...`);
            await waitForConfirmation(txid);
            console.log(`🗑️ SUCCESSFULLY REMOVED ACCOUNTS! 🗑️`);
            console.log(`Transaction details: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
        } else {
            console.log(`No associated token accounts found for Mint: ${MINT_ADDRESS}`);
        }

    } catch (error) {
        console.error(`❌ Error removing associated token accounts: ${error.message}`);
    }
}

async function waitForConfirmation(txid: string): Promise<void> {
    try {
        let status;
        while (!status || status === 'processing') {
            status = (await SOLANA_CONNECTION.getSignatureStatus(txid)).value?.confirmationStatus;
            await sleep(2000); // Wait for 2 seconds before checking again
        }
        if (status !== 'confirmed') {
            throw new Error(`Transaction ${txid} failed to confirm.`);
        }
    } catch (error) {
        console.error(`❌ Confirmation error: ${error.message}`);
        throw error; // Re-throw the error for outer catch block
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute the removeAssociatedTokenAccounts function
removeAssociatedTokenAccounts();
