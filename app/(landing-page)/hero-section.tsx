import React from 'react'
import { Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes breathe {
            0%, 100% {
              background-color: white;
            }
            50% {
              background-color: gray;
            }
          }
          .animate-breathe {
            animation: breathe 2s ease-in-out infinite;
          }
        `
      }} />
      <div className="w-full flex flex-col items-center gap-8 px-6">
        {/* Trust Banner */}
        <div className="rounded-full bg-linear-to-tl from-black to-gray-900 px-6 py-2.5 border border-gray-600 flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-breathe"></div>
          <span className="text-white text-lg">Trusted by 10,000+ event creators worldwide</span>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center gap-6 max-w-7xl text-center">
          {/* Headline */}
          <h1 className="text-8xl font-light leading-tight bg-linear-to-t from-gray-400 to-white bg-clip-text text-transparent">
            Infinite experiences, one Portl
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl leading-relaxed">
            The complete ticketing platform for event organizers and a seamless experience for attendees. Create, manage, and discover events that matter.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" className="text-black bg-white font-base rounded-2xl py-9 text-xl">
              <p className="ml-6">
              Start Creating Events
                </p>
              <ArrowRight className="w-5 h-5 mr-6" />
            </Button>
            <Button variant="outline" className="text-white bg-transparent border border-white font-base rounded-2xl py-9 px-10 text-xl">
              Discover Events
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl mt-12">
          <Card className="rounded-2xl py-8">
            {/* Active Community Members */}
            <div className="flex flex-col items-center text-center gap-4">
              <Users className="w-12 h-12 text-white" />
              <div className="text-4xl font-light text-white">2.5M+</div>
              <div className="text-xl text-gray-300 font-light">Active Community Members</div>
            </div>
          </Card>

          {/* Events Hosted Monthly */}
          <Card className="rounded-2xl py-8">
            <div className="flex flex-col items-center text-center gap-4">
              <Calendar className="w-12 h-12 text-white" />
              <div className="text-4xl font-light text-white">50K+</div>
              <div className="text-xl text-gray-300 font-light">Events Hosted Monthly</div>
            </div>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="rounded-2xl py-8">
            <div className="flex flex-col items-center text-center gap-4">
              <TrendingUp className="w-12 h-12 text-white" />
              <div className="text-4xl font-light text-white">98%</div>
              <div className="text-xl text-gray-300 font-light">Customer Satisfaction</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
