import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAccount, createTransferInstruction } from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';

export async function handleTransaction({ connection, wallet, amount, tokenMint, treasuryWallet, onStatus, onError }) {
  try {
    onStatus('processing');
    console.log('🔄 [TX START]', {
      timestamp: new Date().toISOString(),
      amount,
      wallet: wallet.publicKey.toString(),
      treasury: treasuryWallet.toString(),
      mint: tokenMint.toString()
    });

    // Get token accounts
    const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
    const treasuryTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryWallet);

    console.log('🔄 [TX ACCOUNTS]', {
      timestamp: new Date().toISOString(),
      userTokenAccount: userTokenAccount.toString(),
      treasuryTokenAccount: treasuryTokenAccount.toString()
    });

    // Create transaction
    const transaction = new Transaction();

    // Add a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Check if user's token account exists
    try {
      await getAccount(connection, userTokenAccount);
    } catch (e) {
      onStatus('creating_account');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userTokenAccount,
          wallet.publicKey,
          tokenMint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        userTokenAccount,
        treasuryTokenAccount,
        wallet.publicKey,
        amount
      )
    );

    // Send transaction
    onStatus('processing');
    const signature = await wallet.sendTransaction(transaction, connection);
    
    onStatus('confirming');
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed to confirm');
    }

    onStatus('confirmed');
    return signature;

  } catch (error) {
    console.log('🔄 [TX ERROR]', {
      timestamp: new Date().toISOString(),
      error: error.message
    });

    if (error.message?.includes('User rejected')) {
      onStatus('rejected');
    } else {
      onStatus('error');
    }

    onError(error);
    return null;
  }
}