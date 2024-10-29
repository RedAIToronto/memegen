import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ImageIcon, Plus, Coins, ExternalLink, Sparkles } from "lucide-react"
import { CreateModelDialog } from "./create-model-dialog"
import { useWallet } from '@solana/wallet-adapter-react'
import { handleTransaction } from './image-generator/transaction-handler'
import { PublicKey, Connection } from '@solana/web3.js'
import { TransactionStatus } from "./image-generator/status-cards"

const GENERATION_COST = 1000
const TOKEN_MINT = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT)
const TREASURY_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET)

// Add RPC connection configuration
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL
const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000
})

function GeneratingPlaceholder() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-6 text-center">
              <Sparkles className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-3">
                <div className="h-4 w-48 bg-primary/20 rounded animate-pulse mx-auto" />
                <div className="h-4 w-32 bg-primary/20 rounded animate-pulse mx-auto" />
                <div className="text-sm text-muted-foreground animate-pulse">
                  Generating your masterpiece...
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [showCreateModel, setShowCreateModel] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState('idle')
  const [transactionSignature, setTransactionSignature] = useState(null)
  const { toast } = useToast()
  const wallet = useWallet()

  const models = [
    { 
      id: 'fwog', 
      name: 'FWOG', 
      image: '/models/fwog.png',
      description: 'Generate FWOG-style memes'
    },
    { 
      id: 'mew', 
      name: 'MEW', 
      image: '/models/mew.png',
      description: 'Create MEW-inspired artwork'
    }
  ]

  const handleGenerate = async () => {
    if (!wallet.connected || !selectedModel || !prompt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: !wallet.connected ? "Please connect your wallet" :
                    !selectedModel ? "Please select a model" :
                    "Please enter a prompt"
      })
      return
    }

    setTransactionStatus('processing')
    setIsGenerating(true)

    try {
      const signature = await handleTransaction({
        connection,
        wallet,
        amount: GENERATION_COST * Math.pow(10, 6),
        tokenMint: TOKEN_MINT,
        treasuryWallet: TREASURY_WALLET,
        onStatus: (status) => {
          toast({
            title: "Transaction Status",
            description: status,
            duration: status.includes('Solscan') ? 10000 : 5000,
          })
        },
        onError: (error) => {
          throw new Error(error)
        }
      })

      if (!signature) {
        throw new Error('Transaction failed')
      }

      setTransactionSignature(signature)
      setTransactionStatus('confirming')

      toast({
        title: "Transaction Confirmed",
        description: (
          <div className="flex flex-col space-y-2">
            <span>Payment processed successfully!</span>
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center"
            >
              View on Solscan
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        ),
        duration: 8000,
      })

      // If transaction successful, proceed with generation
      setTransactionStatus('generating')
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel.id,
          walletAddress: wallet.publicKey.toString(),
          signature,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      if (data.generation?.imageUrl) {
        setGeneratedImage(data.generation.imageUrl)
      } else if (data.images?.[0]) {
        setGeneratedImage(data.images[0])
      } else if (typeof data.imageUrl === 'string') {
        setGeneratedImage(data.imageUrl)
      }

      setTransactionStatus('idle')
      
      toast({
        title: "Success",
        description: "Image generated successfully!",
      })
    } catch (error) {
      console.error('Generation error:', error)
      setTransactionStatus('idle')
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate image",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Model Selection with enhanced styling */}
      <div className="grid md:grid-cols-3 gap-8">
        {models.map((model) => (
          <Card 
            key={model.id}
            className={`p-6 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-pink-500/30 
              backdrop-blur-sm bg-white/90 
              ${selectedModel?.id === model.id ? 'ring-4 ring-pink-500 shadow-lg shadow-pink-500/30' : ''}
              group relative overflow-hidden`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-6 relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20 shadow-lg">
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                  {model.name}
                </h3>
                <p className="text-sm text-muted-foreground">{model.description}</p>
                <div className="flex items-center gap-2 text-sm text-pink-500">
                  <Coins className="h-4 w-4" />
                  <span>1,000 $AIDOBE</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Create New Model Card - Smaller version */}
        <Card 
          className="p-6 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-pink-500/30 
            backdrop-blur-sm bg-white/90 border-dashed border-2 border-pink-500/30 group relative"
          onClick={() => setShowCreateModel(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-8 w-8 text-pink-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Create Model
              </h3>
              <p className="text-sm text-muted-foreground">Train your own model</p>
              <div className="flex items-center gap-2 text-sm text-pink-500">
                <Coins className="h-4 w-4" />
                <span>4.2M $AIDOBE</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Generation Section with enhanced styling */}
      <Card className="p-6 backdrop-blur-sm bg-white/90 hover:shadow-xl hover:shadow-purple-500/10 transition-all border-gradient relative overflow-hidden">
        {/* Add sparkle effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="prompt" className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              Your Prompt
            </Label>
            <div className="flex items-center text-sm font-medium text-pink-500">
              <Coins className="h-4 w-4 mr-1" />
              Cost: {GENERATION_COST} $AIDOBE
            </div>
          </div>
          
          <div className="flex gap-4">
            <Input
              id="prompt"
              placeholder="Describe your meme..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 border-pink-500/20 focus:border-purple-500 focus:ring-purple-500/20 transition-all
                bg-white/50 backdrop-blur-sm text-lg"
            />

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt || !selectedModel || !wallet.connected}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 
                transition-all duration-300 transform hover:scale-[1.02] relative group overflow-hidden px-8 text-lg font-bold"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {/* Transaction Status */}
          {transactionStatus !== 'idle' && (
            <TransactionStatus 
              status={transactionStatus}
              signature={transactionSignature}
            />
          )}

          {/* Show placeholder while generating */}
          {transactionStatus === 'generating' && <GeneratingPlaceholder />}

          {/* Generated Image Display */}
          {generatedImage && transactionStatus === 'idle' && (
            <div className="mt-6 rounded-lg overflow-hidden shadow-xl transition-all hover:scale-[1.01] hover:shadow-purple-500/20">
              <img 
                src={generatedImage}
                alt="Generated image"
                className="w-full rounded-lg"
                onError={(e) => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load generated image",
                  });
                }}
              />
            </div>
          )}
        </div>
      </Card>

      <CreateModelDialog 
        open={showCreateModel} 
        onOpenChange={setShowCreateModel}
      />
    </div>
  )
}

export default ImageGenerator
