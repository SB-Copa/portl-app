import React from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

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
    <div id="about-us" className="w-full px-16 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section - Features and Description */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <div className="rounded-full bg-zinc-900 px-6 py-2.5 border border-zinc-700 w-fit">
            <span className="text-white text-lg">For Event Organizers</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-6xl/14 font-base w-2xl text-white">
            Grow your events with powerful tools
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-2xl/9 w-fit">
            From intimate workshops to large-scale conferences, Portl gives you everything you need to create unforgettable experiences and build lasting communities.
          </p>

          {/* Features List */}
          <ul className="flex flex-col gap-7 mt-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-4 text-white font-bold" strokeWidth={5} />
                </div>
                <span className="text-gray-300 text-2xl">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button className="bg-white text-black hover:bg-gray-200 rounded-lg px-6 py-3 text-base font-medium flex items-center justify-center gap-2 transition-colors w-fit mt-4">
            Start Your First Event
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section - Dashboard Metrics */}
        <Card className="px-12 py-10 bg-neutral-800 rounded-[35px] border border-neutral-600 gap-6">
          {/* Total Revenue Card */}
          <Card className="bg-zinc-900 border border-neutral-700 rounded-[20px] py-8 px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="text-gray-400 text-md">Total Revenue</span>
                <span className="text-gray-200 text-md">+24% this month</span>
              </div>
              <div className="text-4xl font-base text-white">$47,392</div>
              <div className="w-full h-2 bg-zinc-800 rounded-[20px]ll overflow-hidden">
                <div className="h-full bg-gray-400 rounded-[20px]ll" style={{ width: '79%' }}></div>
              </div>
            </div>
          </Card>

          {/* Tickets Sold Card */}
          
          <Card className="bg-zinc-900 rounded-[20px] border border-neutral-600 py-8 px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="text-gray-400 text-md">Tickets Sold</span>
                <span className="text-gray-200 text-md">1,247 / 1,500</span>
              </div>
              <div className="text-4xl font-base text-white">83%</div>
              <div className="w-full h-2 bg-zinc-800 rounded-[20px]ll overflow-hidden">
                <div className="h-full bg-gray-400 rounded-[20px]ll" style={{ width: '83%' }}></div>
              </div>
            </div>
          </Card>

          {/* Bottom Row - Two Smaller Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* New Followers Card */}
            <Card className="bg-zinc-900 border border-neutral-600 rounded-[20px] p-6">
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-base text-white">342</div>
                <div className="text-gray-400 text-md">New Followers</div>
              </div>
            </Card>

            {/* Avg Rating Card */}
            <Card className="bg-zinc-900 border border-neutral-600 rounded-[20px] p-6">
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-base text-white">4.8</div>
                <div className="text-gray-400 text-md">Avg Rating</div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  )
}

