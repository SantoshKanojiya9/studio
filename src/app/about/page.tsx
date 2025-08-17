
import { EdengramLogo } from "@/components/edengram-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border">
        <div className="container mx-auto flex items-center gap-4">
            <EdengramLogo className="h-10 w-10" />
            <h1 className="text-3xl font-logo font-bold">Edengram</h1>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-primary">About Us</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The story behind the creativity.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-16 bg-card p-8 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
                <Avatar className="h-40 w-40 border-4 border-primary">
                    <Image src="https://placehold.co/300x300.png" alt="Santosh Kanojiya" data-ai-hint="portrait man" width={160} height={160} />
                    <AvatarFallback>SK</AvatarFallback>
                </Avatar>
            </div>
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold">Santosh Kanojiya</h3>
                <p className="text-primary font-semibold">Founder, CEO & Developer</p>
                <p className="mt-4 text-muted-foreground">
                    Santosh is the visionary mind behind Edengram. A workaholic entrepreneur with a passion for technology and creative expression, he single-handedly built this application from the ground up at the age of 22. His dedication and drive are the foundation of our mission to empower creativity for everyone.
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}
