import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Navbar() {
    return (
        <nav className="bg-background/95 backdrop-blur-sm fixed top-0 w-full px-6 md:px-12 py-3 flex items-center justify-between border-b border-border z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Image src="/images/logo/portl-logo-white.svg" alt="Portl Logo" width={80} height={32} className="h-8 w-auto" />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                </Link>
                <Link href="#events-section" className="text-muted-foreground hover:text-foreground transition-colors">
                    Events
                </Link>
                <Link href="#about-us" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                </Link>
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                </Link>
                <Link href="#contact-us" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                    Sign In
                </Button>
                <Button size="sm">
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
