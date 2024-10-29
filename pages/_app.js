import '@/styles/globals.css'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { ConnectionProvider } from '@solana/wallet-adapter-react'
import { ModelQueueProvider } from '@/contexts/ModelQueueContext'
import { ErrorBoundary } from '@/components/error-boundary'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { useMemo } from 'react'
import { Toaster } from "@/components/ui/toaster"

require('@solana/wallet-adapter-react-ui/styles.css')

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

export default function App({ Component, pageProps }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={RPC_URL}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ModelQueueProvider>
              <Component {...pageProps} />
              <Toaster />
            </ModelQueueProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  )
}
