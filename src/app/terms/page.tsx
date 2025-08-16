
'use client';

import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function TermsPageContent() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm md:px-6">
                <Button asChild variant="ghost" size="icon" className="md:hidden">
                    <Link href="/">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Terms and Conditions</h1>
            </header>
            <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
                <div className="prose prose-invert max-w-none">
                    <h2>Welcome to Edengram!</h2>
                    <p>These terms and conditions outline the rules and regulations for the use of Edengram's Website, located at this domain.</p>
                    <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Edengram if you do not agree to take all of the terms and conditions stated on this page.</p>

                    <h3>Cookies</h3>
                    <p>We employ the use of cookies. By accessing Edengram, you agreed to use cookies in agreement with the Edengram's Privacy Policy.</p>

                    <h3>License</h3>
                    <p>Unless otherwise stated, Edengram and/or its licensors own the intellectual property rights for all material on Edengram. All intellectual property rights are reserved. You may access this from Edengram for your own personal use subjected to restrictions set in these terms and conditions.</p>
                    <p>You must not:</p>
                    <ul>
                        <li>Republish material from Edengram</li>
                        <li>Sell, rent or sub-license material from Edengram</li>
                        <li>Reproduce, duplicate or copy material from Edengram</li>
                        <li>Redistribute content from Edengram</li>
                    </ul>

                    <h3>User Content</h3>
                    <p>Parts of this website offer an opportunity for users to post and exchange opinions and information. Edengram does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Edengram, its agents and/or affiliates.</p>
                    <p>You warrant and represent that:</p>
                    <ul>
                        <li>You are entitled to post the Content on our website and have all necessary licenses and consents to do so;</li>
                        <li>The Content does not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
                        <li>The Content does not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy.</li>
                    </ul>

                    <h3>Disclaimer</h3>
                    <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
                    <ul>
                        <li>limit or exclude our or your liability for death or personal injury;</li>
                        <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                        <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                        <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                    </ul>
                    <div className="pt-8">
                        <Button asChild>
                            <Link href="/">Back to Edengram</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function TermsPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <TermsPageContent />
        </Suspense>
    );
}
