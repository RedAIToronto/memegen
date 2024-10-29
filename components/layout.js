import { WalletButton } from "@/components/ui/wallet-button"



import Link from "next/link"



import { Button } from "./ui/button"



import { ImageIcon, Sparkles, Loader2 } from "lucide-react"



import { useModelQueue } from "@/contexts/ModelQueueContext"



import { useEffect, useState } from "react"



import { motion } from "framer-motion"



import Image from "next/image"







const STATUS_ICONS = {



  preparing: Loader2,



  training: Sparkles,



  completed: Sparkles,



  queued: Loader2



};







const STATUS_COLORS = {



  preparing: "text-pink-500",



  training: "text-purple-500",



  completed: "text-blue-500",



  queued: "text-gray-500"



};







export default function Layout({ children }) {



  const { modelQueue, fetchQueue } = useModelQueue();



  const [error, setError] = useState(null);







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







  return (



    <div className="min-h-screen flex flex-col bg-[url('/sparkle-pattern.png')] bg-fixed bg-opacity-50">



      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">



        <div className="container mx-auto px-4 py-3">



          <div className="flex items-center justify-between">



            {/* Left side - Logo */}



            <Link href="/" className="flex items-center space-x-3 group">



              <Image 



                src="https://pbs.twimg.com/profile_images/1851025829695721472/QFR4kshv_400x400.jpg"



                alt="AIDOBE" 



                width={40} 



                height={40}



                className="rounded-full shadow-lg transition-transform group-hover:scale-110 hover:shadow-pink-500/20"



                loading="eager"



                priority={true}



                onError={(e) => {



                  e.target.src = '/placeholder-image.png';



                }}



              />



              <div className="flex flex-col">



                <span className="font-bold text-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">



                  AIDOBE



                </span>



                <span className="text-xs text-muted-foreground">AI-Powered Meme Generation</span>



              </div>



            </Link>







            {/* Center - Queue Items */}



            {!error && modelQueue.length > 0 && (



              <div className="flex-1 max-w-3xl mx-8">



                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-2">



                  {modelQueue.map((model) => {



                    const StatusIcon = STATUS_ICONS[model.status] || Loader2;



                    return (



                      <motion.div



                        key={model.id}



                        initial={{ opacity: 0, scale: 0.95 }}



                        animate={{ opacity: 1, scale: 1 }}



                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"



                      >



                        <div className="w-5 h-5 rounded-full overflow-hidden bg-background shrink-0">



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



                        <StatusIcon 



                          className={`h-3.5 w-3.5 shrink-0 ${STATUS_COLORS[model.status]} ${



                            model.status === 'preparing' || model.status === 'training' 



                              ? 'animate-spin' 



                              : ''



                          }`} 



                        />



                      </motion.div>



                    );



                  })}



                </div>



              </div>



            )}







            {/* Right side */}



            <div className="flex items-center space-x-4">



              <Link href="/">



                <Button variant="ghost" size="sm" className="hover:bg-pink-500/10 transition-colors">



                  <ImageIcon className="h-4 w-4 mr-2" />



                  Generate



                </Button>



              </Link>



              <Link href="/gallery">



                <Button variant="ghost" size="sm" className="hover:bg-purple-500/10 transition-colors">



                  Gallery



                </Button>



              </Link>



              <WalletButton />



            </div>



          </div>



        </div>



      </nav>







      <main className="flex-grow relative">



        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />



        {children}



      </main>







      <footer className="border-t py-6 bg-background/95 backdrop-blur">



        <div className="container mx-auto px-4">



          <div className="flex justify-between items-center">



            <p className="text-sm text-muted-foreground">



              © 2024 AIDOBE. All rights reserved.



            </p>



            <div className="flex space-x-4">



              <Link href="https://twitter.com/aidobesol" target="_blank" className="text-sm text-muted-foreground hover:text-pink-500 transition-colors">



                Twitter



              </Link>



              <Link href="https://discord.gg/aidobe" target="_blank" className="text-sm text-muted-foreground hover:text-purple-500 transition-colors">



                Discord



              </Link>



            </div>



          </div>



        </div>



      </footer>



    </div>



  );



}






























