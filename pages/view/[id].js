import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ViewImage() {
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
              <img
                src={`/api/proxy-image/${generation.id}`}
                alt={generation.prompt}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 space-y-4">
                <h1 className="text-xl font-semibold">{generation.prompt}</h1>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Generated {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
                  </p>
                  <Button
                    onClick={() => handleDownload(generation.id, generation.prompt)}
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
