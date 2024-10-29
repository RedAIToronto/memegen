import { useState, useEffect } from 'react'
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
import { TransactionStatus, GeneratingPlaceholder } from "./image-generator/status-cards"
import Image from 'next/image'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

const GENERATION_COST = 5 // 5 FWOG tokens
const TOKEN_MINT = new PublicKey('A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump')
const TREASURY_WALLET = new PublicKey('Cabg7viFVH2Dd8cELWNQqcHRW8NfVngo1L7i2YkLGCDw')

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [showCreateModel, setShowCreateModel] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState('idle')
  const [transactionSignature, setTransactionSignature] = useState(null)
  const [transactionError, setTransactionError] = useState(null)
  const { toast } = useToast()
  const wallet = useWallet()
  const [tokenMint, setTokenMint] = useState(null);
  const [treasuryWallet, setTreasuryWallet] = useState(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setTokenMint(new PublicKey('A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump'));
        setTreasuryWallet(new PublicKey('Cabg7viFVH2Dd8cELWNQqcHRW8NfVngo1L7i2YkLGCDw'));
      }
    } catch (error) {
      console.error('Failed to initialize PublicKeys:', error);
    }
  }, []);

  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '', {
    commitment: 'processed',
    confirmTransactionInitialTimeout: 30000,
    wsEndpoint: process.env.NEXT_PUBLIC_RPC_WS || undefined,
    disableRetryOnRateLimit: false
  })

  const models = [
    { 
      id: 'fwog', 
      name: 'FWOG', 
      image: '/models/fwog.png',
      description: 'Generate FWOG-style memes'
    },
    { 
      id: 'meww', 
      name: 'MEW', 
      image: '/models/mew.png',
      description: 'Create MEW-inspired artwork'
    }
  ]

  const checkTokenBalance = async () => {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        wallet.publicKey
      );

      try {
        const account = await getAccount(connection, tokenAccount);
        const balance = Number(account.amount) / Math.pow(10, 6);
        
        if (balance < GENERATION_COST) {
          toast({
            variant: "destructive",
            title: "Insufficient Balance",
            description: `You need ${GENERATION_COST} $FWOG tokens. Current balance: ${balance.toLocaleString()}`,
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://raydium.io/swap', '_blank')}
              >
                Get $FWOG
              </Button>
            )
          });
          return false;
        }
        return true;
      } catch (e) {
        toast({
          variant: "destructive",
          title: "No $FWOG Tokens",
          description: "You need $FWOG tokens to generate images",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://raydium.io/swap', '_blank')}
            >
              Get $FWOG
            </Button>
          )
        });
        return false;
      }
    } catch (error) {
      console.error('Balance check error:', error);
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!tokenMint || !treasuryWallet) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Missing required configuration. Please try again later.",
      })
      return
    }

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

    const hasBalance = await checkTokenBalance();
    if (!hasBalance) return;

    setTransactionStatus('processing')
    setIsGenerating(true)

    try {
      const signature = await handleTransaction({
        connection,
        wallet,
        amount: GENERATION_COST * Math.pow(10, 6),
        tokenMint,
        treasuryWallet,
        onStatus: (status) => {
          setTransactionStatus(status);
          if (status === 'creating_account') {
            toast({
              title: "Creating Token Account",
              description: "Setting up your $FWOG token account...",
              duration: 5000,
            });
          }
        },
        onError: (error) => {
          if (error.message?.includes('insufficient funds')) {
            throw new Error(`You need ${GENERATION_COST} $FWOG tokens for this generation.`);
          }
          throw error;
        }
      });

      if (!signature) {
        throw new Error('Transaction failed');
      }

      setTransactionSignature(signature);
      setTransactionStatus('confirmed');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus('generating');
      
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
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Generation start failed:', errorData);
        throw new Error(errorData.error || 'Failed to start generation');
      }

      const data = await response.json();
      console.log('Generation started:', data);

      if (!data.generationId) {
        throw new Error('No generation ID returned');
      }

      try {
        const imageUrl = await pollGenerationStatus(data.generationId);
        setGeneratedImage(imageUrl);
        setTransactionStatus('idle');
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      } catch (error) {
        console.error('Generation failed:', error);
        throw error;
      }

    } catch (error) {
      console.error('Generation error:', error);
      setTransactionError(error.message);
      setTransactionStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const pollGenerationStatus = async (generationId) => {
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      try {
        // Try the prediction status endpoint first
        const predResponse = await fetch(`/api/generations/prediction-status/${generationId}`);
        if (!predResponse.ok) {
          // Fall back to regular status endpoint
          const response = await fetch(`/api/generations/status/${generationId}`);
          if (!response.ok) {
            throw new Error(`Status check failed with ${response.status}`);
          }
          const data = await response.json();
          if (data.generation.status === 'completed') {
            return data.generation.imageUrl;
          }
          if (data.generation.status === 'failed') {
            throw new Error(data.generation.error || 'Generation failed');
          }
        } else {
          const predData = await predResponse.json();
          if (predData.generation.status === 'completed') {
            return predData.generation.imageUrl;
          }
          if (predData.generation.status === 'failed') {
            throw new Error(predData.generation.error || 'Generation failed');
          }
        }
        
        const delay = Math.min(5000 * Math.pow(1.1, attempts), 15000);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        
      } catch (error) {
        console.error('Status check failed:', error);
        throw error;
      }
    }
    
    throw new Error('Generation timed out');
  };

  const AnnouncementBanner = () => (
    <div className="mb-8 p-4 rounded-lg bg-purple-50 border border-purple-100">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-semibold text-purple-900">Token Information</h3>
          <p className="text-sm text-purple-700">
            Generate memes using $FWOG tokens • Cost per generation: 5 $FWOG
            <a 
              href="https://raydium.io/swap/?inputMint=sol&outputMint=A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Get Tokens →
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Model Selection - Vertical Cards in Single Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {models.map((model) => (
          <Card 
            key={model.id}
            className={`flex-shrink-0 w-[280px] p-6 cursor-pointer transition-all hover:scale-[1.01] 
              bg-white shadow-modern hover:shadow-modern-lg
              ${selectedModel?.id === model.id ? 'ring-2 ring-primary-500 shadow-modern-lg' : ''}
              group relative overflow-hidden`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="space-y-4">
              <div className="w-full h-32 rounded-xl overflow-hidden bg-secondary-50">
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-secondary-700">
                  {model.name}
                </h3>
                <p className="text-sm text-secondary-500">{model.description}</p>
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Coins className="h-4 w-4" />
                  <span>5 $FWOG</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Create Model Card */}
        <Card 
          className="flex-shrink-0 w-[280px] p-6 cursor-pointer transition-all hover:scale-[1.01]
            bg-white shadow-modern hover:shadow-modern-lg border-2 border-dashed border-secondary-200
            group relative"
          onClick={() => setShowCreateModel(true)}
        >
          <div className="space-y-4">
            <div className="w-full h-32 rounded-xl bg-secondary-50 flex items-center justify-center
              group-hover:bg-secondary-100 transition-colors">
              <Plus className="h-8 w-8 text-secondary-400 group-hover:text-secondary-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-secondary-700">
                Create Model
              </h3>
              <p className="text-sm text-secondary-500">Train your own model</p>
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <Coins className="h-4 w-4" />
                <span>5 $FWOG</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Generation Input */}
      <Card className="p-6 backdrop-blur-sm bg-white/90 hover:shadow-xl hover:shadow-purple-500/10 transition-all border-gradient relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="prompt" className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              Your Prompt
            </Label>
            <div className="flex items-center text-sm font-medium text-pink-500">
              <Coins className="h-4 w-4 mr-1" />
              Cost: {GENERATION_COST} $FWOG
            </div>
          </div>
          
          <div className="flex gap-4">
            <Input
              id="prompt"
              placeholder={selectedModel ? `Create a ${selectedModel.name} style meme...` : "Select a model above..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating || !selectedModel}
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
              <Image 
                src={generatedImage}
                alt="Generated image"
                width={512}
                height={512}
                className="w-full rounded-lg"
                loading="eager"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png'
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
