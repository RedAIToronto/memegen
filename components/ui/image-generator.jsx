import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from '@solana/wallet-adapter-react'
import { ImageIcon, Loader2, Sparkles, ExternalLink, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token'
import { PublicKey, Transaction, SystemProgram, ComputeBudgetProgram } from '@solana/web3.js'
import { CreateModelDialog } from "./create-model-dialog"
import { useRouter } from 'next/router'

const COST_PER_IMAGE = 1000 // 1,000 tokens per image
const TOKEN_MINT = new PublicKey('FXPn4kM8M252tbRXV4mvdqSQvY6jrg3J5cuRCphXpump')
const TREASURY_WALLET = new PublicKey('3cUsyqkLHmdCBWBgfRsMDScsTHYNNCQ9rUHBL7uJWK9c') // Replace with your treasury wallet

// Update the connection configuration at the top
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const WS_URL = RPC_URL?.replace('https://', 'wss://');

const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000,
  wsEndpoint: WS_URL
});

// Add this component for the loading animation
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
  );
}

// Update the timeout utility function
const withTimeout = (promise, ms, operation = 'Operation') => {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timed out. Please try again.`));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Update the GeneratedImageCard component
const GeneratedImageCard = ({ imageUrl, prompt, timestamp }) => {
  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative group">
          {/* Full-size image display */}
          <div className="aspect-square w-full">
            <img
              src={imageUrl}
              alt={`Generated image for "${prompt}"`}
              className="w-full h-full object-contain bg-black/5"
              loading="lazy"
            />
          </div>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
            <div className="text-white">
              <p className="font-medium text-sm line-clamp-2">{prompt}</p>
              <p className="text-xs opacity-70">{new Date(timestamp).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add this at the top of the file
const logTransaction = (stage, data) => {
  console.log(`🔄 [Transaction ${stage}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Add these optimized transaction utilities
const getOptimizedPriorityFee = async (connection) => {
  try {
    const priorityFees = await connection.getRecentPrioritizationFees();
    // Get max fee from recent transactions for better chances
    const maxFee = Math.max(
      ...priorityFees
        .filter(fee => fee.prioritizationFee)
        .map(fee => fee.prioritizationFee)
    );
    return maxFee || 50000; // Higher default fee for better reliability
  } catch (error) {
    console.error('Priority fee error:', error);
    return 50000; // Fallback fee
  }
};

const getLatestBlockhashWithRetry = async (connection, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('processed');
      return { blockhash, lastValidBlockHeight };
    } catch (error) {
      console.error(`Blockhash attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

// Add this logging utility at the top
const logTx = (stage, data) => {
  console.log(`🔄 [TX ${stage}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

export function ImageGenerator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedModel, setSelectedModel] = useState('mew')
  const { connected } = useWallet()
  const { toast } = useToast()
  const wallet = useWallet()
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [transactionStatus, setTransactionStatus] = useState('idle'); // 'idle' | 'processing' | 'confirmed' | 'generating'
  const [currentToastId, setCurrentToastId] = useState(null);

  const [models, setModels] = useState([
    // Default models as fallback
    {
      id: 'mew',
      name: 'MEW',
      image: 'https://pbs.twimg.com/profile_images/1772493729120575488/U5fkTROU_400x400.jpg',
      description: 'Generate MEW-style images',
      available: true
    },
    {
      id: 'fwog',
      name: 'FWOG',
      image: 'https://pbs.twimg.com/profile_images/1847811775242063874/aPQtRzhg_400x400.jpg',
      description: 'Generate FWOG-style images',
      available: true
    }
  ]);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          if (data.models.length > 0) {
            setModels(data.models);
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };

    fetchModels();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isGenerating && connected && prompt) {
      handleGenerate();
    }
  };

  const verifyTokenBalance = async () => {
    try {
      const userTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      );

      try {
        const account = await getAccount(connection, userTokenAccount);
        const balance = Number(account.amount) / Math.pow(10, 6);
        
        if (balance < COST_PER_IMAGE) {
          toast({
            variant: "destructive",
            title: "Insufficient Balance",
            description: `You need at least ${COST_PER_IMAGE} tokens. Current balance: ${balance.toFixed(2)}`,
          });
          return false;
        }
        return true;
      } catch (e) {
        try {
          const transaction = new Transaction();
          
          // Get latest blockhash with retry logic
          let blockhash;
          let lastValidBlockHeight;
          
          try {
            const result = await withTimeout(
              connection.getLatestBlockhash('confirmed'),
              10000,
              'Getting blockhash'
            );
            blockhash = result.blockhash;
            lastValidBlockHeight = result.lastValidBlockHeight;
          } catch (error) {
            console.error('Failed to get blockhash:', error);
            toast({
              variant: "destructive",
              title: "Network Error",
              description: "Failed to connect to Solana network. Please try again.",
            });
            return false;
          }

          transaction.recentBlockhash = blockhash;
          transaction.feePayer = wallet.publicKey;

          // Create token account instruction
          const createAccountInstruction = createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            userTokenAccount,
            wallet.publicKey,
            TOKEN_MINT
          );
          
          transaction.add(createAccountInstruction);

          // Sign and send with better error handling
          try {
            const signed = await wallet.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signed.serialize(), {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 5
            });
            
            await connection.confirmTransaction({
              signature,
              blockhash,
              lastValidBlockHeight
            });

            toast({
              title: "Account Created",
              description: "Token account has been created. Please add tokens to continue.",
            });
          } catch (sendError) {
            console.error('Transaction error:', sendError);
            toast({
              variant: "destructive",
              title: "Transaction Failed",
              description: "Failed to create token account. Please try again.",
            });
            return false;
          }
        } catch (createError) {
          console.error('Account creation error:', createError);
          toast({
            variant: "destructive",
            title: "Account Creation Failed",
            description: "Failed to create token account. Please try again.",
          });
          return false;
        }
        return false;
      }
    } catch (error) {
      console.error('Balance check error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify token balance. Please try again.",
      });
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !wallet.connected) return;

    const hasBalance = await verifyTokenBalance();
    if (!hasBalance) return;

    try {
      logTx('START', { prompt, model: selectedModel });
      setTransactionStatus('processing');
      setIsGenerating(true);
      
      const toastId = toast({
        title: "Processing Payment",
        description: (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Preparing transaction...</span>
          </div>
        ),
      });

      // Get accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      );

      const treasuryTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        TREASURY_WALLET
      );

      // Build transaction
      let transaction = new Transaction();
      
      // Get fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        userTokenAccount,
        treasuryTokenAccount,
        wallet.publicKey,
        COST_PER_IMAGE * Math.pow(10, 6)
      );
      transaction.add(transferInstruction);

      // Sign and send
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 3
      });

      logTx('SENT', { signature });

      // Show transaction link
      toast({
        id: toastId,
        title: "Transaction Sent",
        description: (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing payment...</span>
            </div>
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-500 hover:text-blue-600"
            >
              View on Solscan
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        ),
      });

      // Wait for confirmation
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      const interval = 1000; // 1 second interval

      while (!confirmed && attempts < maxAttempts) {
        try {
          const status = await connection.getSignatureStatus(signature);

          if (status?.value?.err) {
            throw new Error('Transaction failed');
          }

          // Check for any confirmation status
          if (status?.value?.confirmationStatus) {
            confirmed = true;
            break;
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, interval));
        } catch (error) {
          console.error('Confirmation check error:', error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }

      // Even if not confirmed, proceed with generation if transaction exists
      const finalStatus = await connection.getSignatureStatus(signature);
      
      if (finalStatus?.value?.err) {
        throw new Error('Transaction failed');
      }

      // Continue with generation
      setTransactionStatus('confirmed');
      toast({
        title: "Payment Processing",
        description: (
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Starting image generation...</span>
          </div>
        ),
        duration: 5000,
      });

      setTransactionStatus('generating');
      
      // Generate image
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      const data = await imageResponse.json();

      if (!imageResponse.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImages(prevImages => [...data.images, ...prevImages]);
      setTransactionStatus('idle');

      toast({
        title: "Success!",
        description: "Your image has been generated!",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error:', error);
      setTransactionStatus('idle');
      setIsGenerating(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process request",
      });
    }
  };

  // Handle image load error
  const handleImageError = (modelId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [modelId]: true
    }));
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      generatedImages.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [generatedImages]);

  // Update the TransactionStatusCard component
  const TransactionStatusCard = () => {
    if (transactionStatus === 'idle') return null;

    return (
      <Card className={`border-primary/50 ${transactionStatus === 'confirmed' ? 'bg-green-50/50' : ''}`}>
        <CardContent className="p-8">
          {transactionStatus === 'processing' && (
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">Please approve the transaction in your wallet...</p>
                <p className="text-sm text-red-500 font-medium mt-2">
                  Please do not refresh or close this page
                </p>
              </div>
            </div>
          )}

          {transactionStatus === 'confirmed' && (
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="relative">
                <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
                <div className="absolute inset-0 h-12 w-12 border-4 border-green-500 rounded-full animate-ping" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-green-600">Payment Confirmed!</h3>
                <p className="text-sm text-green-600/80">Starting image generation...</p>
                <p className="text-sm text-red-500 font-medium mt-2">
                  Please do not refresh or close this page
                </p>
              </div>
            </div>
          )}

          {transactionStatus === 'generating' && (
            <div className="flex flex-col items-center space-y-4">
              <Sparkles className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Creating Your Image</h3>
                <p className="text-sm text-muted-foreground">This might take a minute...</p>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Please do not refresh or close this page while generating
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Model Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card 
              key={model.id}
              className={`cursor-pointer transition-all ${
                selectedModel === model.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:border-primary'
              } ${!model.available && 'opacity-50'}`}
              onClick={() => model.available && setSelectedModel(model.id)}
            >
              <CardContent className="p-4">
                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-muted">
                  {imageLoadErrors[model.id] ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={model.image || model.previewImage}
                      alt={model.name}
                      className="object-cover w-full h-full"
                      onError={() => handleImageError(model.id)}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                  {!model.available && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <CreateModelDialog />
        </div>
      </div>

      {/* Prompt Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Enter Prompt</label>
              <span className="text-sm text-muted-foreground">
                Cost: 1,000 tokens per image
              </span>
            </div>
            <Input
              placeholder={
                selectedModel === 'mew' 
                  ? "Enter your MEW prompt..." 
                  : "Enter your FWOG prompt..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isGenerating}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !connected || !prompt}
            className="w-full relative overflow-hidden"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                <span className="animate-pulse">Generating Magic...</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
              </div>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {transactionStatus !== 'idle' && <TransactionStatusCard />}

      {/* Generated Images */}
      {transactionStatus === 'generating' ? (
        <GeneratingPlaceholder />
      ) : (
        Array.isArray(generatedImages) && generatedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Generated Images</h2>
              <Button 
                variant="outline"
                onClick={() => router.push('/gallery')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                View All Generations
              </Button>
            </div>
            {/* Single column for full-size display */}
            <div className="space-y-4">
              {generatedImages.map((imageUrl, index) => (
                <GeneratedImageCard
                  key={index}
                  imageUrl={imageUrl}
                  prompt={prompt}
                  timestamp={new Date().toISOString()}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
