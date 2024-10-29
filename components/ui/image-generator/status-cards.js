import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2, CheckCircle2, ExternalLink, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GeneratingPlaceholder() {
  return (
    <div className="mt-6 rounded-lg overflow-hidden relative aspect-square bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    </div>
  )
}

const RAYDIUM_URL = "https://raydium.io/swap/?inputMint=sol&outputMint=A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump"

export const TransactionStatus = ({ status, signature, message, retryCount, error }) => {
  const getTokenButton = (
    <a
      href={RAYDIUM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-pink-500 bg-pink-50 rounded-md hover:bg-pink-100 transition-colors mt-2"
    >
      Get $FWOG tokens
      <ExternalLink className="h-3 w-3 ml-1" />
    </a>
  );

  return (
    <div className="mt-6 p-6 border rounded-lg bg-white/50 backdrop-blur-sm">
      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            <div className="absolute inset-0 h-10 w-10 border-4 border-purple-500/30 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg text-purple-600">Processing Payment</h3>
            <p className="text-sm text-purple-600/80">Please confirm the 5 $FWOG payment in your wallet...</p>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm text-purple-600 font-medium">
                ⚠️ Keep your wallet open to approve the transaction
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'confirming' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
            <div className="absolute inset-0 h-10 w-10 border-4 border-yellow-500/30 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg text-yellow-600">Confirming Transaction</h3>
            <p className="text-sm text-yellow-600/80">Almost there! Confirming your payment...</p>
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
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-green-500 rounded-full animate-ping" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl text-green-600">Payment Successful!</h3>
            <p className="text-sm text-green-600/80">Starting your image generation...</p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-600 font-medium">
                ⚠️ Please keep this page open while we generate your image
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-purple-500 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500/30 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl text-purple-600">Creating Your Image</h3>
            <p className="text-sm text-purple-600/80">The AI is working its magic...</p>
            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-progress"></div>
              </div>
              <p className="text-xs text-purple-600/80">This usually takes about a minute</p>
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
                {error?.includes('insufficient funds') 
                  ? 'Insufficient $FWOG tokens. You need 5 $FWOG tokens to generate an image.'
                  : error?.includes('TokenAccountNotFoundError') 
                    ? 'No $FWOG tokens found. Please get some $FWOG tokens first.'
                    : error?.includes('User rejected') 
                      ? 'You declined the transaction. Try again when ready.'
                      : error || 'Failed to process transaction'}
              </p>
            </div>
            {(error?.includes('$FWOG tokens') || error?.includes('TokenAccountNotFoundError')) && (
              <div className="mt-4">
                {getTokenButton}
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'timeout' && (
        <div className="flex flex-col items-center space-y-4">
          <Clock className="h-12 w-12 text-orange-500 animate-pulse" />
          <div className="text-center">
            <h3 className="font-semibold text-lg text-orange-600">Taking Longer Than Expected</h3>
            <p className="text-sm text-orange-600/80">
              {retryCount ? `Retry attempt ${retryCount} of 3` : 'Transaction is taking longer than usual'}
            </p>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ Please keep your wallet ready for potential retry
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
