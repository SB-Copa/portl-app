import React from 'react'
import { Star, Bell, Heart, ArrowRight, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FeaturesSection() {
  const events = [
    {
      category: 'Technology',
      categoryColor: 'bg-slate-700',
      title: 'Tech Innovation Summit 2025',
      date: 'Jan 15, 2025',
      location: 'San Francisco, CA',
      attendees: '2.4K',
      price: '$99'
    },
    {
      category: 'Music',
      categoryColor: 'bg-purple-700',
      title: 'Music Festival: Summer Vibes',
      date: 'Feb 20, 2025',
      location: 'Austin, TX',
      attendees: '8.5K',
      price: '$149'
    },
    {
      category: 'Networking',
      categoryColor: 'bg-green-700',
      title: 'Startup Founder Meetup',
      date: 'Jan 28, 2025',
      location: 'New York, NY',
      attendees: '450',
      price: 'Free'
    }
  ]

  const features = [
    {
      icon: Star,
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions based on your interests and past events'
    },
    {
      icon: Bell,
      title: 'Never Miss Out',
      description: 'Smart notifications for events from your favorite organizers'
    },
    {
      icon: Heart,
      title: 'Build Your Community',
      description: 'Connect with attendees before, during, and after events'
    }
  ]

  return (
    <div id="features" className="w-full px-16 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Section - Event Cards */}
        <div className="flex flex-col gap-4">
          {events.map((event, index) => (
            <Card key={index} className="bg-neutral-900 border-zinc-700 rounded-2xl p-8 relative gap-2">
              {/* Category Tag */}
              <div className={`${event.categoryColor} rounded-full px-4 py-1 w-fit mb-2`}>
                <span className="text-white/60">{event.category}</span>
              </div>

              {/* Heart Icon */}
              <Button variant="outline" className="absolute top-6 right-6 text-white size-8 bg-zinc-800 rounded-full p-4">
                <Heart className="size-5" strokeWidth={2} />
              </Button>

              {/* Event Title */}
              <h3 className="text-white text-xl font-base mb-3">{event.title}</h3>

              {/* Date and Location */}
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <span className="text-md">{event.date}</span>
                <span>•</span>
                <MapPin className="size-4" />
                <span className="text-md">{event.location}</span>
              </div>

              {/* Attendees and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="size-8 bg-white rounded-full border-2 border-zinc-800"></div>
                    <div className="size-8 bg-white rounded-full border-2 border-zinc-800"></div>
                    <div className="size-8 bg-white rounded-full border-2 border-zinc-800"></div>
                  </div>
                  <span className="text-gray-400 text-md">{event.attendees} attending</span>
                </div>
                <div className="text-white font-base text-xl">{event.price}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Section - Features */}
        <div className="flex flex-col gap-7">
          {/* Badge */}
          <div className="rounded-full bg-linear-to-tl from-black to-gray-900 px-6 py-2.5 border mt-4 border-zinc-700 w-fit">
            <span className="text-white text-lg">For Event Attendees</span>
          </div>

          {/* Headline */}
          <h2 className=" font-base text-white">
            Discover experiences that inspire you
          </h2>

          {/* Description */}
          <p className="text-gray-400 font-base text-lg w-5/6">
            Find events tailored to your interests, connect with like-minded people, and create memories that last a lifetime.
          </p>

          {/* Features List */}
          <div className="flex flex-col gap-7 mt-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="size-16 flex items-center justify-center bg-zinc-800 rounded-2xl mt-1">
                    <Icon className="size-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="mt-2 text-white text-2xl/10 font-light">{feature.title}</h3>
                    <p className="text-gray-400 text-xl">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA Button */}
          <Button variant="outline" className="w-fit py-9 px-12 mt-4 text-xl border-gray-600">
            Explore Events Near You
          </Button>
        </div>
      </div>
    </div>
  )
}