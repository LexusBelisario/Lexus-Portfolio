import { useEffect, useState } from 'react'
import './entrance.css'

const links = [
  { label: 'About Me', href: '#about' },
  { label: 'View Projects', href: '#projects' },
  { label: 'My Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`enter-nav fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/20 bg-white/15 shadow-lg shadow-black/25 backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent shadow-none backdrop-blur-none'
      }`}
    >
      <nav className="flex flex-wrap justify-end gap-x-6 gap-y-2 px-6 py-5 text-2xl font-medium text-white sm:px-12 lg:pr-24">
        {links.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            style={{ '--i': index }}
            className="enter-link transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
