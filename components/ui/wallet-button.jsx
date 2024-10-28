// components/ui/wallet-button.jsx

import { Button } from "@/components/ui/button"
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet, ChevronDown } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { WalletBalance } from "./wallet-balance"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback } from 'react'
import { clusterApiUrl } from '@solana/web3.js'

// Configure the custom RPC endpoint
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('mainnet-beta');

export function WalletButton() {
  const { connected, publicKey, disconnect, connect, select } = useWallet()
  const { setVisible } = useWalletModal()
  const { toast } = useToast()

  const handleConnect = useCallback(async () => {
    try {
      if (!window.phantom) {
        toast({
          variant: "destructive",
          title: "Wallet Not Found",
          description: "Please install Phantom wallet extension first.",
        });
        // Open Phantom wallet download page
        window.open('https://phantom.app/', '_blank');
        return;
      }
      
      setVisible(true);
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to wallet",
      });
    }
  }, [setVisible, toast]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect wallet",
      });
    }
  }, [disconnect, toast]);

  if (!connected) {
    return (
      <Button onClick={handleConnect}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="p-2">
          <WalletBalance />
        </div>
        <DropdownMenuItem onClick={handleDisconnect} className="text-red-600 cursor-pointer">
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
