
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6 bg-background">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-3 text-lg">Simple, transparent pricing. No hidden fees.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Silver Plan */}
        <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 shadow-lg flex flex-col">
          <CardHeader className="p-6">
            <h3 className="text-2xl font-semibold text-zinc-300">Silver</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">Free</p>
            <CardDescription className="mt-2 text-md text-zinc-400">Get started with our basic features.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="space-y-4">
              {/* Features will be added here in the future */}
            </div>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button variant="outline" className="w-full text-lg py-6 border-zinc-500 hover:bg-zinc-700 hover:border-zinc-400">
              Choose Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Gold Plan */}
        <Card className="bg-gradient-to-br from-amber-900/40 to-background border-2 border-amber-600/80 shadow-2xl relative flex flex-col">
           <div className="absolute top-0 right-4 -mt-3">
             <div className="bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1">
                Most Popular
              </div>
           </div>
          <CardHeader className="p-6">
            <h3 className="text-2xl font-semibold text-amber-400">Gold</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">
              $9.99<span className="text-lg font-medium text-muted-foreground">/mo</span>
            </p>
            <CardDescription className="mt-2 text-md text-amber-500/90">Unlock all premium features for the best experience.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>Advanced AI Models</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>Priority Support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button className="w-full text-lg py-6 bg-amber-600 hover:bg-amber-600/90 text-white">
              Upgrade to Gold
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
