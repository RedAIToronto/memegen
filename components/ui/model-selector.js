import { Card } from "./card"



import { cn } from "@/lib/utils"



import { Check, Sparkles, Coins, Plus } from "lucide-react"



import Image from "next/image"







export function ModelSelector({ models, selectedModel, onSelect }) {



  return (



    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



      {models.map((model) => (



        <Card



          key={model.id}



          onClick={() => onSelect(model)}



          className={cn(



            "relative cursor-pointer transition-all duration-300",



            "bg-white hover:bg-gray-50",



            "overflow-hidden group",



            selectedModel?.id === model.id 



              ? "ring-2 ring-black ring-offset-4" 



              : "hover:ring-1 hover:ring-black/20"



          )}



        >



          {/* Model Preview */}



          <div className="aspect-[5/4] relative overflow-hidden bg-gray-100">



            <Image



              src={model.image}



              alt={model.name}



              fill



              className="object-cover transition-transform duration-500 group-hover:scale-105"



            />



            



            {/* Selection Indicator */}



            {selectedModel?.id === model.id && (



              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">



                <div className="bg-white rounded-full p-2">



                  <Check className="h-4 w-4 text-black" />



                </div>



              </div>



            )}







            {/* Model Type Badge */}



            <div className="absolute top-3 left-3">



              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-black backdrop-blur-sm">



                <Sparkles className="h-3 w-3 mr-1" />



                {model.style || 'Style'}



              </span>



            </div>



          </div>







          {/* Model Info */}



          <div className="p-5">



            <div className="flex items-start justify-between mb-3">



              <div>



                <h3 className="font-semibold text-lg text-gray-900">{model.name}</h3>



                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{model.description}</p>



              </div>



            </div>







            {/* Stats & Cost */}



            <div className="flex items-center justify-between pt-3 border-t">



              <div className="flex items-center text-sm text-gray-500">



                <span className="flex items-center">



                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />



                  {model.samples_count || '20+'} Samples



                </span>



              </div>



              <div className="flex items-center text-sm font-medium text-black">



                <Coins className="h-4 w-4 mr-1" />



                5 $FWOG



              </div>



            </div>



          </div>



        </Card>



      ))}







      {/* Create Custom Model Card */}



      <Card



        className={cn(



          "relative cursor-pointer transition-all duration-300",



          "bg-gray-50 hover:bg-gray-100",



          "overflow-hidden group"



        )}



        onClick={() => onSelect('create')}



      >



        <div className="aspect-[5/4] relative flex items-center justify-center bg-gray-100/50">



          <div className="flex flex-col items-center space-y-3">



            <div className="p-3 rounded-full bg-black/5 group-hover:bg-black/10 transition-colors">



              <Plus className="h-6 w-6 text-gray-600" />



            </div>



            <span className="text-sm font-medium text-gray-600">Create Custom Model</span>



          </div>



        </div>







        <div className="p-5">



          <h3 className="font-semibold text-lg text-gray-900">Train Your Own Model</h3>



          <p className="text-sm text-gray-600 mt-1">Create a custom model with your own style</p>



          



          <div className="flex items-center justify-between pt-3 mt-3 border-t">



            <span className="text-sm text-gray-500">12-24 training images</span>



            <div className="flex items-center text-sm font-medium text-black">



              <Coins className="h-4 w-4 mr-1" />



              5 $FWOG



            </div>



          </div>



        </div>



      </Card>



    </div>



  )



} 


