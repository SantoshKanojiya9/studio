
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
             <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm md:px-6">
                <Button asChild variant="ghost" size="icon" className="md:hidden">
                    <Link href="/">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">About Us</h1>
            </header>
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src="https://placehold.co/128x128.png" alt="Santosh Kanojiya" data-ai-hint="profile picture"/>
                                <AvatarFallback>SK</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-3xl">Santosh Kanojiya</CardTitle>
                        <CardDescription className="text-lg text-primary">Founder, CEO & Lead Developer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center text-muted-foreground">
                        <p>
                            At just 22 years old, Santosh Kanojiya is the visionary entrepreneur from India driving the innovation behind Edengram. With a passion for technology and a keen eye for the future of social interaction, Santosh has single-handedly designed and developed this platform to push the boundaries of digital expression.
                        </p>
                        <p>
                            His mission is to create a space where creativity, technology, and emotion intersect, empowering users to connect in more meaningful and dynamic ways. Edengram is the first step in this ambitious journey, reflecting his dedication, skill, and entrepreneurial spirit.
                        </p>
                        <div className="pt-4">
                            <Button asChild>
                                <Link href="/">Back to Edengram</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
