import React, { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import { ImageGenerator } from "@/components/ui/image-generator"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Coins, ImageIcon, Plus, ArrowRight } from "lucide-react"
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
      const interval = setInterval(fetchRecentGenerations, 120000);
      return () => clearInterval(interval);
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

    // Filter out generations with invalid images and verify URLs before rendering
    const validGenerations = recentGenerations.filter(gen => {
      try {
        // Check if image URL exists and is valid
        new URL(gen.imageUrl);
        // Also check if it's not a known 404 URL
        return !gen.imageUrl.includes('undefined') && 
               !gen.imageUrl.includes('null') &&
               gen.imageUrl.trim() !== '';
      } catch {
        return false;
      }
    });

    if (validGenerations.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No generations available</p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {validGenerations.map((generation) => (
          <Card 
            key={generation.id} 
            className="overflow-hidden group hover:shadow-xl hover:shadow-pink-500/20 transition-all"
          >
            <div className="aspect-square relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
              <img
                src={generation.imageUrl}
                alt={generation.prompt}
                className="w-full h-full object-cover"
                onError={() => {
                  // Instead of DOM manipulation, use state to hide invalid images
                  setRecentGenerations(prev => 
                    prev.filter(gen => gen.id !== generation.id)
                  );
                }}
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
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 max-w-2xl"
              >
                {/* Status Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-black/5 rounded-full px-4 py-2 text-sm mb-8 
                    hover:bg-black/10 transition-colors cursor-pointer group"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                    Powered by $COM tokens
                  </span>
                </motion.div>

                {/* Main Title */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-6xl md:text-7xl font-bold text-black leading-[1.1] tracking-tight mb-6"
                >
                  Generate
                  <br />
                  <span className="inline-block relative">
                    Memes with AI
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1, duration: 0.8 }}
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg"
                >
                  Create unique, high-quality memes using advanced AI models. Fast, simple, and powered by $COM.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button 
                    className="bg-black text-white hover:bg-gray-900 px-8 py-6 text-lg rounded-xl
                      shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Creating
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>

                  <a
                    href="https://raydium.io/swap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-6 text-lg rounded-xl
                      border-2 border-black/10 hover:border-black/20 text-gray-600 hover:text-gray-900
                      hover:bg-black/5 transition-all duration-300 group"
                  >
                    <Coins className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Get $COM
                  </a>
                </motion.div>

                {/* Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="grid grid-cols-3 gap-8 mt-16"
                >
                  {[
                    { label: 'Active Models', value: '10+' },
                    { label: 'Memes Generated', value: '50k+' },
                    { label: 'Happy Users', value: '1000+' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="relative group cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 
                          bg-clip-text text-transparent mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex-1 relative"
              >
                <div className="relative w-full aspect-square max-w-[560px] mx-auto">
                  {/* Image Effects */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                    rounded-3xl blur-3xl animate-pulse" />
                  <motion.div 
                    animate={{ 
                      rotate: [0, 2, 0], 
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <Image
                      src="https://replicate.delivery/yhqm/lfZAQhbFjVTKZKYn25uLPUdd2PiS1pZhQFyfeTA1PN4owkXnA/R8_sd3.5L_00001_.webp"
                      alt="AI Meme Generation"
                      width={560}
                      height={560}
                      className="object-cover rounded-2xl transform hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent 
                      opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium bg-black/5 px-3 py-1 rounded-full">
                Features
              </span>
              <h2 className="mt-4 text-4xl font-bold text-gray-900">
                Everything You Need
              </h2>
              <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                Create unique memes with advanced AI models
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Multiple Models",
                  description: "Choose from various pre-trained models or create your own custom style",
                  icon: "🎨"
                },
                {
                  title: "Fast Generation",
                  description: "Generate unique memes in seconds with optimized infrastructure",
                  icon: "⚡"
                },
                {
                  title: "Token Powered",
                  description: "Simple pay-per-use system with $COM tokens",
                  icon: "💎"
                }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="relative group p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/[0.02] to-black/[0.01] 
                    rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <section id="generate" className="py-24">
          <div className="container mx-auto px-4">
            <ImageGenerator />
          </div>
        </section>

        {/* Recent Generations */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium bg-black/5 px-3 py-1 rounded-full">
                Gallery
              </span>
              <h2 className="mt-4 text-4xl font-bold text-gray-900">
                Recent Generations
              </h2>
              <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                Check out what others are creating
              </p>
            </div>
            {renderGenerations()}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium bg-black/5 px-3 py-1 rounded-full">
                Process
              </span>
              <h2 className="mt-4 text-4xl font-bold text-gray-900">
                How It Works
              </h2>
              <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                Generate memes in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description: "Connect your Solana wallet and get $COM tokens"
                },
                {
                  step: "02",
                  title: "Choose Model",
                  description: "Select from our collection of AI models"
                },
                {
                  step: "03",
                  title: "Generate",
                  description: "Enter your prompt and create unique memes"
                }
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="text-[120px] font-bold text-black/[0.03] absolute -top-10 -left-6 select-none 
                    group-hover:text-black/[0.05] transition-colors duration-300">
                    {item.step}
                  </div>
                  <div className="relative bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
