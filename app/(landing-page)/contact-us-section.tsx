import React from 'react'
import { Users, MessageSquare, Share2, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import CtaSection from './cta-section';

export default function ContactUsSection() {
    const contactMethods = [
        {
            icon: Users,
            title: 'Connect',
            description: 'Meet like-minded people at every event'
        },
        {
            icon: MessageSquare,
            title: 'Engage',
            description: 'Discussion forums and live chat'
        },
        {
            icon: Share2,
            title: 'Share',
            description: 'Spread the word effortlessly'
        },
        {
            icon: Trophy,
            title: 'Reward',
            description: 'Loyalty programs for regulars'
        }
    ]

    return (
        <div id="contact-us" className="w-full px-16 py-20">
            <div className="flex flex-col items-center gap-4">
                {/* Badge */}
                <div className="rounded-full bg-linear-to-tl from-black to-gray-900 px-6 py-2.5 border border-zinc-700 w-fit">
                    <span className="text-white text-lg">Community first</span>
                </div>

                {/* Headline */}
                <h2 className="text-white text-center">
                    More than just ticketing
                </h2>

                {/* Subtitle */}
                <p className="text-gray-400 text-lg md:text-lg font-base text-center max-w-4xl">
                    We're building a platform where connections matter and communities thrive
                </p>

                {/* Contact Method Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-8">
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon
                        return (
                            <Card key={index} className="bg-neutral-900 border-zinc-700 rounded-2xl py-8 flex flex-col items-center text-center gap-4">
                                <div className="size-10 flex items-center justify-center">
                                    <Icon className="size-10 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-white text-2xl font-base">{method.title}</h3>
                                <p className="text-gray-400 text-lg">{method.description}</p>
                            </Card>
                        )
                    })}
                </div>

                {/* Testimonials Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
                    <Card className="bg-neutral-950 border-zinc-700 rounded-2xl px-10 py-8 flex flex-col gap-4">
                        <div className="size-12 bg-slate-700 rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-white text-2xl font-base">Sarah Chen</h3>
                            <p className="text-gray-400 text-lg">Event Organizer</p>
                        </div>
                        <p className="text-white text-lg mt-2">
                            "Portl transformed how we run our monthly meetups. The community features keep our attendees engaged long after the event ends."
                        </p>
                    </Card>

                    <Card className="bg-neutral-950 border-zinc-700 rounded-2xl px-10 py-8 flex flex-col gap-4">
                        <div className="size-12 bg-gray-400 rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-white text-2xl font-base">Marcus Rodriguez</h3>
                            <p className="text-gray-400 text-lg">Festival Attendee</p>
                        </div>
                        <p className="text-white text-lg mt-2">
                            "I've discovered so many amazing events through Portl. The personalized recommendations are spot-on every time."
                        </p>
                    </Card>

                    <Card className="bg-neutral-950 border-zinc-700 rounded-2xl px-10 py-8 flex flex-col gap-4">
                        <div className="size-12 bg-slate-600 rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-white text-2xl font-base">Emily Watson</h3>
                            <p className="text-gray-400 text-lg">Conference Director</p>
                        </div>
                        <p className="text-white text-lg mt-2">
                            "The analytics and attendee management tools are game-changing. We've seen a 40% increase in repeat attendance."
                        </p>
                    </Card>
                </div>
                <CtaSection/>

                
            </div>
        </div>
    )
}