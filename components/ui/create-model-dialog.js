import { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';

import { Button } from './button';

import { Input } from './input';

import { Label } from './label';

import { Upload, Loader2 } from 'lucide-react';

import { useToast } from "@/hooks/use-toast";

import { UploadDropzone } from "@/utils/uploadthing";



export function CreateModelDialog({ open, onOpenChange }) {

  const [modelName, setModelName] = useState('');

  const [previewImage, setPreviewImage] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  const { toast } = useToast();



  const handleCreate = async () => {

    if (!modelName || !previewImage || !uploadedFileUrl) {

      toast({

        variant: "destructive",

        title: "Error",

        description: "Please fill in all fields and upload training images",

      });

      return;

    }



    setIsUploading(true);

    try {

      const response = await fetch('/api/create-model', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          name: modelName,

          previewImage,

          trainingData: uploadedFileUrl,

        }),

      });



      if (!response.ok) {

        throw new Error('Failed to create model');

      }



      toast({

        title: "Success",

        description: "Model creation started! Check the queue for status.",

      });

      onOpenChange(false);

    } catch (error) {

      toast({

        variant: "destructive",

        title: "Error",

        description: error.message || "Failed to create model",

      });

    } finally {

      setIsUploading(false);

    }

  };



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/90">

        <DialogHeader>

          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">

            Create New Model

          </DialogTitle>

          <DialogDescription className="text-muted-foreground">

            Create your own AI model with 12-24+ training images

          </DialogDescription>

        </DialogHeader>



        <div className="grid gap-4 py-4">

          <div className="space-y-2">

            <Label htmlFor="modelName" className="text-sm font-medium">

              Model Name

            </Label>

            <Input

              id="modelName"

              placeholder="Enter model name..."

              value={modelName}

              onChange={(e) => setModelName(e.target.value)}

              className="border-pink-500/20 focus:border-purple-500 focus:ring-purple-500/20"

            />

          </div>



          <div className="space-y-2">

            <Label htmlFor="previewImage" className="text-sm font-medium">

              Preview Image URL

            </Label>

            <Input

              id="previewImage"

              placeholder="Enter preview image URL..."

              value={previewImage}

              onChange={(e) => setPreviewImage(e.target.value)}

              className="border-pink-500/20 focus:border-purple-500 focus:ring-purple-500/20"

            />

          </div>



          <div className="space-y-2">

            <Label className="text-sm font-medium">

              Training Images

            </Label>

            <UploadDropzone

              endpoint="modelTraining"

              onClientUploadComplete={(res) => {

                if (res?.[0]?.url) {

                  setUploadedFileUrl(res[0].url);

                  toast({

                    title: "Upload Complete",

                    description: "Training images uploaded successfully!",

                  });

                }

              }}

              onUploadError={(error) => {

                toast({

                  variant: "destructive",

                  title: "Upload Error",

                  description: error.message || "Failed to upload training images",

                });

              }}

              config={{

                mode: "auto",

              }}

              className="border-2 border-dashed border-pink-500/20 rounded-lg ut-uploading:border-purple-500/20 

                ut-button:bg-gradient-to-r ut-button:from-pink-500 ut-button:to-purple-500

                ut-button:hover:from-pink-600 ut-button:hover:to-purple-600"

            />

          </div>

        </div>



        <Button

          onClick={handleCreate}

          disabled={isUploading || !uploadedFileUrl}

          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 

            transition-all duration-300 transform hover:scale-[1.02]"

        >

          {isUploading ? (

            <>

              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Creating...

            </>

          ) : (

            'Create Model (4.2M $AIDOBE)'

          )}

        </Button>

      </DialogContent>

    </Dialog>

  );

}


