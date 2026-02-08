'use client';

import { useState, useCallback } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  }, [email]);

  if (submitted) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="border border-border bg-card px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for your interest. We&apos;ll be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-background hover:text-foreground transition-colors"
        >
          Join Waitlist
        </button>
      </div>
    </form>
  );
}
