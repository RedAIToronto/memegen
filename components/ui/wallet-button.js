// components/ui/wallet-button.jsx

import { Button } from "@/components/ui/button"
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet } from 'lucide-react'
import { WalletBalance } from "./wallet-balance"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletButton() {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  if (!publicKey) {
    return (
      <Button 
        onClick={() => setVisible(true)}
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-pink-500/20">
          <Wallet className="mr-2 h-4 w-4 text-pink-500" />
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <WalletBalance />
        <DropdownMenuItem onClick={disconnect} className="text-red-500">
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
