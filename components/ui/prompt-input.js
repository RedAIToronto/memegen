export function PromptInput({ value, onChange, isGenerating, onGenerate, selectedModel }) {
  return (
    <Card className="p-5 bg-white shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-lg font-semibold text-gray-900">
            Your Prompt
          </Label>
          <div className="flex items-center text-sm font-medium text-gray-500">
            <Coins className="h-4 w-4 mr-1" />
            Cost: 5 $FWOG
          </div>
        </div>
        
        {/* Input Area */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              id="prompt"
              placeholder={selectedModel ? `Create a ${selectedModel.name} style meme...` : "Select a model above..."}
              value={value}
              onChange={onChange}
              disabled={isGenerating || !selectedModel}
              className="w-full pr-24 border-gray-200 focus:border-gray-300 focus:ring-gray-200 
                text-lg py-6 bg-white shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {value.length}/500
            </div>
          </div>

          <Button 
            onClick={onGenerate} 
            disabled={isGenerating || !value || !selectedModel}
            className="bg-black hover:bg-gray-900 text-white px-8 py-6 text-lg shadow-sm
              disabled:bg-gray-100 disabled:text-gray-400 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-gray-500">
          Try to be specific about the style, mood, and details you want in your meme.
        </p>
      </div>
    </Card>
  )
} 