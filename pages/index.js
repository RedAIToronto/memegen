import { ImageGenerator } from "@/components/ui/image-generator"
import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [recentGenerations, setRecentGenerations] = useState([]);

  useEffect(() => {
    const fetchRecentGenerations = async () => {
      try {
        const response = await fetch('/api/generations?limit=3');
        const data = await response.json();
        if (data.generations) {
          setRecentGenerations(data.generations);
        }
      } catch (error) {
        console.error('Failed to fetch recent generations:', error);
      }
    };

    fetchRecentGenerations();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Generate AI Art with MEMEGEN
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create unique AI-generated artwork using MEW and FWOG models
            </p>
          </div>
          
          <div className="mt-8">
            <ImageGenerator />
          </div>

          {recentGenerations.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Recent Community Generations</h2>
                <Link href="/gallery">
                  <Button variant="ghost">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentGenerations.map((gen) => (
                  <Card key={gen.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <img
                          src={`/api/proxy-image/${gen.id}`}
                          alt={gen.prompt}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                          <div>
                            <p className="text-white text-sm line-clamp-3">{gen.prompt}</p>
                            <p className="text-white/70 text-xs mt-1">
                              Model: {gen.modelName || gen.model}
                            </p>
                          </div>
                          <p className="text-white/70 text-xs">
                            {formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
