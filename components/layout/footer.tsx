import React from 'react'
import Link from 'next/link'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="w-full bg-black text-white border-t-white/20 border-t">
            <div className="w-full px-14 py-16">
                <div className="flex gap-28 mb-12">
                    {/* Left Section - Logo and Tagline */}
                    <div className="md:col-span-1 flex flex-col gap- w-content">
                        {/* Logo */}
                        <div className="flex items-center">
                            <span className="text-white font-bold text-6xl">
                                PORTL
                            </span>
                        </div>
                        
                        {/* Tagline */}
                        <p className="text-gray-400 text-xl leading-relaxed w-md">
                            The ticketing platform that brings communities together through unforgettable events.
                        </p>
                        
                        {/* Social Media Icons */}
                        <div className="flex items-center gap-3 mt-4">
                            <Link 
                                href="#" 
                                className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-gray-900 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-6 h-6 text-white" />
                            </Link>
                            <Link 
                                href="#" 
                                className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-gray-900 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-6 h-6 text-white" />
                            </Link>
                            <Link 
                                href="#" 
                                className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-gray-900 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-6 h-6 text-white" />
                            </Link>
                            <Link 
                                href="#" 
                                className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-gray-900 transition-colors"
                                aria-label="Discord"
                            >
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Navigation Columns */}
                    <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-40">
                        {/* Product Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-base text-xl mb-2">Product</h3>
                            <ul className="flex flex-col gap-5">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Security
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Roadmap
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        API
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Company Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-base text-lg mb-2">Company</h3>
                            <ul className="flex flex-col gap-5">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Press Kit
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Partners
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Resources Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-base text-lg mb-2">Resources</h3>
                            <ul className="flex flex-col gap-5">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors whitespace-nowrap">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Community
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Events
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Status
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Legal Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-base text-lg mb-2">Legal</h3>
                            <ul className="flex flex-col gap-5">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Terms
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Cookies
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Licenses
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-lg transition-colors">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Section - Copyright and Attribution */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-lg">
                        © 2025 Portl. All rights reserved.
                    </p>
                    <p className="text-gray-400 text-lg">
                        Made with 🤍 for event creators worldwide
                    </p>
                </div>
            </div>
        </footer>
    )
}

