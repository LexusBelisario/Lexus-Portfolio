import { useEffect, useState } from 'react'
import { resume } from '../data/contact'
import './entrance.css'

const links = [
  { label: 'About Me', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const sectionIds = ['home', ...links.map((link) => link.href.slice(1))]

function useActiveSection(ids) {
  const [active, setActive] = useState('')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current = ''

      for (const id of ids) {
        const node = document.getElementById(id)
        if (node && node.getBoundingClientRect().top <= line) current = id
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4

      if (atBottom) current = ids[ids.length - 1]

      setActive(current)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ids])

  return active
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40)
  const active = useActiveSection(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`enter-nav fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/15 bg-black/35 shadow-lg shadow-black/25 backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent shadow-none backdrop-blur-none'
      }`}
    >
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 px-4 py-4 text-base font-medium text-white sm:gap-x-6 sm:px-12 sm:py-5 sm:text-xl lg:pr-24"
      >
        {links.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            style={{ '--i': index }}
            aria-current={active === link.href.slice(1) ? 'location' : undefined}
            className="enter-link relative transition-opacity after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:opacity-70 aria-[current=location]:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:after:transition-none"
          >
            {link.label}
          </a>
        ))}
        <a
          href={resume.href}
          download=""
          style={{ '--i': links.length }}
          className="enter-link rounded-full border border-white/60 px-4 py-0.5 transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
        >
          {resume.label}
        </a>
      </nav>
    </header>
  )
}
