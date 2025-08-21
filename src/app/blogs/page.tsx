
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
          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">My Journey of Creating Edengram</h2>
            
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Introduction</h3>
                <p>Every big thing starts small right. For me, it started with just one thought in my head – “why social media so complicated now?” I wanted something simple, fun and clean. That’s how the idea of Edengram born.</p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">The Inspiration</h3>
                <p>I was scrolling normal apps everyday and it hit me, most of them filled with ads, confusing features, and honestly it didn’t felt personal anymore. I thought, why not I try to build my own. Not for fame, not for money (atleast in beginning 😅), but just to see if I can.</p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Learning and Building</h3>
                <p>Truth is I wasn’t some pro developer. I barely knew few things about coding. Still I jumped. I started learning Next.js, watching tutorials, reading random docs. Some days nothing worked – login failed, database broke, design looked like kids toy 😂. But step by step, I learned.</p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Challenges I Faced</h3>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong>Design:</strong> I wanted Edengram to look cool but my design skills was zero. So I just kept trying until one day it felt “okay this looks fine.”</li>
                    <li><strong>Database:</strong> Handling users and making sure data safe was hard. I had no clue in start but Google was my best friend.</li>
                    <li><strong>Performance:</strong> I wanted it fast. But honestly I didn’t even knew how at first. I learned while failing again and again.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">The Breakthrough</h3>
                <p>The day when my login actually worked… bro, I was dancing 😂. That small success gave me so much push. Then slowly profile page, posts, everything started coming together. It was not perfect but it was real.</p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">What Edengram Means to Me</h3>
                <p>For me Edengram is not “just another website.” It’s my patience, my late nights, my small wins. It shows me that even if you don’t know much, if you keep going you will make something.</p>
                <p className="mt-2">It’s still small, maybe only few people use it, but for me it’s already a big achievement.</p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Final Thoughts</h3>
                <p>I'm a great fan of anime and I just keep working hard on this website just like anime character like Naruto and asta work to achive their goals and If you reading this and you also have one idea, don’t wait for “perfect time.” Just start with whatever you know. You will fail, you will get errors, but you will also learn. That’s exactly how Edengram happen.</p>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
