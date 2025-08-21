
import { EdengramLogo } from "@/components/edengram-logo";
import Image from "next/image";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border">
        <div className="container mx-auto flex items-center gap-4">
            <EdengramLogo className="h-10 w-10" />
            <h1 className="text-3xl font-logo font-bold">Edengram</h1>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-primary mb-8 text-center">Our Blog</h2>
          <div className="space-y-12">
            
            <article className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-2">The Future of Digital Expression</h3>
                <p className="text-sm text-muted-foreground mb-4">Posted on August 17, 2025</p>
                <Image src="https://placehold.co/800x400.png" alt="Abstract digital art" data-ai-hint="digital art" width={800} height={400} className="rounded-md mb-4" />
                <p className="text-muted-foreground">
                    Discover how Edengram is pushing the boundaries of creativity and personal expression in the digital age. Our unique emoji creator is just the beginning. We're building a platform where your imagination is the only limit...
                </p>
            </article>

            <article className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-2">Behind the Code: Building Edengram</h3>
                 <p className="text-sm text-muted-foreground mb-4">Posted on August 10, 2025</p>
                <Image src="https://placehold.co/800x400.png" alt="Code on a screen" data-ai-hint="code screen" width={800} height={400} className="rounded-md mb-4" />
                <p className="text-muted-foreground">
                    A deep dive into the technology that powers our platform. From the generative models to the real-time interactions, learn about the challenges and triumphs of creating a next-generation social application...
                </p>
            </article>

          </div>
        </div>
      </main>
    </div>
  );
}
