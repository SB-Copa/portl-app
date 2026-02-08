import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CTASection() {
    return (
        <div className="w-full h-screen bg-black py-20 flex items-center justify-center">
            <div className="w-full mx-12">
                <div className="bg-zinc-900 rounded-2xl px-16 py-38 flex flex-col items-center gap-6">
                    {/* Badge */}
                    <div className="rounded-full bg-neutral-700 px-7 py-2 border border-zinc-700 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                        <span className="text-white text-xl">Join thousands of creators today</span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="font-base text-white text-center">
                        Ready to create your next unforgettable event?
                    </h2>

                    {/* Subtitle */}
                    <p className="text-white text-lg font-base text-center max-w-3xl">
                        Start for free. No credit card required. Create your first event in under 5 minutes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4 mt-4">
                        <Button className="text-black font-base p-8 text-lg">
                            Get Started Free
                            <ArrowRight className="w-5 h-5 mt-0.5" />
                        </Button>
                        <Button variant="outline" className="text-white font-base p-8 text-lg">
                            Schedule a Demo
                        </Button>
                    </div>

                    {/* Bottom Text */}
                    <p className="text-gray-300 text-lg font-base mt-2">
                        Free forever for events under 100 attendees
                    </p>
                </div>
            </div>
        </div>
    )
}

