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
        className="bg-black hover:bg-gray-900 text-white transition-all"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
          <Wallet className="mr-2 h-4 w-4 text-gray-700" />
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
