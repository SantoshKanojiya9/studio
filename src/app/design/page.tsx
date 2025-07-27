
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Type, Smile, Images } from 'lucide-react';

const tools = [
  {
    title: 'Color Palette Generator',
    description: 'Create beautiful color schemes for your projects.',
    icon: Palette,
  },
  {
    title: 'Font Finder',
    description: 'Discover the perfect font for your brand.',
    icon: Type,
  },
  {
    title: 'Icon Library',
    description: 'Access a vast library of free-to-use icons.',
    icon: Smile,
  },
  {
    title: 'Mockup Creator',
    description: 'Generate stunning mockups for your designs.',
    icon: Images,
  },
];

export default function DesignPage() {
  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Graphic Design Tools</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          A collection of free tools to help with your creative projects.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="hover:bg-secondary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{tool.title}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
