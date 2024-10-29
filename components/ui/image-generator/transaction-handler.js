import { Transaction, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';

const logTx = (stage, data) => {
  console.log(`🔄 [TX ${stage}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

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
    // Validate public keys
    if (!PublicKey.isOnCurve(treasuryWallet.toBuffer())) {
      throw new Error('Invalid treasury wallet address');
    }

    if (!PublicKey.isOnCurve(tokenMint.toBuffer())) {
      throw new Error('Invalid token mint address');
    }

    logTx('START', { 
      amount, 
      wallet: wallet.publicKey.toString(),
      treasury: treasuryWallet.toString(),
      mint: tokenMint.toString()
    });
    
    onStatus('processing');

    // Get token accounts
    const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
    const treasuryTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryWallet);
    
    logTx('ACCOUNTS', { 
      userTokenAccount: userTokenAccount.toString(),
      treasuryTokenAccount: treasuryTokenAccount.toString()
    });

    // Verify accounts exist
    try {
      const userAccount = await getAccount(connection, userTokenAccount);
      const treasuryAccount = await getAccount(connection, treasuryTokenAccount);
      
      if (Number(userAccount.amount) < amount) {
        throw new Error(`Insufficient token balance. Required: ${amount}, Available: ${userAccount.amount}`);
      }
    } catch (error) {
      if (error.message.includes('could not find account')) {
        throw new Error('Token account not found. Please ensure you have $AIDOBE tokens.');
      }
      throw error;
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('processed');
    
    const transaction = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000000
      }),
      createTransferInstruction(
        userTokenAccount,
        treasuryTokenAccount,
        wallet.publicKey,
        amount
      )
    );

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    logTx('SIGNING', { blockhash });
    const signed = await wallet.signTransaction(transaction);
    logTx('SIGNED', { signed: !!signed });

    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
      preflightCommitment: 'processed'
    });
    
    logTx('SENT', { signature });
    onStatus('confirming');

    // Wait for confirmation
    let confirmed = false;
    const startTime = Date.now();
    const TIMEOUT = 20000;
    const CHECK_FREQUENCY = 250;

    while (Date.now() - startTime < TIMEOUT && !confirmed) {
      try {
        const response = await connection.getSignatureStatus(signature);
        
        if (response?.value) {
          if (response.value.err) {
            throw new Error('Transaction failed: ' + JSON.stringify(response.value.err));
          }

          if (response.value.confirmationStatus) {
            const confirmTime = Date.now() - startTime;
            logTx('CONFIRMED', { 
              signature,
              confirmationStatus: response.value.confirmationStatus,
              confirmTime: `${confirmTime}ms`
            });
            
            onStatus('confirmed');
            confirmed = true;
            return signature;
          }
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_FREQUENCY));
      } catch (error) {
        console.error('Confirmation check failed:', error);
      }
    }

    if (!confirmed) {
      throw new Error('Transaction confirmation timeout');
    }

  } catch (error) {
    logTx('ERROR', { error: error.message });
    onError(error);
    throw error;
  }
};