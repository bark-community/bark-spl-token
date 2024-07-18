// lib/solana.ts

import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createBurnCheckedInstruction } from '@solana/spl-token';
import { SOLANA_RPC_URL, MINT_ADDRESS } from '../config';

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Function to burn tokens of a specified mint
export async function burnTokens(owner: Keypair, mintAddress: string, amount: number): Promise<string> {
    try {
        const mintPublicKey = new PublicKey(mintAddress);

        // Step 1: Fetch Associated Token Account Address
        const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, owner.publicKey);

        // Step 2: Create Burn Instruction
        const burnInstruction = createBurnCheckedInstruction(
            associatedTokenAddress,
            mintPublicKey,
            owner.publicKey,
            amount,
            6 // Assuming 6 decimals for the token, adjust as per your token's decimals
        );

        // Step 3: Fetch Blockhash
        const { blockhash } = await connection.getRecentBlockhash();

        // Step 4: Assemble Transaction
        const transaction = new Transaction().add(burnInstruction);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = owner.publicKey;
        transaction.sign(owner);

        // Step 5: Send Transaction
        const txid = await connection.sendTransaction(transaction, [owner]);
        console.log(`Burn transaction sent: ${txid}`);

        // Step 6: Confirm Transaction
        await connection.confirmTransaction(txid);
        console.log(`Burn transaction confirmed: ${txid}`);

        return txid;
    } catch (error) {
        console.error('Error burning tokens:', error);
        throw error;
    }
}

// Function to remove associated token accounts for a specified mint
export async function removeAssociatedTokenAccounts(owner: Keypair, mintAddress: string): Promise<void> {
    try {
        console.log(`Attempting to remove associated token accounts for Mint: ${mintAddress} using Owner Wallet: ${owner.publicKey.toString()}`);

        // Step 1 - Fetch all Associated Token Accounts
        console.log(`Step 1 - Fetching Associated Token Accounts`);
        const associatedAccounts = await connection.getTokenAccountsByOwner(owner.publicKey, { mint: new PublicKey(mintAddress) });
        console.log(`    ✅ Found ${associatedAccounts.value.length} associated token accounts`);

        // Step 2 - Create Remove Instructions for each associated account
        if (associatedAccounts.value.length > 0) {
            console.log(`Step 2 - Creating Remove Instructions`);
            const instructions = associatedAccounts.value.map(account => {
                return createAssociatedTokenAccountInstruction({
                    programId: TOKEN_PROGRAM_ID,
                    associatedTokenAddress: account.pubkey,
                    payer: owner.publicKey,
                    owner: owner.publicKey,
                    mint: new PublicKey(mintAddress)
                });
            });

            // Step 3 - Fetch Blockhash
            console.log(`Step 3 - Fetch Blockhash`);
            const { blockhash } = await connection.getRecentBlockhash();
            console.log(`    ✅ Latest Blockhash: ${blockhash}`);

            // Step 4 - Assemble Transaction
            console.log(`Step 4 - Assemble Transaction`);
            const transaction = new Transaction();
            instructions.forEach(instruction => transaction.add(instruction));
            transaction.recentBlockhash = blockhash;
            transaction.sign(owner);

            console.log(`    ✅ Transaction Created and Signed`);

            // Step 5 - Send Transaction
            console.log(`Step 5 - Execute Transaction`);
            const txid = await connection.sendTransaction(transaction, [owner], {
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
            console.log(`No associated token accounts found for Mint: ${mintAddress}`);
        }
    } catch (error) {
        console.error(`❌ Error removing associated token accounts: ${error.message}`);
        throw error;
    }
}

async function waitForConfirmation(txid: string): Promise<void> {
    try {
        let status;
        while (!status || status === 'processing') {
            status = (await connection.getSignatureStatus(txid)).value?.confirmationStatus;
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
