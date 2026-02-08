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
      <div className="w-full flex flex-col items-center gap-6 px-6">
        {/* Trust Banner */}
        <div className="rounded-full bg-card px-4 py-2 border border-border flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-breathe"></div>
          <span className="text-foreground text-sm">Trusted by 10,000+ event creators worldwide</span>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center gap-4 max-w-6xl text-center">
          {/* Headline */}
          <h1 className="bg-gradient-to-b from-muted-foreground to-foreground bg-clip-text text-transparent">
            Infinite experiences, one Portl
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
            The complete ticketing platform for event organizers and a seamless experience for attendees. Create, manage, and discover events that matter.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 mt-2">
            <Button className='py-6 px-10'>
              Start Creating Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className='py-6 px-10'>
              Discover Events
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-8">
          <Card className="rounded-xl py-5">
            {/* Active Community Members */}
            <div className="flex flex-col items-center text-center gap-3">
              <Users className="size-8 text-foreground" />
              <div className="text-2xl font-semibold text-foreground">2.5M+</div>
              <p className="text-muted-foreground text-sm">Active Community Members</p>
            </div>
          </Card>

          {/* Events Hosted Monthly */}
          <Card className="rounded-xl py-5">
            <div className="flex flex-col items-center text-center gap-3">
              <Calendar className="size-8 text-foreground" />
              <div className="text-2xl font-semibold text-foreground">50K+</div>
              <p className="text-muted-foreground text-sm">Events Hosted Monthly</p>
            </div>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="rounded-xl py-5">
            <div className="flex flex-col items-center text-center gap-3">
              <TrendingUp className="size-8 text-foreground" />
              <div className="text-2xl font-semibold text-foreground">98%</div>
              <p className="text-muted-foreground text-sm">Customer Satisfaction</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
