import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';

import Layout from '@/components/layout';

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Download, ArrowLeft } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';

import Image from 'next/image';



// Make sure to name your component

function ViewGeneration() {

  const router = useRouter();

  const { id } = router.query;

  const [generation, setGeneration] = useState(null);

  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {

    if (id) {

      fetchGeneration();

    }

  }, [id]);



  const fetchGeneration = async () => {

    try {

      const response = await fetch(`/api/generations/${id}`);

      const data = await response.json();

      setGeneration(data.generation);

    } catch (error) {

      console.error('Failed to fetch generation:', error);

    } finally {

      setIsLoading(false);

    }

  };



  const handleDownload = async () => {

    try {

      const response = await fetch(`/api/proxy-image/${id}`);

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = `${generation.prompt.slice(0, 30)}-${id}.png`;

      document.body.appendChild(a);

      a.click();

      window.URL.revokeObjectURL(url);

      document.body.removeChild(a);

    } catch (error) {

      console.error('Failed to download image:', error);

    }

  };



  if (isLoading) {

    return <Layout>Loading...</Layout>;

  }



  if (!generation) {

    return <Layout>Image not found</Layout>;

  }



  return (

    <Layout>

      <div className="container mx-auto p-8">

        <Button

          variant="ghost"

          onClick={() => router.back()}

          className="mb-8"

        >

          <ArrowLeft className="h-4 w-4 mr-2" />

          Back to Gallery

        </Button>



        <Card>

          <CardContent className="p-6">

            <div className="max-w-4xl mx-auto">

              <div className="relative w-full aspect-square">

                <Image

                  src={`/api/proxy-image/${generation.id}`}

                  alt={generation.prompt}

                  fill

                  className="object-contain rounded-lg"

                  unoptimized

                />

              </div>

              <div className="mt-4 space-y-4">

                <h1 className="text-xl font-semibold">{generation.prompt}</h1>

                <div className="flex justify-between items-center">

                  <p className="text-sm text-muted-foreground">

                    Generated {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}

                  </p>

                  <Button

                    onClick={handleDownload}

                  >

                    <Download className="h-4 w-4 mr-2" />

                    Download PNG

                  </Button>

                </div>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </Layout>

  );

}



// Add the default export

export default ViewGeneration;



// Remove getServerSideProps and use getStaticProps instead

export async function getStaticProps() {

  return {

    props: {},

    // This ensures the page is generated at runtime

    revalidate: 1

  };

}



export async function getStaticPaths() {

  return {

    paths: [],

    fallback: 'blocking'

  };

}


