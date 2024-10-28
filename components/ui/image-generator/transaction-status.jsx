import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";

export const TransactionStatus = ({ status, signature, message }) => {
  if (status === 'idle') return null;

  return (
    <Card className={`border-primary/50 ${status === 'confirmed' ? 'bg-green-50/50' : ''}`}>
      <CardContent className="p-8">
        {status === 'processing' && (
          <div className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">Please approve the transaction in your wallet...</p>
              <p className="text-sm text-red-500 font-medium mt-2">
                Please do not refresh or close this page
              </p>
              {signature && (
                <a
                  href={`https://solscan.io/tx/${signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-500 hover:text-blue-600 mt-2"
                >
                  View on Solscan
                  <ExternalLink className="ml-1 h-3 w-3" />
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
              <p className="text-sm text-red-500 font-medium mt-2">
                Please do not refresh or close this page
              </p>
            </div>
          </div>
        )}

        {status === 'generating' && (
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
