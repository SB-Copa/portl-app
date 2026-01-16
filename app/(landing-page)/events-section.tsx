import React from 'react'
import { Zap, Shield, BarChart3, MessageCircle, Smartphone, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function PlatformFeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Create and publish events in minutes with our intuitive interface'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Bank-level encryption and PCI compliance for safe transactions'
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Real-time insights into ticket sales, revenue, and attendee behavior'
    },
    {
      icon: MessageCircle,
      title: 'Community Hub',
      description: 'Built-in messaging and discussion forums for engaged attendees'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Seamless experience across all devices with native mobile apps'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'AI-powered event suggestions tailored to attendee preferences'
    }
  ]

  return (
    <div id="events-section" className="w-full flex flex-col items-center gap-4 px-6 py-16">
      {/* Platform Features Label */}
      <div className="rounded-full bg-card px-4 py-2 border border-border flex items-center gap-2">
        <span className="text-foreground text-sm">Platform Features</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center gap-3 mt-2 max-w-4xl text-center">
        <h2 className="text-foreground">
          Everything you need, nothing you don't
        </h2>
        <p className="text-muted-foreground text-base max-w-2xl">
          Powerful tools designed for modern event creators and attendees
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 max-w-6xl">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="p-6 flex flex-col gap-4"
            >
              {/* Icon */}
              <div className="rounded-xl size-10 bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground" />
              </div>

              {/* Title */}
              <h4 className="text-foreground">{feature.title}</h4>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
