export function SubscriptionBanner() {
  return (
    <div className="mb-8 p-6 rounded-xl bg-white border shadow-modern">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">Your Plan</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span>Free Trial</span>
            </div>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">5 generations remaining</span>
          </div>
        </div>
        <Button className="bg-black hover:bg-gray-900 text-white">
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade (1 SOL = 100 gens/month)
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-500"
            style={{ width: '75%' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">75/100 generations used</span>
          <span className="text-xs text-gray-500">Renews in 15 days</span>
        </div>
      </div>
    </div>
  )
} 