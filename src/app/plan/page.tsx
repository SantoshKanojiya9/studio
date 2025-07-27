
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
        <Card className="border-2 border-border/60 bg-secondary/30 shadow-lg flex flex-col">
          <CardHeader className="p-6">
            <h3 className="text-2xl font-semibold text-muted-foreground">Silver</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">Free</p>
            <CardDescription className="mt-2 text-md">Get started with our basic features.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="space-y-4">
              {/* Features will be added here in the future */}
            </div>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button variant="outline" className="w-full text-lg py-6">
              Choose Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Gold Plan */}
        <Card className="border-2 border-primary/80 bg-background shadow-2xl relative flex flex-col">
           <div className="absolute top-0 right-4 -mt-3">
             <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1">
                Most Popular
              </div>
           </div>
          <CardHeader className="p-6">
            <h3 className="text-2xl font-semibold text-primary">Gold</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">
              $9.99<span className="text-lg font-medium text-muted-foreground">/mo</span>
            </p>
            <CardDescription className="mt-2 text-md">Unlock all premium features for the best experience.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-3" />
                <span>Advanced AI Models</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-3" />
                <span>Priority Support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
              Upgrade to Gold
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
