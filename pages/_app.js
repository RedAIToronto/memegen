import '@/styles/globals.css'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ModelQueueProvider } from "@/contexts/ModelQueueContext";
import { ErrorBoundary } from '@/components/error-boundary';

// Import all wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }) {
    // Use mainnet-beta network
    const network = WalletAdapterNetwork.Mainnet;
    
    // Use custom RPC endpoint
    const endpoint = "https://ancient-polished-vineyard.solana-mainnet.quiknode.pro/a817e6fc23a679c7c8be054b999e17c42ab6597d/";
    
    // Configure the connection
    const connection = useMemo(
        () => new Connection(endpoint, { commitment: 'confirmed' }),
        [endpoint]
    );

    // Initialize the Phantom wallet adapter
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider 
                wallets={wallets} 
                autoConnect={true}
            >
                <WalletModalProvider>
                    <ModelQueueProvider>
                        <div className="min-h-screen">
                            <ErrorBoundary>
                                <Component {...pageProps} />
                            </ErrorBoundary>
                            <Toaster />
                        </div>
                    </ModelQueueProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default MyApp;
