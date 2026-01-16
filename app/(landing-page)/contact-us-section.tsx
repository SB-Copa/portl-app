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
        <div id="contact-us" className="w-full px-6 md:px-12 py-16">
            <div className="flex flex-col items-center gap-4 max-w-7xl mx-auto">
                {/* Badge */}
                <div className="rounded-full bg-card px-4 py-2 border border-border w-fit">
                    <span className="text-foreground text-sm">Community first</span>
                </div>

                {/* Headline */}
                <h2 className="text-foreground text-center">
                    More than just ticketing
                </h2>

                {/* Subtitle */}
                <p className="text-muted-foreground text-base text-center max-w-2xl">
                    We're building a platform where connections matter and communities thrive
                </p>

                {/* Contact Method Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-8">
                    {contactMethods.map((method, index) => {
                        const Icon = method.icon
                        return (
                            <Card key={index} className="rounded-xl py-6 flex flex-col items-center text-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center">
                                    <Icon className="h-8 w-8 text-foreground" strokeWidth={2} />
                                </div>
                                <h5 className="text-foreground">{method.title}</h5>
                                <p className="text-muted-foreground text-sm">{method.description}</p>
                            </Card>
                        )
                    })}
                </div>

                {/* Testimonials Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-12">
                    <Card className="bg-muted rounded-xl p-6 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-accent rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h5 className="text-foreground">Sarah Chen</h5>
                            <p className="text-muted-foreground text-sm">Event Organizer</p>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                            "Portl transformed how we run our monthly meetups. The community features keep our attendees engaged long after the event ends."
                        </p>
                    </Card>

                    <Card className="bg-muted rounded-xl p-6 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-secondary rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h5 className="text-foreground">Marcus Rodriguez</h5>
                            <p className="text-muted-foreground text-sm">Festival Attendee</p>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                            "I've discovered so many amazing events through Portl. The personalized recommendations are spot-on every time."
                        </p>
                    </Card>

                    <Card className="bg-muted rounded-xl p-6 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-accent rounded-full"></div>
                        <div className="flex flex-col gap-1">
                            <h5 className="text-foreground">Emily Watson</h5>
                            <p className="text-muted-foreground text-sm">Conference Director</p>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                            "The analytics and attendee management tools are game-changing. We've seen a 40% increase in repeat attendance."
                        </p>
                    </Card>
                </div>
                <CtaSection/>

                
            </div>
        </div>
    )
}