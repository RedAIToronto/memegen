import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { UploadDropzone } from "@/utils/uploadthing";
import { Card } from './card';
import { handleTransaction } from './image-generator/transaction-handler';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { TransactionStatus } from "./image-generator/status-cards";

const CREATION_COST = 200000 // 4.2M tokens

export function CreateModelDialog({ open, onOpenChange }) {
  const [modelName, setModelName] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const [transactionStatus, setTransactionStatus] = useState('idle')
  const [transactionSignature, setTransactionSignature] = useState(null)
  const wallet = useWallet()
  const [tokenMint, setTokenMint] = useState(null);
  const [treasuryWallet, setTreasuryWallet] = useState(null);

  useEffect(() => {
    // Only initialize PublicKeys on client side
    try {
      if (typeof window !== 'undefined') {
        if (process.env.NEXT_PUBLIC_TOKEN_MINT) {
          setTokenMint(new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT));
        }
        if (process.env.NEXT_PUBLIC_TREASURY_WALLET) {
          setTreasuryWallet(new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET));
        }
      }
    } catch (error) {
      console.error('Failed to initialize PublicKeys:', error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Failed to initialize wallet configuration",
      });
    }
  }, []);

  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '', {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 30000
  })

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

    if (!uploadedFileUrl) {
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
    if (!tokenMint || !treasuryWallet) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Missing required configuration. Please try again later.",
      })
      return
    }

    if (!validateForm()) return;

    setTransactionStatus('processing')
    setIsUploading(true)

    try {
      const signature = await handleTransaction({
        connection,
        wallet,
        amount: CREATION_COST * Math.pow(10, 6),
        tokenMint: tokenMint,
        treasuryWallet: treasuryWallet,
        onStatus: (status) => {
          toast({
            title: "Transaction Status",
            description: status,
            duration: status.includes('Solscan') ? 10000 : 5000,
          })
        },
        onError: (error) => {
          if (error.message.includes("insufficient funds")) {
            toast({
              title: "Insufficient $AIDOBE tokens",
              description: "Please make sure you have enough tokens to create a model",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Transaction failed",
              description: "Please try again later",
              variant: "destructive"
            })
          }
        }
      })

      if (!signature) {
        throw new Error('Transaction failed')
      }

      setTransactionSignature(signature)
      setTransactionStatus('confirming')

      // Create model after payment
      const response = await fetch('/api/models/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          previewImage,
          trainingData: uploadedFileUrl,
          owner: wallet.publicKey.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create model');
      }

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
        description: error.message || "Failed to create model",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    toast({
      variant: "destructive",
      title: "Invalid Image URL",
      description: "Please provide a valid image URL",
    });
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/90">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
            Create New Model
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create your own AI model with 12-24+ training images
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modelName" className="text-sm font-medium">
              Model Name
            </Label>
            <Input
              id="modelName"
              placeholder="Enter model name..."
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="border-pink-500/20 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previewImage" className="text-sm font-medium">
              Preview Image URL
            </Label>
            <Input
              id="previewImage"
              placeholder="Enter preview image URL..."
              value={previewImage}
              onChange={(e) => {
                setPreviewImage(e.target.value);
                setImageError(false);
              }}
              className="border-pink-500/20 focus:border-purple-500 focus:ring-purple-500/20"
            />
            {previewImage && !imageError && (
              <Card className="mt-2 overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
              </Card>
            )}
            {imageError && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4" />
                Invalid image URL
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Training Images (ZIP)
            </Label>
            <UploadDropzone
              endpoint="modelTraining"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  setUploadedFileUrl(res[0].url);
                  toast({
                    title: "Upload Complete",
                    description: "Training images uploaded successfully!",
                  });
                }
              }}
              onUploadError={(error) => {
                toast({
                  variant: "destructive",
                  title: "Upload Error",
                  description: error.message || "Failed to upload training images",
                });
              }}
              config={{
                mode: "auto",
              }}
              className="border-2 border-dashed border-pink-500/20 rounded-lg ut-uploading:border-purple-500/20 
                ut-button:bg-gradient-to-r ut-button:from-pink-500 ut-button:to-purple-500
                ut-button:hover:from-pink-600 ut-button:hover:to-purple-600"
            />
            {uploadedFileUrl && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Training data uploaded successfully
              </p>
            )}
          </div>
        </div>

        {transactionStatus !== 'idle' && (
          <TransactionStatus 
            status={transactionStatus}
            signature={transactionSignature}
          />
        )}

        <Button
          onClick={handleCreate}
          disabled={isUploading || !uploadedFileUrl || !modelName || !previewImage}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 
            transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Model (4.2M $AIDOBE)'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}


