import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from '@solana/wallet-adapter-react'
import { Upload, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token'
import { UploadButton } from "@/utils/uploadthing"
import { Transaction } from '@solana/web3.js'
import { useModelQueue } from "@/contexts/ModelQueueContext"
import { ComputeBudgetProgram } from '@solana/web3.js';
import { CheckCircle2, Sparkles } from 'lucide-react'

const CREATION_COST = 200000 // 4.2M tokens
const TOKEN_MINT = new PublicKey('FXPn4kM8M252tbRXV4mvdqSQvY6jrg3J5cuRCphXpump')
const TREASURY_WALLET = new PublicKey('3cUsyqkLHmdCBWBgfRsMDScsTHYNNCQ9rUHBL7uJWK9c')

// Add logging utility
const logTransaction = (stage, data) => {
  console.log(`🔄 [Model Creation ${stage}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

export function CreateModel() {
  const [modelName, setModelName] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { connected } = useWallet()
  const { toast } = useToast()
  const { connection } = useConnection()
  const wallet = useWallet()
  const { addToQueue } = useModelQueue()
  const [creationStatus, setCreationStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'confirmed' | 'creating'
  const [uploadProgress, setUploadProgress] = useState(0);

  const verifyTokenBalance = async () => {
    try {
      const userTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      )

      const account = await getAccount(connection, userTokenAccount)
      const balance = Number(account.amount) / Math.pow(10, 6)
      
      if (balance < CREATION_COST) {
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: `You need ${CREATION_COST.toLocaleString()} tokens. Current balance: ${balance.toLocaleString()}`,
        })
        return false
      }
      return true
    } catch (error) {
      console.error('Balance check error:', error)
      return false
    }
  }

  const validateForm = () => {
    if (!modelName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Model Name",
        description: "Please enter a name for your model",
      });
      return false;
    }

    if (!previewImage.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Preview Image",
        description: "Please provide a preview image URL",
      });
      return false;
    }

    if (!uploadedFile) {
      toast({
        variant: "destructive",
        title: "Missing Training Data",
        description: "Please upload your training data ZIP file",
      });
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    if (!connected || !wallet.publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
      });
      return;
    }

    const hasBalance = await verifyTokenBalance();
    if (!hasBalance) return;

    let toastId;

    try {
      setIsProcessing(true);
      toastId = toast({
        title: "Processing Payment",
        description: "Please approve the transaction in your wallet...",
      });

      // Token transfer logic
      const userTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      );

      const treasuryTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        TREASURY_WALLET
      );

      // Get latest blockhash with priority fees
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Calculate priority fee
      const priorityFee = await connection.getRecentPrioritizationFees();
      const maxPriorityFeePerComputation = priorityFee.length > 0 
        ? priorityFee[0].prioritizationFee 
        : 50000; // fallback priority fee

      let transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Add compute unit limit and price
      const computeUnitLimit = 200000;
      const additionalComputeBudgetInstruction = ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnitLimit
      });
      
      const addPriorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: maxPriorityFeePerComputation
      });

      transaction.add(additionalComputeBudgetInstruction, addPriorityFeeInstruction);

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        userTokenAccount,
        treasuryTokenAccount,
        wallet.publicKey,
        CREATION_COST * Math.pow(10, 6)
      );
      transaction.add(transferInstruction);

      logTransaction('SENDING', { 
        blockhash,
        priorityFee: maxPriorityFeePerComputation,
        computeUnits: computeUnitLimit 
      });

      // Sign and send transaction
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 5,
        preflightCommitment: 'confirmed'
      });

      logTransaction('SENT', { signature });

      // Show transaction link
      toast({
        id: toastId,
        title: "Transaction Sent",
        description: (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Confirming transaction...</span>
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

      // Add aggressive confirmation handling
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 3;
      const confirmationTimeout = 30000; // 30 seconds total

      while (!confirmed && attempts < maxAttempts) {
        try {
          logTransaction('CONFIRMING', { attempt: attempts + 1, signature });
          
          const confirmation = await Promise.race([
            connection.confirmTransaction(
              {
                signature,
                blockhash,
                lastValidBlockHeight
              },
              'confirmed'
            ),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Confirmation timeout')), confirmationTimeout / maxAttempts)
            )
          ]);

          if (confirmation?.value?.err) {
            throw new Error('Transaction failed');
          }

          confirmed = true;
          logTransaction('CONFIRMED', { signature, attempts });

          // After successful payment
          setCreationStatus('creating');
          
          // Create model data with preparing status
          const modelData = {
            name: modelName,
            fileUrl: uploadedFile.url,
            previewImage,
            owner: wallet.publicKey.toString(),
            status: 'preparing', // Set default status to preparing
            estimatedTime: 'Preparing for training...'
          };

          // Add to queue
          await addToQueue(modelData);

          toast({
            title: "Model Added to Queue",
            description: (
              <div className="space-y-2">
                <p>Your model "{modelName}" has been added to the queue.</p>
                <p className="text-sm text-muted-foreground">
                  Check the admin panel to manage training status.
                </p>
              </div>
            ),
            duration: 10000,
          });

          // Reset form
          setModelName('');
          setPreviewImage('');
          setUploadedFile(null);

        } catch (error) {
          attempts++;
          logTransaction('CONFIRMATION_RETRY', { attempt: attempts, error: error.message });
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        id: toastId,
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process request",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusCard = () => {
    if (creationStatus === 'idle') return null;

    return (
      <Card className={`border-primary/50 mt-4 ${creationStatus === 'confirmed' ? 'bg-green-50/50' : ''}`}>
        <CardContent className="p-6">
          {creationStatus === 'uploading' && (
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold">Uploading Training Data</h3>
                <p className="text-sm text-muted-foreground">
                  Progress: {uploadProgress}%
                </p>
                <p className="text-sm text-red-500 font-medium mt-2">
                  Please do not refresh or close this page
                </p>
              </div>
            </div>
          )}

          {creationStatus === 'processing' && (
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Please approve the transaction in your wallet...
                </p>
                <p className="text-sm text-red-500 font-medium mt-2">
                  Please do not refresh or close this page
                </p>
              </div>
            </div>
          )}

          {creationStatus === 'confirmed' && (
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="relative">
                <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
                <div className="absolute inset-0 h-12 w-12 border-4 border-green-500 rounded-full animate-ping" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-green-600">Payment Confirmed!</h3>
                <p className="text-sm text-green-600/80">Creating your model...</p>
              </div>
            </div>
          )}

          {creationStatus === 'creating' && (
            <div className="flex flex-col items-center space-y-4">
              <Sparkles className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Setting Up Your Model</h3>
                <p className="text-sm text-muted-foreground">
                  Adding to training queue...
                </p>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Please wait while we complete the setup
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
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          <ul className="list-disc pl-4 space-y-1">
            <li>Cost: 4,200,000 tokens</li>
            <li>Upload a ZIP file containing your training images (10-20 images recommended)</li>
            <li>Provide a preview image URL for your model</li>
            <li>Fine-tuning takes approximately 1 hour</li>
            <li>Your model will be promoted on Twitter once ready</li>
            <li>Images should be high-quality and consistent in style</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="modelName">Model Name</Label>
        <Input
          id="modelName"
          placeholder="Enter a unique name for your model"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="previewImage">Preview Image URL</Label>
        <Input
          id="previewImage"
          placeholder="Enter URL for model preview image"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
          disabled={isProcessing}
        />
        {previewImage && (
          <div className="mt-2 aspect-video relative rounded-lg overflow-hidden bg-muted">
            <img
              src={previewImage}
              alt="Preview"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                toast({
                  variant: "destructive",
                  title: "Invalid Image URL",
                  description: "Please provide a valid image URL",
                });
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Training Images (ZIP)</Label>
        <div className="flex items-center gap-2">
          <UploadButton
            endpoint="modelTraining"
            onUploadBegin={() => {
              setCreationStatus('uploading');
              setUploadProgress(0);
            }}
            onUploadProgress={(progress) => {
              setUploadProgress(Math.round(progress * 100));
            }}
            onClientUploadComplete={(res) => {
              setUploadedFile(res[0]);
              setCreationStatus('idle');
              toast({
                title: "File Uploaded",
                description: "Your training data is ready for model creation.",
              });
            }}
            onUploadError={(error) => {
              setCreationStatus('idle');
              toast({
                variant: "destructive",
                title: "Upload Error",
                description: error.message,
              });
            }}
            appearance={{
              button: "w-full",
            }}
          />
        </div>
        {uploadedFile && (
          <p className="text-sm text-muted-foreground">
            ✓ {uploadedFile.name} uploaded successfully
          </p>
        )}
      </div>

      <Button
        onClick={handleCreate}
        disabled={isProcessing || !connected || !modelName || !uploadedFile || !previewImage}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Create Model'
        )}
      </Button>

      <StatusCard />
    </div>
  );
}
