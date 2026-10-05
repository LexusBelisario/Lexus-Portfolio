import { useEffect, useState } from 'react'

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ink/80 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="flex flex-wrap justify-end gap-x-6 gap-y-2 px-6 py-5 text-sm font-medium text-white sm:px-12 lg:pr-24">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
