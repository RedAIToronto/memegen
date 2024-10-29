import { Card, CardContent } from "@/components/ui/card"

import { Sparkles, Loader2, CheckCircle2, ExternalLink, XCircle, Clock } from "lucide-react"



export function GeneratingPlaceholder() {

  return (

    <div className="mt-6 rounded-lg overflow-hidden relative aspect-square bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse">

      <div className="absolute inset-0 flex items-center justify-center">

        <Sparkles className="h-12 w-12 text-purple-500 animate-spin" />

      </div>

    </div>

  )

}



export const TransactionStatus = ({ status, signature, message, retryCount, error }) => {

  return (

    <div className="mt-6 p-6 border rounded-lg bg-white/50 backdrop-blur-sm">

      {status === 'processing' && (

        <div className="flex flex-col items-center space-y-4">

          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <div className="text-center">

            <h3 className="font-semibold text-lg">Processing Payment</h3>

            <p className="text-sm text-muted-foreground">Please confirm in your wallet...</p>

          </div>

        </div>

      )}



      {status === 'rejected' && (

        <div className="flex flex-col items-center space-y-4">

          <XCircle className="h-12 w-12 text-red-500" />

          <div className="text-center">

            <h3 className="font-semibold text-lg text-red-600">Transaction Rejected</h3>

            <p className="text-sm text-red-600/80">You declined the transaction.</p>

            <p className="text-sm text-muted-foreground mt-2">Please try again when ready.</p>

          </div>

        </div>

      )}



      {status === 'timeout' && (

        <div className="flex flex-col items-center space-y-4">

          <Clock className="h-12 w-12 text-orange-500 animate-pulse" />

          <div className="text-center">

            <h3 className="font-semibold text-lg text-orange-600">Transaction Taking Longer Than Expected</h3>

            <p className="text-sm text-orange-600/80">Attempting to retry transaction...</p>

            {retryCount && (

              <p className="text-sm text-orange-600/80">Retry attempt {retryCount} of 3</p>

            )}

            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">

              <p className="text-sm text-orange-600 font-medium">

                ⚠️ Please keep your wallet ready to sign the retry transaction

              </p>

            </div>

          </div>

        </div>

      )}



      {status === 'confirming' && (

        <div className="flex flex-col items-center space-y-4">

          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <div className="text-center">

            <h3 className="font-semibold text-lg">Confirming Transaction</h3>

            <p className="text-sm text-muted-foreground">This will take a few seconds...</p>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">

              <p className="text-sm text-yellow-600 font-medium">

                ⚠️ Please keep this page open while confirming

              </p>

            </div>

            {signature && (

              <a

                href={`https://solscan.io/tx/${signature}`}

                target="_blank"

                rel="noopener noreferrer"

                className="text-sm text-primary hover:underline mt-2 inline-flex items-center"

              >

                View on Solscan

                <ExternalLink className="h-3 w-3 ml-1" />

              </a>

            )}

          </div>

        </div>

      )}



      {status === 'confirmed' && (

        <div className="flex flex-col items-center space-y-2 w-full">

          <div className="relative">

            <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />

            <div className="absolute inset-0 h-12 w-12 border-4 border-green-500 rounded-full animate-ping" />

          </div>

          <div className="text-center">

            <h3 className="font-bold text-xl text-green-600">Payment Confirmed!</h3>

            <p className="text-sm text-green-600/80">Starting image generation...</p>

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">

              <p className="text-sm text-red-600 font-medium">

                ⚠️ Do not close or refresh this page - Image generation in progress

              </p>

            </div>

          </div>

        </div>

      )}



      {status === 'generating' && (

        <div className="flex flex-col items-center space-y-4">

          <div className="relative">

            <Sparkles className="h-10 w-10 animate-spin text-purple-500" />

            <div className="absolute inset-0 h-10 w-10 border-4 border-purple-500/30 rounded-full animate-pulse" />

          </div>

          <div className="text-center">

            <h3 className="font-semibold text-lg text-purple-600">Creating Your Image</h3>

            <p className="text-sm text-purple-600/80">This might take a minute...</p>

            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">

              <p className="text-sm text-purple-600 font-medium flex items-center justify-center">

                <span className="text-red-500 mr-2">⚠️</span>

                Do not close or refresh - Your image is being generated

              </p>

            </div>

          </div>

        </div>

      )}



      {status === 'error' && (

        <div className="flex flex-col items-center space-y-4">

          <XCircle className="h-12 w-12 text-red-500" />

          <div className="text-center">

            <h3 className="font-semibold text-lg text-red-600">Transaction Failed</h3>

            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">

              <p className="text-sm text-red-600/80">

                {error?.includes('InvalidAccountData') 

                  ? 'Invalid token account. Please ensure you have $AIDOBE tokens.'

                  : error?.includes('InstructionError') 

                    ? 'Transaction instruction failed. Please try again.'

                    : error || 'Failed to process transaction'}

              </p>

            </div>

            <p className="text-sm text-muted-foreground mt-4">

              You can try again or check your wallet for details

            </p>

          </div>

        </div>

      )}

    </div>

  );

}; 
