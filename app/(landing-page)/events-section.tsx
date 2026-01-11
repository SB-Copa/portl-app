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
    <div id="events-section" className="w-full flex flex-col items-center gap-4 px-6 py-25">
      {/* Platform Features Label */}
      <div className="rounded-full bg-linear-to-tl from-black to-gray-900 px-6 py-2.5 border border-gray-600 flex items-center gap-2">
        <span className="text-white text-lg">Platform Features</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 max-w-6xl text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
          Everything you need, nothing you don't
        </h2>
        <p className="text-gray-400 text-lg md:text-2xl max-w-2xl">
          Powerful tools designed for modern event creators and attendees
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-5/6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="bg-zinc-900 border-0 rounded-2xl py-8 px-10 flex flex-col gap-5"
            >
              {/* Icon */}
              <div className="rounded-2xl w-16 h-16 bg-zinc-800 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-white text-3xl font-base">{feature.title}</h3>

              {/* Description */}
              <p className="text-gray-400 text-2xl/8 font-light">
                {feature.description}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
