// New file for transaction logic
import { Connection, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export const handleTransaction = async ({
  connection,
  wallet,
  amount,
  tokenMint,
  treasuryWallet,
  onStatus,
  onError
}) => {
  try {
    onStatus('processing');

    const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
    const treasuryTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryWallet);
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    
    let transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Add transfer instruction
    const transferInstruction = createTransferInstruction(
      userTokenAccount,
      treasuryTokenAccount,
      wallet.publicKey,
      amount
    );
    transaction.add(transferInstruction);

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 5,
      preflightCommitment: 'confirmed'
    });

    // Wait for confirmation
    const { value } = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    }, 'confirmed');

    if (value?.err) {
      throw new Error('Transaction failed');
    }

    return signature;
  } catch (error) {
    onError(error);
    throw error;
  }
};
