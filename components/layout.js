import { WalletButton } from "@/components/ui/wallet-button"
import Link from "next/link"
import { Button } from "./ui/button"
import { ImageIcon, Sparkles, Loader2, Menu } from "lucide-react"
import { useModelQueue } from "@/contexts/ModelQueueContext"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const STATUS_ICONS = {
  preparing: Loader2,
  training: Sparkles,
  completed: Sparkles,
  queued: Loader2
};

const STATUS_COLORS = {
  preparing: "text-yellow-500",
  training: "text-black",
  completed: "text-green-500",
  queued: "text-blue-500"
};

const STATUS_TEXT = {
  preparing: "Preparing",
  training: "Training",
  completed: "Ready",
  queued: "Queued"
};

export default function Layout({ children }) {
  const { modelQueue, fetchQueue } = useModelQueue();
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Queue polling
  useEffect(() => {
    const loadQueue = async () => {
      try {
        await fetchQueue();
      } catch (err) {
        console.error('Failed to load queue:', err);
        setError(err.message);
      }
    };

    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const activeModels = modelQueue.filter(model => 
    model.status !== 'completed' && model.status !== 'failed'
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-200 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl">
                <Image
                  src="https://replicate.delivery/yhqm/lfZAQhbFjVTKZKYn25uLPUdd2PiS1pZhQFyfeTA1PN4owkXnA/R8_sd3.5L_00001_.webp"
                  alt="MemeGen"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="font-bold text-xl">MemeGen</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-50">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-50">
                  Gallery
                </Button>
              </Link>
              <WalletButton />
            </nav>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-white"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <Link href="/" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </Link>
                <Link href="/gallery" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Gallery
                  </Button>
                </Link>
                <div className="pt-2 border-t">
                  <WalletButton className="w-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Active Models Queue */}
      {activeModels.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          isScrolled ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="bg-white border-t shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                {activeModels.map((model) => {
                  const StatusIcon = STATUS_ICONS[model.status];
                  return (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-white shrink-0">
                        <img
                          src={model.previewImage}
                          alt={model.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {model.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <StatusIcon 
                          className={`h-3.5 w-3.5 shrink-0 ${STATUS_COLORS[model.status]} ${
                            model.status === 'preparing' || model.status === 'training' 
                              ? 'animate-spin' 
                              : ''
                          }`} 
                        />
                        <span className={`text-xs ${STATUS_COLORS[model.status]}`}>
                          {STATUS_TEXT[model.status]}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow relative pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Image
                src="https://replicate.delivery/yhqm/lfZAQhbFjVTKZKYn25uLPUdd2PiS1pZhQFyfeTA1PN4owkXnA/R8_sd3.5L_00001_.webp"
                alt="MemeGen"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-sm text-gray-500">
                © 2024 MemeGen. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="https://twitter.com/aidobesol" 
                target="_blank" 
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Twitter
              </Link>
              <Link 
                href="https://discord.gg/aidobe" 
                target="_blank" 
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}































