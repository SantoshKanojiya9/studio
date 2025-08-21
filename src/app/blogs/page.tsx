
import Image from "next/image";
import { EdengramLogo } from "@/components/edengram-logo";

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
                <p>There was even one night where I thought maybe I cannot run this website for long. Maybe it will die one day. That feeling honestly hurt because I already put so much of my time into it.</p>
                <p>Then I remembered the movie The Social Network. In one scene Mark said to his CFO, adding ads in a social media website is wrong. We don’t want people to quit using this awesome website just because of pop up ads.</p>
                <p>That line stuck in my head for days. I told myself, yes he is right. If I put pop up ads everywhere people will stop using it. Then what is the point of creating a social media platform if people hate using it.</p>
                <p>So finally I made a decision. No ads after signin. Inside Edengram user experience must stay clean and distraction free.</p>
                <p>But still I need consistent revenue otherwise this project will die one day. That is when I got the idea. I will add a Blog section before signin. In that section I can share my journey, updates, tips or even random thoughts. And only there I will place one or two ads. Not too much, just enough to cover hosting and keep the website alive for future.</p>
                <p>Also instead of filling my platform with ads I decided to add a small subscription option. Just like Instagram gives blue tick, on Edengram I will give Gold Tick. And I do not want to make it too expensive like other platforms. I will keep it cheap maybe 99 rupees per month so anyone can afford.</p>
                <p>When I made this decision I felt a little peace inside. Because now I know people inside Edengram will enjoy the platform freely and at the same time the project has some chance to survive long term.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">How I Accidently Acquired a Full Stack Developer Skill</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
              <p>So after sharing my site with everyone something interesting happen. Out of nowhere my very very old school friend called me and said “bro are you free?” But that time I was busy writing my legal pages for feedback (like I already mentioned in my 3rd blog post). So I told him no, I cannot meet now.</p>
              <p>Then again in evening he called me and said “bro just listen to me.” This time I picked. He said he saw my website and he was impressed with it already. He also told me he has an idea and he also want to create a website.</p>
              <p>He did not explain fully but what he said sound big. He said he found a loophole in export business and there is no solution for this internationally. Hearing him talk like that was little shocking to me because I never thought he was into such ideas.</p>
              <p>So after his request I agreed to listen carefully. He gave me time, 10 o’clock. But that night his call never came. Maybe he was just motivated for few hours after seeing my project. Maybe he is not a real business planner yet.</p>
              <p>But still this incident teach me one thing. Without even realising I had acquired a new skill. A full stack developer skill. Something that currently no one in my friend circle has. And honestly this feels powerful because whenever someone talks about website ideas, I know I can actually build it myself.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">Making Edengram Faster Like Instagram</h2>
            <p className="text-center text-muted-foreground -mt-4 mb-6 italic">How I fix speed issue in my social media site</p>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
              <p>After few days of website launch I see a common but very important problem, problem of site loading and page loading speed. It was good but still not good enough to match current social platforms like Instagram, Facebook, Snapchat etc. So I start research how to make social media fast, what things reduce page loading, and I notice some technical error in my website which naturally was reducing speed.</p>
              <p>For example in Edengram you can create emoji models and save it in gallery. So it was showing in gallery, but after completing site I realise there is three places where I am calling same models separately from database — in feed page, in explore page and in gallery page. All with different tables and different functions. This was causing unnecessary waterfall requests.</p>
              <p>So I got a brilliant idia: why not show same gallery thumbnail post in both feed and explore, but filter it differently. In <strong>explore → user + everyone gallery posts. In feed → user + following gallery posts.</strong> This way I reduce database request by a lot.</p>
              <p>And for infinite scroll I use pagination. For not loading whole pages again and again I use catching (I created global cache system). Everything still updates in realtime in background so user doesn’t feel delay.</p>
              <p>After doing all this my website speed improve a lot. Honestly now I feel Edengram can go toe to toe against professional costly websites also.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">Solving Storage Problem in Edengram</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>When I was building Edengram one thing always stuck in my head… storage issue. This is like the biggest boss fight for every founder of social media. Many new sites look good at start but the moment people start uploading reels and big images, boom server cries and website fails. I really did not want to become that meme founder who say “site crashed because users uploaded too many dog photos.”</p>
                <p>So from beginning I decided I will not allow heavy reels or 4k selfies. My site is small but smart. Instead I created interactive emoji models with html and svg. These little models are virtual and very light, they don’t eat my storage like reels. Data also goes directly in database which is cheap. So first monster was killed.</p>
                <p>But wait, another monster came. Profile picture. A social media without dp is like maggi without masala, totally boring. People need dp to find friends and stalk their crush also 😅. So I had to allow profile photo upload. My trick was simple, I use Supabase free storage, compress every image to 20 kb only, and overwrite the old one. If user upload 100 selfies, sorry bro only last one stays 😆. Unless I reach 50k users, I don’t need to panic.</p>
                <p>For text writing I also kept things short. People can only write 30 letters caption in their post, enough to say “good morning” or “mood off today” but not enough to write full sad shayari 😜. When they post story it also show their caption, so interaction is still alive.</p>
                <p>I even added delete profile option. If user delete their account, my cron job become angry and remove everything from storage and database. Clean clean, no dust remain.</p>
                <p>Honestly I feel very happy about this solution. Storage problem is where many startups cry and stop, but I feel I already jump that hurdle. Now I can proudly say Edengram is small, light and fast… and storage won’t eat me alive.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">How I Protect Security and Privacy in Edengram</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>So I already made legal pages of privacy and security, but let’s be honest… just writing them is not enough 😅. If people really want to trust Edengram then I need to actually make sure their password and data is safe, and no chance of random leaks happening.</p>
                <p>First step was <strong>domain and hosting</strong>. Before buying my domain I checked its history because sometimes domains are used for spam before and that’s risky. Luckily this one was clean (only used once in 2013) so I feel safe. For hosting, at first all AI tools and YouTube videos was saying “Vercel is best”. But later I found that free plan of Vercel is not for commercial use. That was almost end of my dream 😅 but then I discover <strong>Netlify</strong>, which is direct competitor and give free commercial hosting. That was like a lifesaver moment. Deploying Next.js there was still big headache, but that story is for another day.</p>
                <p>Next big thing was <strong>database</strong>. Honestly I tried MySQL but I never liked it. Too complex and boring. I needed something modern and developer friendly. After lot of search I found <strong>Supabase</strong>. And wow, it’s perfect. Secure, reputed and easy to use. The best part? It never shows user password even to me, the developer. It just hides the whole column so there is no chance of mistake. That’s the kind of safety I want.</p>
                <p>For user privacy, I also keep it simple. I only ask for <strong>email</strong> for confirmation, nothing else. No extra data, no personal info. So even in worst case, people don’t have to worry much.</p>
                <p>Overall I feel proud. With safe domain, strong hosting and trusted database, Edengram is built on solid base. I know security is never “done” but at least I’m confident users can feel safe while using my platform 🙂.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">How I Made Edengram Interactive & Addictive</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>At first honestly, I had no idea 😂 I just wanted to make a “cool website” and maybe earn billion dollars with it (ambitious, I know). But once I started tackling authentication, storage, design, database problems etc, I realized people will not come if I can’t provide them <strong>real value</strong>.</p>
                <p>So first thing I did was signup system. I made it super simple: just email and password. And I don’t even care what password you put because only email matters for confirmation. One small issue tho, I forgot to build <strong>forgot password</strong> option 😅 so please remember your password until I add that feature.</p>
                <p>Next, I added <strong>Mood page</strong>. In Instagram there is “story,” but in Edengram we have “Mood.” It’s storage friendly because each user can add only one mood. You can set, update, remove, and also see who viewed your mood. Just like Insta, tapping moves to next mood, and after you view, it becomes grey.</p>
                <p>Below moods, you get the <strong>feed</strong>, which shows posts from your gallery and following users. Then comes <strong>Explore</strong>, where you can see gallery posts from everyone + yourself. (Later I will add algorithm like trending posts, but for now it works fine).</p>
                <p>On top, there is <strong>search</strong>, where you can find any registered user by username. Then comes <strong>design page</strong>, where I give 3 free pre-built emoji models. Users can edit them with tools, or create brand new models. Fun part: by tapping 4 times you can switch emoji to happy, sad, angry, and you can even drag face parts with your finger—the face literally follows your touch 😎.</p>
                <p>Of course, I also added <strong>notifications</strong> (which was a big headache to build). But honestly, without notifications, social media is just dead, right?</p>
                <p>Finally, there’s <strong>profile page</strong>, where you can update picture, username, and switch between public/private. Below that, you can see all your saved emoji models (no, they are not your “career on the line” 😂 just kidding). In the side nav, I also added logout and delete account option.</p>
                <p>So yeah, that’s how Edengram became interactive and (hopefully) a little addictive too.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">The Future of Edengram 🚀</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
              <p>So here we are, ten blogs later, and I’m still alive somehow 😂 Building Edengram till this point already felt like climbing Everest with slippers, but honestly it’s just the beginning.</p>
              <p>Let me tell you what’s cooking in my head for the future. First, the famous “forgot password” feature. Right now if you forget your password… well… just don’t forget it 😅 But yeah, I know that’s not fair, so soon you’ll be able to reset it properly with email. No more keeping sticky notes on your monitor.</p>
              <p>Then comes explore. At the moment it just shows posts from everyone plus you, kind of like a giant salad with no dressing. In future I’ll make it smarter with trending moods, most liked emojis, and maybe even “best emoji face from Mars.” Okay maybe not Mars… yet.</p>
              <p>AI is also on my mind. Imagine typing “make me an angry cat emoji” and instantly getting a hilarious angry cat model. That’s the kind of fun I want Edengram to have. Right now you have to drag eyes and mouths yourself but soon AI will help you make weird stuff faster.</p>
              <p>Another idea is voice moods. Why stop at text captions when you can literally say what’s on your mind? Share a short voice clip with your mood and let your friends hear the vibe in your tone. It’s like Instagram story but more alive.</p>
              <p>And yes, I’m also planning gamification. Small challenges like funniest emoji of the week, or maybe badges for most creative moods. These little things make the app more fun without turning it into a boring scoreboard.</p>
              <p>At the end of the day, I’m not trying to copy Instagram. My dream is to make Edengram light, storage friendly, a little silly, and honestly just fun to use. If people smile when using it, then I already win. The rest… we’ll figure out together 🚀</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">Why Connections Matter More Than Code</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
              <p>So now we’re here at blog number 11 and honestly, I feel like we’ve already discussed everything about Edengram — storage, security, interactivity, even future dreams. But here’s the truth: just building a website is not enough. You need people. Without them, your billion-dollar idea is just a billion lines of code sitting alone 😅.</p>
              <p>In my case, I’m lucky because I already have thousands of subscribers on YouTube and followers on Instagram. To be honest, I don’t really have strong connections with my close ones (family/friends sometimes don’t understand what you’re building), but I do have a good connection with my online community. And that’s what really matters. If you want to build something big, your supporters and followers are the real fuel 🚀.</p>
              <p>So how do you build this connection? Here’s my quick guide:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>Create an account 🙂 (obviously). Okay okay, moving forward…</li>
                <li>Pick a niche. Don’t just post random stuff — choose something people actually care about, so you can attract viewers who *really* vibe with your content.</li>
                <li>Give them value. Post regularly, share tips, make them laugh, teach them something — just don’t disappear for months like your lazy cousin.</li>
                <li>Talk to them. Read comments, reply, ask what they want more of. Small interactions create big trust.</li>
                <li>Keep boundaries. Be friendly but don’t overshare your personal life. Followers should get the best version of you, not your messy laundry.</li>
                <li>Create support options. Patreon, help pages, or even just promoting your own project (like I do with Edengram). If people feel you care about them, they’ll want to support you back.</li>
              </ol>
              <p>In the end, it’s simple: if you take care of your community, they’ll take care of you. And trust me, when your website is new and fragile, that support can mean everything.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">Creating a Dynamic Free Website is a Myth (Flashback to My Journey)</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>Let me take you back to 2022. I was 19 years old, armed with a half-broken laptop, some HTML/CSS skills, and the overconfidence of a teenager who thought he could beat the internet at its own game.</p>
                <p>My “genius” plan? Build a website, throw in some Amazon affiliate products, and wait for the money to roll in. I was already imagining myself buying cars, eating pizza every day, maybe even becoming the next Jeff Bezos (minus the bald head).</p>
                <p>But life… had other plans.</p>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">First Website: The Affiliate Dream That Flopped 💸</h3>
                <p>My first website was basically a digital billboard for Amazon products. No backend, no real features, just a bunch of links. I thought: <em>If I build it, they will come</em>. Spoiler alert: they didn’t. Not even my friends clicked.</p>
                <p>Reality check : A website isn’t just HTML, CSS, and dreams.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Second Website: The Anime Fiasco 🎌</h3>
                <p>Undeterred, I decided to make an <strong>anime website</strong>. I imagined thousands of anime fans hanging out on my site, debating Naruto vs. Goku. Instead, I created… well… another static site with no backend.</p>
                <p>It looked pretty, but you couldn’t do anything with it. Imagine watching anime where the subtitles never load. That’s how my site felt. Another failure.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Third Website: Social Media and the Broken Laptop 💔</h3>
                <p>Third time’s the charm, right? This time, I wanted to build a social media platform. I finally learned the word backend and started copying tutorials like my life depended on it. For the first time, things were clicking. I understood a little logic, databases, and how things connected.</p>
                <p>And then… tragedy.</p>
                <p>My laptop broke. Just like that, my hard work, my half-baked social media site, and a piece of my soul disappeared into the void. Honestly, I was devastated. I didn’t just lose files; I lost motivation.</p>
                <p>For almost two years, I didn’t touch code. Instead, I trashed programming on social media with my friends. And to be honest? I don’t regret it. Coding <em>is</em> tough. Sometimes it feels like learning an alien language while blindfolded.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">The Comeback: My First Real Dynamic Website 🚀</h3>
                <p>But here’s the plot twist: I came back. After years of sulking and swearing I was done with coding forever, I finally built something that actually works a <strong>social media website</strong>. And this time, it’s alive and kicking.</p>
                <p>The crazy part? I did it all for free using:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Supabase (free database)</li>
                    <li>Netlify (free hosting)</li>
                    <li>A free subdomain</li>
                    <li><strong>And, most importantly, my raw stubbornness and newly sharpened skills</strong></li>
                </ul>
                <p>I added all the good stuff you expect in a social app:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Signup & login (no more fake “guest access”)</li>
                    <li>Stories (or moods, because we all have them)</li>
                    <li>A search function that actually finds things</li>
                    <li>A feed & explore page (because who doesn’t like endless scrolling?)</li>
                    <li>Notifications, profile pages, and even a design that doesn’t look like it was built in 2005</li>
                </ul>
                <p>This time, I wasn’t just copying code from YouTube tutorials. I was actually <em>building</em> logic, solving problems, and making it my own.</p>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Lessons I Learned (The Hard Way)</h3>
                <p>Here’s the truth: <strong>creating a dynamic free website is a myth</strong> if you think it means easy or instant. Sure, the tools are free, but the real price is your time, patience, and the occasional mental breakdown at 3 AM.</p>
                <p>Failures aren’t wasted time — they’re the tuition fee of experience. My affiliate flop, my anime disaster, and my broken-laptop heartbreak? They all prepared me for the website I have today.</p>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Final Thoughts</h3>
                <p>If you’re starting your journey, don’t be fooled by the myth that you can throw together a free website and get rich overnight. What you <em>can</em> do is start small, fail often, cry a little, laugh at yourself, and keep learning.</p>
                <p>Because one day, you’ll finally build something that works — and trust me, that feeling is worth every failure, every broken laptop, and every late-night coffee.</p>
                <p>And for me? After all these years, I’m just happy my new website isn’t another static page pretending to be dynamic.</p>
            </div>
          </article>

          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">How to Beat America’s Tech Giants and Build Our Own</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>People laugh when I say this, but I believe it with all my heart: anyone can beat America’s tech giants.</p>
                <p>It sounds crazy, right? Like some big dreamer line. But think about it — <strong>NASA sent astronauts to space with just 4KB of RAM.</strong> Four kilobytes! My WhatsApp memes take more memory than that. If they could do it back then, why can’t we, the Gen Z of India, do it now with all the tools we have at our fingertips?</p>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Why We’re Still Dependent</h3>
                <p>Let’s face it: right now, we’re addicted to American platforms. Google for searching, Meta for scrolling, Amazon for shopping. They build, we consume.</p>
                <p>But we’re not short of brains or skills. We’re short of focus. Our youth force is massive, yet most are busy in distractions: endless reels, gaming marathons, or chasing only government jobs. Nothing wrong with entertainment or stability, but it’s heartbreaking when the brightest energy of a nation is drained into just… scrolling.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">My Own Small Example</h3>
                <p>In my last blog, I wrote about how I built a social media website that could handle 50,000 users. No investors, no Silicon Valley lab, no secret funding. Just:</p>
                 <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Free Supabase database</li>
                    <li>Free Netlify hosting</li>
                    <li>A free subdomain</li>
                    <li>And my stubborn raw skills</li>
                </ul>
                <p>If I could do this from my room, then imagine what a group of focused young Indians could build together.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">The Tech Nobody Talks About 🤫</h3>
                <p>Here’s something most people don’t even know: with a Raspberry Pi (a tiny computer the size of a credit card), you can set up <strong>unlimited free chat servers</strong>. It’s not rocket science. A $35 device, some open-source tools, and you can host chat systems that bypass paid services.</p>
                <p>That’s just one example. There are thousands of free, open-source resources out there:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Next.js & Django for scalable web apps</li>
                    <li>Supabase & Firebase free tiers for databases</li>
                    <li>Raspberry Pi clusters for hosting projects cheaply</li>
                    <li>Linux VPS credits that companies literally give away to students</li>
                </ul>
                <p>The point is: the tech is already in our hands. What’s missing is the will to use it.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Beating Giants Isn’t Magic</h3>
                <p>Let’s not romanticize it — building a competitor to Google or Meta won’t happen overnight. But here’s what *can* happen:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Build small but reliable projects.</li>
                    <li>Scale with free/open tools until you prove your model.</li>
                    <li>Collaborate — instead of wasting time debating anime vs. Free Fire, let’s debate databases vs. frameworks.</li>
                    <li>Fail fast, learn fast.</li>
                </ol>
                <p>Remember, even the American giants started in garages, dorm rooms, and with broken laptops. The difference was: they kept going.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">A Hard Truth for Indian Youth ⚡</h3>
                <p>We say we want India to be a superpower, but are we acting like it? Or are we becoming the world’s most distracted youth population?</p>
                 <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>If you have money, build.</li>
                    <li>If you don’t have money but you have skills, still build.</li>
                    <li>If you have neither, learn — because knowledge is free.</li>
                </ul>
                <p>It’s not about being a billionaire tomorrow. It’s about planting the seeds today.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Final Thoughts</h3>
                <p>Beating America’s tech giants isn’t about hating them. It’s about believing we can build our own. I don’t want India’s youth to stay in a mercy state, begging for apps and platforms from outside.</p>
                <p>The tools are free. The knowledge is free. The talent is here.</p>
                <p>All we need is focus. Because the next big tech giant doesn’t have to come from Silicon Valley. It could come from a hostel room in India. Maybe even yours.</p>
            </div>
          </article>
          
          <article className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 text-center">The Role of Money Power in Building a Website</h2>
            <div className="space-y-6 text-muted-foreground text-base sm:text-lg">
                <p>Ok so here is the truth, when you build a website, first thing you need is skills. Like HTML, CSS, backend blah blah. Second thing is connection (friends, people, network). But the 3rd thing, the most ignored but the most painful is… <strong>money power 💸</strong>.</p>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Free Can Take You Only So Far</h3>
                <p>I know because I did it. I built my whole social media website on <strong>free services</strong>. Supabase free database, Netlify free hosting, free subdomain. Even my brain was free 😅.</p>
                <p>And it worked! I scaled it to <strong>50k+ users</strong>. Felt like I was Mark Zuckerberg’s long lost cousin. But then reality slap — free services are like those free trial chocolates… they finish too soon. You can grow to maybe 50k, 1 lakh users max, then boom 💥 limits hit you.</p>
                <p>That’s when you realize money is not evil… money is fuel.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Why Money Matters</h3>
                <p>Websites don’t run on dreams. They run on <strong>servers, bandwidth, storage, and coffee</strong> (ok coffee is for developers but still important).</p>
                <p>Now lucky for us, we live in the <strong>AWS era</strong>. No need to open some shady datacenter in your basement. You just click a button, scale your backend, and AWS takes care of it. It’s cheap compared to old times but still, not free.</p>
                <p>So yeah, money power is what keeps your website running <strong>forever and ever</strong>, instead of dying like my 3rd project when my laptop died 😭.</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Why India Actually Has an Edge</h3>
                <p>Here is my favorite part. India is famous for <strong>jugaad</strong>. We know how to do big things in small budget. Ask any Indian student who survived college on Maggi noodles for 4 years. We literally master cost-cutting from childhood.</p>
                <p>Most Indian youth don’t even have ₹5000 in their bank. So they already know the real value of money. They know how to stretch 1 rupee into 10. Imagine that mindset applied to tech startups — dangerous combo.</p>
                <p>Brains + Jugaad + Little Money = Explosion 💥</p>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">My Own Example</h3>
                <p>I’m a live example (not proud but still). I’ve done projects with zero funding, just stubborn willpower and free tiers. And yeah, earning money in India is tough. Add 18% GST, random taxes, and feels like the govt wants us to be broke forever 😂.</p>
                <p>But here’s the twist: <strong>2025 is full of earning chances.</strong></p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Start a blog → get <strong>AdSense</strong> → slow but steady income.</li>
                    <li>Build an app → add <strong>subscription plans</strong> → boom, money flow.</li>
                    <li>Make free tools → later monetize with ads.</li>
                </ul>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground pt-4 mb-2">Final Thoughts</h3>
                <p>So role of money in website? Simple. Without money you can <strong>start</strong>. With money you can <strong>last</strong>.</p>
                <p>India youth is already talented, already struggling, already dreaming. If we mix our skills + jugaad + money power, we can build not just websites, but <strong>empires</strong>.</p>
                <p>And maybe one day, someone will look at an Indian app and say, “Wow, this one beat the American giants.” And I’ll just laugh and say, “Told you so.” 😎</p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

    