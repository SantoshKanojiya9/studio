
import Image from "next/image";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 border-b border-border">
        <div className="container mx-auto">
            <h1 className="text-3xl font-logo font-bold">Edengram</h1>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
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
          
          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">What Happened After I Shared Edengram With My Friends</h2>
            
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>After I completed my project Edengram (Social Media Website) the first thing in my mind was simple – I should share it. I spent so many nights coding, fixing bugs, making design better, so I was very excited to show it to people.</p>
                <p>I started with my close circle. I sent the website link to my friends on Facebook, Instagram, WhatsApp. I thought maybe they will be impressed or at least curious. Honestly, I expected a lot.</p>
                <p>I even shared it on my professional accounts, where I already have 95k subscribers on YouTube and 50k followers on Instagram. In my head I was like, “Okay this time it will blow up, people will come and try it out.”</p>
                <p>But reality was a bit different. From my friends I didn’t get much great response. Some just ignored it, some said one word like “nice” but didn’t really check it. That hurt me a little, because when you put your effort into something, you expect your circle to support you.</p>
                <p>Surprisingly, the strangers were the ones who showed more interest. People I didn’t even know asked questions, tried to sign up, gave me feedback. That made me realize something important: support doesn’t always come from people you know, sometimes it comes from outside.</p>
                <p>Yes, it was a bit disappointing in start, but also a lesson. Friends may not see your work as serious, but strangers look at it with fresh eyes. And if your work has value, they will connect.</p>
                <p>So, after sharing Edengram, I didn’t get the big bang response I imagined, but I got something better – the truth. That if I want this project to grow, I should not depend only on friends or family, I should focus on real audience outside my circle.</p>
                <p>This experience gave me more motivation. Because if even strangers care, then maybe Edengram has a future.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">My Nervous Day of Sharing Edengram</h2>
            
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>When the day finally came to share Edengram (my social media website) with everyone, honestly I was nervous. Thousand of questions running in my head like, “What if it’s not good enough? What if there is some bug left? What if people don’t like it?”</p>
                <p>Still I told myself if I don’t share, I will never know. So on that same day, I also created the legal pages – Privacy Policy, Terms etc. And just below them I add one simple line: “For any issues contact me at risein98@gmail.com”. So at least I know if people like my website or not.</p>
                <p>I even ask my best friend to signup first. He said he will do it later… and then he forgot 😅. For a moment I feel bad, but then I told myself no problem, maybe he will try it another day.</p>
                <p>Some of my subscribers and followers from my professional acc did signup. They didn’t send me feedback on email like I was expecting, but instead they message me directly on my social media accounts. They told about small issues, or what they like, and honestly it feel good. Because even if not many people, atleast someone try it and share their thoughts.</p>
                <p>That nervous day teach me that it’s okay to feel unsure, but once you put your work out, people will respond in their own way. And even if the start is small, it’s still a start.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">My Thoughts on Monetizing Edengram</h2>
            
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>After I created Edengram another problem started running in my mind. How do I keep this alive in future? Hosting, domain, database, all this cost money every month. At first I tried to ignore it but deep inside I was getting frustrated.</p>
                <p>There was even one night where I thought maybe I cannot run this website for long. Maybe it will die without money. That feeling honestly hurt because I already put so much of my time into it.</p>
                <p>Then I remembered the movie The Social Network. In one scene Mark said to his CFO, adding ads in a social media website is wrong. We don’t want people to quit using this awesome website just because of pop up ads.</p>
                <p>That line stuck in my head for days. I told myself, yes he is right. If I put pop up ads everywhere people will stop using it. Then what is the point of creating a social media platform if people hate using it.</p>
                <p>So finally I made a decision. No ads after signin. Inside Edengram user experience must stay clean and distraction free.</p>
                <p>But still I need consistent revenue otherwise this project will die one day. That is when I got the idea. I will add a Blog section before signin. In that section I can share my journey, updates, tips or even random thoughts. And only there I will place one or two ads. Not too much, just enough to cover hosting and keep the website alive for future.</p>
                <p>Also instead of filling my platform with ads I decided to add a small subscription option. Just like Instagram gives blue tick, on Edengram I will give Gold Tick. And I do not want to make it too expensive like other platforms. I will keep it cheap maybe 99 rupees per month so anyone can afford.</p>
                <p>When I made this decision I felt a little peace inside. Because now I know people inside Edengram will enjoy the platform freely and at the same time the project has some chance to survive long term.</p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
