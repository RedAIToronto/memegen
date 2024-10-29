import { Card, CardContent } from "@/components/ui/card"

import { Sparkles, Loader2, CheckCircle2, ExternalLink } from "lucide-react"



export function GeneratingPlaceholder() {

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
