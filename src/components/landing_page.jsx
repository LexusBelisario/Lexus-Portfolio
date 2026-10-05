import { useEffect, useRef, useState } from 'react'
import george from '../assets/beatles/george.svg'
import paul from '../assets/beatles/paul.svg'
import ringo from '../assets/beatles/ringo.svg'
import lennon from '../assets/beatles/lennon.svg'
import zebraCrossing from '../assets/beatles/zebra_crossing.svg'
import hereComesTheSun from '../assets/beatles/herecomesthesun.png'

const titles = [
  'Software Developer',
  'Fullstack Developer',
  'BS Computer Engineering',
  'Humanities And Social Sciences',
]

const rareTitle = 'Future Lawyer?'
const rareChance = 0.05

const TYPE_SPEED = 80
const DELETE_SPEED = 40
const HOLD_TIME = 1800
const PAUSE_TIME = 500

const socials = [
  { label: 'LinkedIn', src: '/icons/linkedin.svg', href: 'https://www.linkedin.com/' },
  { label: 'GitHub', src: '/icons/github.svg', href: 'https://github.com/' },
  { label: 'Gmail', src: '/icons/gmail.svg', href: 'mailto:' },
]

const band = [
  { name: 'George', src: george, left: '12.8%', width: '22.4%', bottom: '35%' },
  { name: 'Paul', src: paul, left: '33.6%', width: '16.8%', bottom: '37%' },
  { name: 'Ringo', src: ringo, left: '56.5%', width: '17.4%', bottom: '37%' },
  { name: 'John', src: lennon, left: '77%', width: '16.5%', bottom: '36%' },
]

export default function LandingPage() {
  const [text, setText] = useState('')
  const [target, setTarget] = useState(titles[0])
  const [isDeleting, setIsDeleting] = useState(false)
  const nextIndex = useRef(1)

  useEffect(() => {
    let delay = isDeleting ? DELETE_SPEED : TYPE_SPEED
    let action

    if (!isDeleting && text === target) {
      delay = HOLD_TIME
      action = () => setIsDeleting(true)
    } else if (isDeleting && text === '') {
      delay = PAUSE_TIME
      action = () => {
        if (Math.random() < rareChance) {
          setTarget(rareTitle)
        } else {
          setTarget(titles[nextIndex.current])
          nextIndex.current = (nextIndex.current + 1) % titles.length
        }
        setIsDeleting(false)
      }
    } else {
      action = () =>
        setText(target.slice(0, text.length + (isDeleting ? -1 : 1)))
    }

    const timer = setTimeout(action, delay)
    return () => clearTimeout(timer)
  }, [text, target, isDeleting])

  return (
    <section className="flex min-h-screen w-full">
      <aside className="flex w-12 shrink-0 items-center justify-center bg-strip sm:w-14">
        <span className="rotate-180 text-2xl font-semibold tracking-widest text-white [writing-mode:vertical-rl] sm:text-[28px]">
          SUPER DELUXE EDITION
        </span>
      </aside>

      <div className="hero-bg relative flex-1 overflow-hidden">
        <div className="relative z-10 px-6 pt-20 sm:px-12 lg:pr-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl">
              Lexus Belisario
            </h1>
            <p className="text-xl font-semibold text-white md:mt-6 md:max-w-sm md:text-right lg:text-2xl">
              <span>{text}</span>
              <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-white align-middle motion-reduce:animate-none" />
              <span className="invisible">{target.slice(text.length)}</span>
            </p>
          </div>
        </div>

        <ul className="absolute right-4 top-28 z-10 hidden flex-col gap-3 sm:flex">
          {socials.map((social) => (
            <li key={social.label}>
              <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                <img src={social.src} alt="" className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>

        <img
          src={hereComesTheSun}
          alt=""
          className="absolute right-0 top-72 z-10 hidden h-75 w-15 object-contain sm:block"
        />

        <div className="absolute bottom-0 left-1/2 aspect-780/355 w-[min(95%,1350px)] -translate-x-1/2">
          <img src={zebraCrossing} alt="" className="absolute bottom-0 left-0 w-full" />
          {band.map((member) => (
            <img
              key={member.name}
              src={member.src}
              alt={member.name}
              className="absolute h-auto origin-bottom transition-transform duration-300 hover:-translate-y-3 hover:rotate-2 motion-reduce:transition-none"
              style={{ left: member.left, width: member.width, bottom: member.bottom }}
            />
          ))}
        </div>

        <span className="absolute bottom-3 right-4 z-10 text-xs text-white/80">
          Scroll down for more
        </span>
      </div>
    </section>
  )
}
