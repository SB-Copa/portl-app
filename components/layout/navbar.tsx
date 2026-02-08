import Link from 'next/link'
import Image from 'next/image'
import { HeaderActions } from './header-actions'

export default async function Navbar() {
    return (
        <nav className="bg-background fixed top-0 w-full px-6 md:px-12 py-4 flex items-center justify-between z-50">
            {/* Logo */}
            <div className="flex items-center">
                <Link href="/">
                    <Image src="/images/logo/portl-logo-white.svg" alt="Portl Logo" width={80} height={32} className="h-8 w-auto" />
                </Link>
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
            <HeaderActions />
        </nav>
    )
}
