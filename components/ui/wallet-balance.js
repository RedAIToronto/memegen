import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddress, TokenAccountNotFoundError } from '@solana/spl-token';

export function WalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const TOKEN_MINT = new PublicKey('A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump');
  const TOKEN_DECIMALS = 6; // Most SPL tokens use 6 or 9 decimals

  const formatTokenBalance = (amount) => {
    if (amount === null) return 'Error';
    const formatted = (amount / Math.pow(10, TOKEN_DECIMALS)).toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
    return formatted;
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) {
        setSolBalance(null);
        setTokenBalance(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch SOL balance
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);

        // Fetch SPL token balance
        const tokenAccount = await getAssociatedTokenAddress(
          TOKEN_MINT,
          publicKey
        );

        try {
          const account = await getAccount(connection, tokenAccount);
          setTokenBalance(Number(account.amount));
        } catch (e) {
          if (e instanceof TokenAccountNotFoundError) {
            setTokenBalance(0);
          } else {
            console.error('Error fetching token balance:', e);
            setTokenBalance(null);
          }
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
        setSolBalance(null);
        setTokenBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
    // Change from 30000 (30 sec) to 60000 (1 min)
    const intervalId = setInterval(fetchBalances, 60000); // Poll every minute

    return () => clearInterval(intervalId);
  }, [connection, publicKey]);

  if (!publicKey) return null;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading balances...</div>;
  }

  return (
    <div className="space-y-1">
      <div className="text-sm">
        <span className="text-muted-foreground">SOL Balance: </span>
        <span className="font-medium">
          {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Error'}
        </span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">$FWOG Balance: </span>
        <span className="font-medium">
          {formatTokenBalance(tokenBalance)}
        </span>
      </div>
    </div>
  );
}
