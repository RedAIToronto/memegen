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
import { TransactionStatus } from "./image-generator/status-cards"
import { handleTransaction } from './image-generator/transaction-handler'
import { Connection } from '@solana/web3.js'

const CREATION_COST = 4200000 // 4.2M tokens
const TOKEN_MINT = new PublicKey('FXPn4kM8M252tbRXV4mvdqSQvY6jrg3J5cuRCphXpump')
const TREASURY_WALLET = new PublicKey('3cUsyqkLHmdCBWBgfRsMDScsTHYNNCQ9rUHBL7uJWK9c')

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL
const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000
})

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
  const [transactionStatus, setTransactionStatus] = useState('idle')
  const [transactionSignature, setTransactionSignature] = useState(null)

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

    setTransactionStatus('processing')
    setIsProcessing(true)

    try {
      const signature = await handleTransaction({
        connection,
        wallet,
        amount: CREATION_COST * Math.pow(10, 6),
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

      // After successful payment, create model
      setTransactionStatus('creating')
      
      const modelData = {
        name: modelName,
        fileUrl: uploadedFile.url,
        previewImage,
        owner: wallet.publicKey.toString(),
        status: 'preparing',
        estimatedTime: 'Preparing for training...'
      };

      await addToQueue(modelData);

      setTransactionStatus('idle')
      toast({
        title: "Success",
        description: "Model creation started! Check the queue for status.",
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error:', error);
      setTransactionStatus('idle')
      toast({
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

      {/* Transaction Status */}
      {transactionStatus !== 'idle' && (
        <TransactionStatus 
          status={transactionStatus}
          signature={transactionSignature}
        />
      )}

      <Button
        onClick={handleCreate}
        disabled={isProcessing || !connected || !modelName || !uploadedFile || !previewImage}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 
          transition-all duration-300 transform hover:scale-[1.02]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {transactionStatus === 'creating' ? 'Creating Model...' : 'Processing...'}
          </>
        ) : (
          'Create Model (4.2M $AIDOBE)'
        )}
      </Button>
    </div>
  );
}
