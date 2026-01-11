import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NavbarSection() {
    return (
        <nav className="bg-black fixed top-0 text-2xl w-full px-16 py-4 flex items-center justify-between border-b-white/30 border-b z-50">
            {/* Logo */}
            <div className="flex items-center">
                <span className="text-white font-bold text-6xl">
                    <h1>
                        PORTL
                    </h1>
                </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-300">
                <Link href="/" className="hover:text-white  transition-colors text-2xl">
                    Home
                </Link>
                <Link href="#events-section" className="hover:text-white  transition-colors text-2xl">
                    Events
                </Link>
                <Link href="#about-us" className="hover:text-white  transition-colors text-2xl">
                    About Us
                </Link>
                <Link href="#features" className="hover:text-white  transition-colors text-2xl">
                    Features
                </Link>
                <Link href="#contact-us" className="hover:text-white  transition-colors text-2xl">
                    Contact Us
                </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 text-gray-300 font-base">
                <Button variant="outline" className="text-2xl border-0 bg-transparent">
                    Sign In
                </Button>
                <Button variant="outline" className="text-black bg-white rounded-2xl py-6 px-8 text-2xl">
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
