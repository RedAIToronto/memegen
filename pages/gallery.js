import { useState, useEffect, useCallback } from 'react';

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Download, ExternalLink, Loader2, ZoomIn, ZoomOut, Search, Filter } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { formatDistanceToNow } from 'date-fns';

import Layout from '@/components/layout';

import Link from 'next/link';

import { Input } from "@/components/ui/input";



export default function Gallery() {

  const [generations, setGenerations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [zoomLevel, setZoomLevel] = useState(1);

  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedModel, setSelectedModel] = useState('all');



  useEffect(() => {

    fetchGenerations();

  }, []);



  const fetchGenerations = async () => {

    try {

      setIsLoading(true);

      setError(null);

      const response = await fetch('/api/generations');

      

      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);

      }

      

      const data = await response.json();

      if (data.success && Array.isArray(data.generations)) {

        setGenerations(data.generations);

      } else {

        throw new Error('Invalid response format');

      }

    } catch (error) {

      console.error('Failed to fetch generations:', error);

      setError('Failed to load generations. Please try again later.');

    } finally {

      setIsLoading(false);

    }

  };



  const handleZoom = useCallback((delta) => {

    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));

  }, []);



  const handleDownload = async (id, prompt) => {

    try {

      const response = await fetch(`/api/proxy-image/${id}`);

      if (!response.ok) throw new Error('Failed to download image');

      

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `${prompt.slice(0, 30)}-${id}.png`;

      a.style.display = 'none';

      a.click();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error('Failed to download image:', error);

    }

  };



  const filteredGenerations = generations.filter(gen => {

    const matchesSearch = gen.prompt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModel = selectedModel === 'all' || gen.model === selectedModel;

    return matchesSearch && matchesModel;

  });



  const models = ['all', ...new Set(generations.map(gen => gen.model))];



  if (isLoading) {

    return (

      <Layout>

        <div className="container mx-auto p-8">

          <div className="flex items-center justify-center min-h-[400px]">

            <div className="flex flex-col items-center gap-4">

              <Loader2 className="h-8 w-8 animate-spin text-black" />

              <p className="text-gray-600">Loading gallery...</p>

            </div>

          </div>

        </div>

      </Layout>

    );

  }



  return (

    <Layout>

      <div className="container mx-auto px-4 py-8">

        {/* Header Section */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900 mb-2">

            Generation Gallery

          </h1>

          <p className="text-gray-600">

            Browse and download AI-generated memes

          </p>

        </div>



        {/* Controls Section */}

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search and Filter */}

          <div className="flex-1 w-full md:w-auto flex gap-4">

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input

                placeholder="Search generations..."

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

                className="pl-10 w-full"

              />

            </div>

            <select

              value={selectedModel}

              onChange={(e) => setSelectedModel(e.target.value)}

              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"

            >

              {models.map(model => (

                <option key={model} value={model}>

                  {model.charAt(0).toUpperCase() + model.slice(1)}

                </option>

              ))}

            </select>

          </div>



          {/* Zoom Controls */}

          <div className="flex items-center gap-2">

            <Button

              variant="outline"

              onClick={() => handleZoom(-0.25)}

              disabled={zoomLevel <= 0.5}

              className="text-gray-700"

            >

              <ZoomOut className="h-4 w-4" />

            </Button>

            <Button

              variant="outline"

              onClick={() => handleZoom(0.25)}

              disabled={zoomLevel >= 3}

              className="text-gray-700"

            >

              <ZoomIn className="h-4 w-4" />

            </Button>

          </div>

        </div>



        {/* Gallery Grid */}

        <AnimatePresence>

          <motion.div 

            className="grid gap-6"

            style={{

              gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(280, 280 * zoomLevel)}px, 1fr))`

            }}

          >

            {filteredGenerations.map((gen) => (

              <ImageCard 

                key={gen.id} 

                generation={gen} 

                onDownload={handleDownload}

              />

            ))}

          </motion.div>

        </AnimatePresence>



        {/* Empty State */}

        {filteredGenerations.length === 0 && (

          <div className="text-center py-12">

            <p className="text-gray-600 mb-4">No generations found</p>

            <Link href="/">

              <Button className="bg-black hover:bg-gray-900 text-white">

                Create Your First Meme

              </Button>

            </Link>

          </div>

        )}

      </div>

    </Layout>

  );

}



function ImageCard({ generation, onDownload }) {

  const [isValid, setIsValid] = useState(true);

  const [isHovered, setIsHovered] = useState(false);



  useEffect(() => {

    return () => {

      setIsValid(true);

      setIsHovered(false);

    };

  }, []);



  if (!isValid) return null;



  const handleDownloadClick = async (e) => {

    e.preventDefault();

    try {

      await onDownload(generation.id, generation.prompt);

    } catch (error) {

      console.error('Download failed:', error);

    }

  };



  return (

    <motion.div

      layoutId={`image-${generation.id}`}

      className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group"

      onMouseEnter={() => setIsHovered(true)}

      onMouseLeave={() => setIsHovered(false)}

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      exit={{ opacity: 0, y: 20 }}

    >

      <img

        src={`/api/proxy-image/${generation.id}`}

        alt={generation.prompt}

        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"

        onError={() => setIsValid(false)}

        loading="lazy"

      />

      

      <motion.div 

        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"

        initial={{ opacity: 0 }}

        animate={{ opacity: isHovered ? 1 : 0 }}

        transition={{ duration: 0.2 }}

      >

        <div className="absolute bottom-0 left-0 right-0 p-4">

          <p className="text-white font-medium text-sm line-clamp-2 mb-1">

            {generation.prompt}

          </p>

          <div className="flex items-center justify-between text-xs text-white/70">

            <span>{formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}</span>

            <span className="bg-white/20 px-2 py-1 rounded-full">

              {generation.modelName || generation.model}

            </span>

          </div>

          

          <div className="flex gap-2 mt-3">

            <Button 

              variant="secondary" 

              size="sm"

              onClick={handleDownloadClick}

              className="bg-white/20 hover:bg-white/30 text-white"

            >

              <Download className="h-4 w-4 mr-2" />

              Download

            </Button>

            <Link href={`/view/${generation.id}`} passHref>

              <Button

                variant="secondary"

                size="sm"

                className="bg-white/20 hover:bg-white/30 text-white"

              >

                <ExternalLink className="h-4 w-4" />

              </Button>

            </Link>

          </div>

        </div>

      </motion.div>

    </motion.div>

  );

}
































