import { useState, useEffect, useCallback } from 'react';

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Download, ExternalLink, Loader2, ZoomIn, ZoomOut } from "lucide-react";

import { motion } from "framer-motion";

import { formatDistanceToNow } from 'date-fns';

import Layout from '@/components/layout';

import Link from 'next/link';



export default function Gallery() {

  const [generations, setGenerations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [zoomLevel, setZoomLevel] = useState(1);

  const [error, setError] = useState(null);



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

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error('Failed to download image:', error);

    }

  };



  if (isLoading) {

    return (

      <Layout>

        <div className="container mx-auto p-8">

          <h1 className="text-3xl font-bold mb-8">Generation Gallery</h1>

          <div className="flex items-center justify-center min-h-[400px]">

            <div className="flex flex-col items-center gap-4">

              <Loader2 className="h-8 w-8 animate-spin text-aidobe-pink" />

              <p className="text-muted-foreground">Loading generations...</p>

            </div>

          </div>

        </div>

      </Layout>

    );

  }



  if (error) {

    return (

      <Layout>

        <div className="container mx-auto p-8">

          <h1 className="text-3xl font-bold mb-8">Generation Gallery</h1>

          <Card>

            <CardContent className="flex flex-col items-center justify-center py-12">

              <p className="text-lg text-red-500 mb-4">{error}</p>

              <Button onClick={fetchGenerations}>

                Try Again

              </Button>

            </CardContent>

          </Card>

        </div>

      </Layout>

    );

  }



  if (generations.length === 0) {

    return (

      <Layout>

        <div className="container mx-auto p-8">

          <h1 className="text-3xl font-bold mb-8">Generation Gallery</h1>

          <Card>

            <CardContent className="flex flex-col items-center justify-center py-12">

              <p className="text-lg text-muted-foreground mb-4">No generations found</p>

              <Link href="/">

                <Button>

                  Generate Your First Image

                </Button>

              </Link>

            </CardContent>

          </Card>

        </div>

      </Layout>

    );

  }



  return (

    <Layout>

      <div className="container mx-auto p-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-aidobe-pink to-aidobe-secondary text-transparent bg-clip-text">

              Generation Gallery

            </h1>

            <p className="text-muted-foreground mt-2">

              {generations.length} generation{generations.length !== 1 ? 's' : ''} created

            </p>

          </div>

          <div className="flex items-center gap-2">

            <Button

              variant="outline"

              onClick={() => handleZoom(-0.25)}

              disabled={zoomLevel <= 0.5}

              className="text-aidobe-pink hover:text-aidobe-secondary"

            >

              <ZoomOut className="h-4 w-4" />

            </Button>

            <Button

              variant="outline"

              onClick={() => handleZoom(0.25)}

              disabled={zoomLevel >= 3}

              className="text-aidobe-pink hover:text-aidobe-secondary"

            >

              <ZoomIn className="h-4 w-4" />

            </Button>

          </div>

        </div>



        {/* Grid of generations */}

        <motion.div 

          className="grid gap-4"

          style={{

            gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(280, 280 * zoomLevel)}px, 1fr))`

          }}

        >

          {generations.map((gen) => (

            <ImageCard key={gen.id} generation={gen} zoomLevel={zoomLevel} />

          ))}

        </motion.div>

      </div>

    </Layout>

  );

}



function ImageCard({ generation, zoomLevel }) {

  const [isValid, setIsValid] = useState(true);



  if (!isValid) return null;



  return (

    <motion.div

      layoutId={`image-${generation.id}`}

      className="relative aspect-square bg-black/5 rounded-lg overflow-hidden group hover:shadow-aidobe transition-shadow duration-300"

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

            onClick={() => handleDownload(generation.id, generation.prompt)}

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

  );

}


