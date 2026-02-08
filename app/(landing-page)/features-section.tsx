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
    <div id="features" className="w-full px-6 md:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-7xl mx-auto">
        {/* Left Section - Event Cards */}
        <div className="flex flex-col gap-4">
          {events.map((event, index) => (
            <Card key={index} className="rounded-xl p-6 relative">
              {/* Category Tag */}
              <div className={`${event.categoryColor} rounded-full px-3 py-1 w-fit mb-2`}>
                <span className="text-white text-xs">{event.category}</span>
              </div>

              {/* Heart Icon */}
              <Button variant="outline" size="icon" className="absolute top-5 right-5 h-8 w-8 rounded-full">
                <Heart className="h-4 w-4" strokeWidth={2} />
              </Button>

              {/* Event Title */}
              <h4 className="text-foreground mb-2">{event.title}</h4>

              {/* Date and Location */}
              <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                <span>{event.date}</span>
                <span>•</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{event.location}</span>
              </div>

              {/* Attendees and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 bg-muted rounded-full border-2 border-card"></div>
                    <div className="h-7 w-7 bg-muted rounded-full border-2 border-card"></div>
                    <div className="h-7 w-7 bg-muted rounded-full border-2 border-card"></div>
                  </div>
                  <span className="text-muted-foreground text-sm">{event.attendees} attending</span>
                </div>
                <div className="text-foreground font-semibold">{event.price}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Section - Features */}
        <div className="flex flex-col gap-5">
          {/* Badge */}
          <div className="rounded-full bg-card px-4 py-2 border border-border w-fit">
            <span className="text-foreground text-sm">For Event Attendees</span>
          </div>

          {/* Headline */}
          <h2 className="text-foreground">
            Discover experiences that inspire you
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-base max-w-xl">
            Find events tailored to your interests, connect with like-minded people, and create memories that last a lifetime.
          </p>

          {/* Features List */}
          <div className="flex flex-col gap-5 mt-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-xl shrink-0">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-foreground">{feature.title}</h5>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA Button */}
          <Button variant="outline" className="w-fit h-11 px-6 mt-3">
            Explore Events Near You
          </Button>
        </div>
      </div>
    </div>
  )
}