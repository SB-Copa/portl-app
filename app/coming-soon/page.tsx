import type { Metadata } from 'next';
import { WaitlistForm } from './waitlist-form';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Portl — Coming Soon',
  description: 'The event platform for organizers. Coming soon.',
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; animation-fill-mode: both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
          {/* Wordmark */}
          <div className="animate-slide-up">
            <Image src="/images/logo/portl-logo-white.svg" alt="Portl Logo" width={100} height={100} className="w-auto h-10" />
          </div>

          {/* Tagline */}
          <div className="animate-slide-up delay-100 mb-16">
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-2xl">
              The event platform that gives organizers their own branded experience
            </p>
          </div>

          {/* Coming Soon Badge */}
          <div className="animate-slide-up delay-200 mb-12">
            <div className="inline-block border border-border px-4 py-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="animate-slide-up delay-200 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl">
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide font-medium">
                  Branded Subdomains
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your own custom domain for a premium brand experience
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide font-medium">
                  Complete Ticketing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tickets, tables, seats — all managed in one platform
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wide font-medium">
                  Real-Time Analytics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track sales, attendance, and performance as it happens
                </p>
              </div>
            </div>
          </div>

          {/* Waitlist Form */}
          {/* <div className="animate-slide-up delay-300 mb-16">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Join the Waitlist
              </p>
            </div>
            <WaitlistForm />
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 animate-slide-up delay-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Portl. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
