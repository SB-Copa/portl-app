import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Navbar() {
    return (
        <nav className="bg-black fixed top-0 w-full px-16 py-4 flex items-center justify-between border-b-white/30 border-b z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Image src="/images/logo/portl-logo-white.svg" alt="Portl Logo" width={100} height={100} />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-300">
                <Link href="/" className="hover:text-white  transition-colors">
                    Home
                </Link>
                <Link href="#events-section" className="hover:text-white  transition-colors">
                    Events
                </Link>
                <Link href="#about-us" className="hover:text-white  transition-colors">
                    About Us
                </Link>
                <Link href="#features" className="hover:text-white  transition-colors">
                    Features
                </Link>
                <Link href="#contact-us" className="hover:text-white  transition-colors">
                    Contact Us
                </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 text-gray-300 font-base">
                <Button variant="ghost">
                    Sign In
                </Button>
                <Button >
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
