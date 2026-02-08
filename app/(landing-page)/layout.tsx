import type { ReactNode } from 'react'
import Navbar from '../../components/layout/navbar'
import Footer from '../../components/layout/footer'

export default function LandingPageLayout({ children }: { children: ReactNode }) {
    return (
        <div className='dark'>
            <Navbar/>
            {children}
            <Footer />
        </div>
    )
}
