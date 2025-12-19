import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NavbarSection() {
    return (
        <nav className="bg-black fixed top-0 text-2xl w-full px-14 py-4 flex items-center justify-between border-b-white/30 border-b z-50">
            {/* Logo */}
            <div className="flex items-center">
                <span className="text-white font-bold text-5xl">
                    <h1>
                        PORTL
                    </h1>
                </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-300">
                <Link href="/" className="hover:text-white  transition-colors text-xl">
                    Home
                </Link>
                <a href="#platform-features" className="hover:text-white  transition-colors text-xl">
                    Events
                </a>
                <a href="#about-us" className="hover:text-white  transition-colors text-xl">
                    About Us
                </a>
                <a href="#features" className="hover:text-white  transition-colors text-xl">
                    Features
                </a>
                <a href="#contact-us" className="hover:text-white  transition-colors text-xl">
                    Contact Us
                </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Button>
                    Sign In
                </Button>
                <Button variant="outline">
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
