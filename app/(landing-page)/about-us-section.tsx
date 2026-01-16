import React from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AboutUsSection() {
  const features = [
    'Customizable event pages with your branding',
    'Flexible ticket types and pricing tiers',
    'Automated email campaigns and reminders',
    'QR code check-in and attendee management',
    'Real-time sales dashboard and reporting',
    'Integrated marketing tools and social sharing',
    'White-label mobile app for your events',
    '24/7 customer support for you and attendees'
  ]

  return (
    <div id="about-us" className="w-full px-6 md:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
        {/* Left Section - Features and Description */}
        <div className="flex flex-col gap-5">
          {/* Badge */}
          <div className="rounded-full bg-card px-4 py-2 border border-border w-fit">
            <span className="text-foreground text-sm">For Event Organizers</span>
          </div>

          {/* Headline */}
          <h2 className="text-foreground">
            Grow your events with powerful tools
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-base max-w-xl">
            From intimate workshops to large-scale conferences, Portl gives you everything you need to create unforgettable experiences and build lasting communities.
          </p>

          {/* Features List */}
          <ul className="flex flex-col gap-3 mt-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <div className="size-4 rounded-full border-2 border-foreground flex items-center justify-center shrink-0">
                  <Check className="w-2 h-2.5 text-foreground" strokeWidth={4} />
                </div>
                <span className="text-foreground text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button className="h-11 w-fit mt-3 px-6">
            Start Your First Event
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right Section - Dashboard Metrics */}
        <Card className="p-8 rounded-2xl flex flex-col gap-5">
          {/* Total Revenue Card */}
          <Card className="bg-muted rounded-xl p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground text-sm">Total Revenue</span>
                <span className="text-foreground text-sm">+24% this month</span>
              </div>
              <div className="text-3xl font-semibold text-foreground">$47,392</div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '79%' }}></div>
              </div>
            </div>
          </Card>

          {/* Tickets Sold Card */}
          <Card className="bg-muted rounded-xl p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground text-sm">Tickets Sold</span>
                <span className="text-foreground text-sm">1,247 / 1,500</span>
              </div>
              <div className="text-3xl font-semibold text-foreground">83%</div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </Card>

          {/* Bottom Row - Two Smaller Cards */}
          <div className="grid grid-cols-2 gap-5">
            {/* New Followers Card */}
            <Card className="bg-muted rounded-xl p-5">
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-semibold text-foreground">342</div>
                <div className="text-muted-foreground text-sm">New Followers</div>
              </div>
            </Card>

            {/* Avg Rating Card */}
            <Card className="bg-muted rounded-xl p-5">
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-semibold text-foreground">4.8</div>
                <div className="text-muted-foreground text-sm">Avg Rating</div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  )
}

