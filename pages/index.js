import React, { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Clock, Coins, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from 'next/dynamic'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

// Dynamically import ImageGenerator with no SSR
const ImageGenerator = dynamic(
  () => import('@/components/ui/image-generator').then(mod => mod.ImageGenerator),
  { ssr: false }
)

function RecentGenerationCard({ generation }) {
  const [isValid, setIsValid] = useState(true)

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/proxy-image/${generation.id}`);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generation.prompt.slice(0, 30)}-${generation.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  if (!isValid) return null

  return (
    <motion.div
      layoutId={`image-${generation.id}`}
      className="relative aspect-square bg-black/5 rounded-lg overflow-hidden group hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300"
    >
      <img
        src={`/api/proxy-image/${generation.id}`}
        alt={generation.prompt}
        className="w-full h-full object-cover"
        onError={() => setIsValid(false)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
        <div className="text-white">
          <p className="font-medium text-sm line-clamp-2">{generation.prompt}</p>
          <p className="text-xs opacity-70 mt-1">
            {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
          </p>
          <p className="text-xs opacity-70">{generation.modelName || generation.model}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleDownload}
            className="bg-white/20 hover:bg-white/30"
          >
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Link href={`/view/${generation.id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [recentGenerations, setRecentGenerations] = useState([])

  useEffect(() => {
    const fetchRecentGenerations = async () => {
      try {
        const response = await fetch('/api/generations?limit=3') // Fetch only 3 most recent
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.generations)) {
            setRecentGenerations(data.generations)
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent generations:', error)
      }
    }

    fetchRecentGenerations()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-12">
          {/* Hero Section with Logo */}
          <section className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-6 mb-8">
              <Image 
                src="https://pbs.twimg.com/profile_images/1851025829695721472/QFR4kshv_400x400.jpg"
                alt="AIDOBE"
                width={120}
                height={120}
                className="rounded-full shadow-xl shadow-pink-500/20 animate-pulse"
              />
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                  Welcome to AIDOBE
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  The first ever AI memecoin dedicated to bringing AI technology to non-AI memecoins
                </p>
              </div>
            </div>
          </section>

          {/* Features with enhanced styling */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 space-y-4 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 bg-white/80 backdrop-blur-sm border-pink-500/20">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">AI-Powered Generation</h3>
              <p className="text-sm text-muted-foreground">Generate memes easily with our finetuned models using $AIDOBE tokens</p>
            </Card>
            <Card className="p-8 space-y-4 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 bg-white/80 backdrop-blur-sm border-pink-500/20">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">Quick Training</h3>
              <p className="text-sm text-muted-foreground">Create your own model in 1-3 hours with just 12-24+ images</p>
            </Card>
            <Card className="p-8 space-y-4 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 bg-white/80 backdrop-blur-sm border-pink-500/20">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">Community Focused</h3>
              <p className="text-sm text-muted-foreground">4.2M $AIDOBE tokens to train your custom model</p>
            </Card>
          </div>

          {/* Generator */}
          <section className="space-y-6">
            <ImageGenerator />
          </section>
          
          {/* Recent Generations */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Recent Generations
              </h2>
              <Link href="/gallery">
                <Button variant="ghost" className="hover:bg-pink-500/10">
                  View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentGenerations.map((generation) => (
                <RecentGenerationCard key={generation.id} generation={generation} />
              ))}
            </div>
          </section>

          {/* Beta Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🚧 Beta Version - We're continuously improving! Please bear with us during high server loads.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
