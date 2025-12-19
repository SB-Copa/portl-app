import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <div className="w-full bg-black py-20 flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto px-16">
                <div className="bg-zinc-900 rounded-2xl px-16 py-20 flex flex-col items-center gap-6">
                    {/* Badge */}
                    <div className="rounded-full bg-zinc-900 px-6 py-2.5 border border-zinc-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                        <span className="text-white text-lg">Join thousands of creators today</span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-base text-white text-center leading-tight max-w-4xl">
                        Ready to create your next unforgettable event?
                    </h2>

                    {/* Subtitle */}
                    <p className="text-gray-400 text-xl md:text-2xl font-light text-center max-w-3xl">
                        Start for free. No credit card required. Create your first event in under 5 minutes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4 mt-4">
                        <button className="bg-white text-black hover:bg-gray-200 rounded-lg px-8 py-4 text-base font-medium flex items-center justify-center gap-2 transition-colors">
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="bg-transparent text-white hover:bg-zinc-800 rounded-lg px-8 py-4 text-base font-medium border border-white transition-colors">
                            Schedule a Demo
                        </button>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-gray-500 text-sm mt-2">
                        Free forever for events under 100 attendees
                    </p>
                </div>
            </div>
        </div>
    )
}

