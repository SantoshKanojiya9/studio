
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PlanPage() {
  const { setPlan } = usePlan();
  const router = useRouter();

  const handleChoosePlan = (plan: 'Silver' | 'Gold') => {
    setPlan(plan);
    router.push('/chat');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6 bg-background overflow-auto">
      <header className="my-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-3 text-lg">Simple, transparent pricing. No hidden fees.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Silver Plan */}
        <Card className="border-0 bg-zinc-800/30 text-white flex flex-col backdrop-blur-sm">
           <div className="p-1 rounded-t-lg bg-gradient-to-r from-zinc-400 to-gray-500"></div>
          <CardHeader className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-zinc-200">Silver</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">Free</p>
            <CardDescription className="mt-2 text-md text-zinc-400">Get started with our basic features.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-zinc-400 mr-3" />
                <span>Standard AI model</span>
              </li>
               <li className="flex items-center">
                <Check className="h-5 w-5 text-zinc-400 mr-3" />
                <span>Limited daily usage</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-zinc-400 mr-3" />
                <span>Silver Tick verification</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button variant="outline" className="w-full text-lg py-6 border-zinc-400 bg-transparent hover:bg-zinc-700/50 hover:text-white hover:border-zinc-300 transition-colors duration-300" onClick={() => handleChoosePlan('Silver')}>
              Choose Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Gold Plan */}
        <Card className="border-0 bg-amber-900/20 text-white relative flex flex-col backdrop-blur-sm">
           <div className="absolute top-0 right-4 -mt-3">
             <div className="bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 shadow-lg">
                Most Popular
              </div>
           </div>
           <div className="p-1 rounded-t-lg bg-gradient-to-r from-amber-400 to-yellow-500"></div>
          <CardHeader className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-amber-300">Gold</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">
              $5<span className="text-lg font-medium text-muted-foreground">/month</span>
            </p>
            <CardDescription className="mt-2 text-md text-amber-400/90">Unlock all premium features for the best experience.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>4,300+ AI Chats</span>
              </li>
               <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>85+ AI Images</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>Priority Support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-amber-500 mr-3" />
                <span>Gold Tick verification</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-6 mt-auto">
            <Button className="w-full text-lg py-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white shadow-lg" onClick={() => handleChoosePlan('Gold')}>
              Upgrade to Gold
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
