import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserGuide() {
  const [currentTab, setCurrentTab] = useState('basics');
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-indigo-800 mb-6">Feels User Guide</h1>
      
      <Tabs defaultValue="basics" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="paths">Emotion Paths</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Feels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Feels helps you track your emotions using a scientific model called the Circumplex Model of Affect, which organizes emotions along two dimensions:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-2">Valence (Horizontal Axis)</h3>
                  <p className="text-sm">Represents how positive or negative an emotion feels. Right side is positive, left is negative.</p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-indigo-800 mb-2">Arousal (Vertical Axis)</h3>
                  <p className="text-sm">Represents the energy level or intensity of an emotion. Top is high energy, bottom is low energy.</p>
                </div>
              </div>
              
              {/* More content */}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab contents */}
      </Tabs>
    </div>
  );
}
