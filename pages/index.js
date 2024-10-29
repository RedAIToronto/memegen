import React, { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import { ImageGenerator } from "@/components/ui/image-generator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Coins, ImageIcon, Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Home() {
  const [recentGenerations, setRecentGenerations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchRecentGenerations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/generations?limit=3')
        if (!response.ok) throw new Error('Failed to fetch generations')
        
        const data = await response.json()
        if (data.success && Array.isArray(data.generations)) {
          setRecentGenerations(data.generations)
        }
      } catch (error) {
        console.error('Failed to fetch recent generations:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (isClient) {
      fetchRecentGenerations()
    }
  }, [isClient])

  if (!isClient) {
    return null
  }

  const renderGenerations = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <p className="text-red-500">Failed to load recent generations</p>
        </Card>
      )
    }

    if (recentGenerations.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No generations yet</p>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentGenerations.map((generation) => (
          <Card key={generation.id} className="overflow-hidden group hover:shadow-xl hover:shadow-pink-500/20 transition-all">
            <div className="aspect-square relative">
              <img
                src={generation.imageUrl}
                alt={generation.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-white font-medium line-clamp-2">{generation.prompt}</p>
                <p className="text-white/70 text-sm mt-1">
                  {new Date(generation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-pink-500/5 via-purple-500/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="relative py-8 mb-12">
            {/* Animated background effects */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-10 animate-twinkle" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent animate-pulse" />
              {/* Kawaii decorative elements */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="relative flex items-center justify-between">
              {/* Left side content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-xl"
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text mb-4">
                  AIDOBE
                </h1>
                <p className="text-2xl text-muted-foreground mb-6">
                  Generate AI memes with $AIDOBE tokens (◕‿◕✿)
                </p>
                <div className="flex gap-4">
                  <Link href="#generate">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg px-8">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Generating
                    </Button>
                  </Link>
                  <Link href="https://raydium.io/swap" target="_blank">
                    <Button variant="outline" className="text-lg px-8 border-pink-500/20">
                      <Coins className="mr-2 h-4 w-4" />
                      Buy $AIDOBE
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right side logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-[300px] h-[300px]"
              >
                <Image
                  src="https://pbs.twimg.com/media/GbAtotSWcAA5Uh2?format=png&name=small"
                  alt="AIDOBE"
                  fill
                  className="object-contain animate-float drop-shadow-2xl"
                />
                {/* Kawaii decorative elements around logo */}
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-2xl -z-10 animate-pulse" />
                <div className="absolute -top-6 -right-6 text-3xl animate-bounce">🌸</div>
                <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-100">✨</div>
              </motion.div>
            </div>
          </section>

          {/* Generator Section */}
          <section id="generate" className="scroll-mt-16">
            <ImageGenerator />
          </section>

          {/* Recent Generations with better error handling */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              Recent Generations ✨
            </h2>
            {renderGenerations()}
          </section>
        </div>
      </div>
    </Layout>
  )
}
