import React from 'react'
import { Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

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
            <button className="bg-white text-black hover:bg-gray-200 rounded-lg px-6 py-6 text-base font-medium flex items-center justify-center gap-2 transition-colors">
              Start Creating Events
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg px-6 py-6 text-base font-medium transition-colors">
              Discover Events
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          <Card>
            {/* Active Community Members */}
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-white mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2.5M+</div>
              <div className="text-gray-300 text-sm">Active Community Members</div>
            </div>
          </Card>

          {/* Events Hosted Monthly */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-white mb-4" />
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-300 text-sm">Events Hosted Monthly</div>
            </div>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-white mb-4" />
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300 text-sm">Customer Satisfaction</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
