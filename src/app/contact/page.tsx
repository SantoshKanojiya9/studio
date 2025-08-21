
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border">
        <div className="container mx-auto">
            <h1 className="text-3xl font-logo font-bold">Edengram</h1>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center bg-card p-8 rounded-lg shadow-lg">
          <p className="text-muted-foreground italic text-lg">
            This project isn't run by a big company. It's just me, typing away at odd hours with coffee and dreams.
          </p>
          
          <Separator className="my-8" />

          <h2 className="text-4xl font-bold text-primary mb-4">Contact Us</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Got questions, suggestions, or just want to say hi? I'd love to hear from you.
          </p>
          
          <div className="space-y-4 text-left inline-block">
            <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <a href="mailto:risein98@gmail.com" className="text-lg hover:underline">risein98@gmail.com</a>
            </div>
            <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <p className="text-lg">India (yes, still coding with chai in hand)</p>
            </div>
          </div>

          <Separator className="my-8" />

          <p className="text-muted-foreground">
            I usually reply within a couple of days unless I'm stuck debugging code or binge-watching anime.
          </p>

        </div>
      </main>
    </div>
  );
}
