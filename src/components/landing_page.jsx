import { Fragment, useEffect, useRef, useState } from 'react'
import gmail_icon from '../assets/icons/gmail.svg'
import github_icon from '../assets/icons/github.svg'
import linkedin_icon from '../assets/icons/linkedin.svg'
import george from '../assets/beatles/george.svg'
import paul from '../assets/beatles/paul.svg'
import ringo from '../assets/beatles/ringo.svg'
import lennon from '../assets/beatles/lennon.svg'
import zebraCrossing from '../assets/beatles/zebra_crossing.svg'
import hereComesTheSun from '../assets/beatles/herecomesthesun.png'
import { useScrollVars } from '../hooks/scroll'
import './entrance.css'

const titles = [
  'Software Developer',
  'Fullstack Developer',
  'BS Computer Engineering',
  'Humanities And Social Sciences',
]

const rareTitle = 'Future Lawyer?'
const rareChance = 0.10

const TYPE_SPEED = 80
const DELETE_SPEED = 40
const HOLD_TIME = 1800
const PAUSE_TIME = 500
const TYPE_START = 1300

const NAME = 'Lexus Belisario'

const nameWords = NAME.split(' ').map((word, index, all) => ({
  word,
  offset: all.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
}))

const socials = [
  {
    label: 'LinkedIn',
    src: linkedin_icon,
    href: 'https://www.linkedin.com/in/lexus-john-belisario/',
  },
  {
    label: 'GitHub',
    src: github_icon,
    href: 'https://github.com/LexusBelisario',
  },
  // {
  //   label: 'Gmail',
  //   src: gmail_icon,
  //   href: 'mailto:',
  // },
]

const band = [
  {
    name: 'George',
    src: george,
    left: '12.8%',
    width: '22.4%',
    bottom: '35%',
    hoverShadow:
      'hover:drop-shadow-[0_0_12px_rgba(120,180,140,0.9)]',
  },
  {
    name: 'Paul',
    src: paul,
    left: '33.6%',
    width: '16.8%',
    bottom: '37%',
    hoverShadow:
      'hover:drop-shadow-[0_0_14px_rgba(255,210,70,1)]',
  },
  {
    name: 'Ringo',
    src: ringo,
    left: '56.5%',
    width: '17.4%',
    bottom: '37%',
    hoverShadow:
      'hover:drop-shadow-[0_0_12px_rgba(100,170,220,0.9)]',
  },
  {
    name: 'John',
    src: lennon,
    left: '77%',
    width: '16.5%',
    bottom: '36%',
    hoverShadow:
      'hover:drop-shadow-[0_0_12px_rgba(170,130,200,0.9)]',
  },
]

function AnimatedName() {
  return (
    <h1
      aria-label={NAME}
      className="font-display text-4xl tracking-wide text-white sm:text-5xl lg:text-6xl"
    >
      {nameWords.map(({ word, offset }, index) => (
        <Fragment key={word}>
          {index > 0 ? ' ' : null}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {[...word].map((char, charIndex) => (
              <span
                key={charIndex}
                className="enter-char inline-block"
                style={{ '--i': offset + charIndex }}
              >
                {char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h1>
  )
}

export default function LandingPage() {
  const sectionRef = useRef(null)
  useScrollVars(sectionRef)

  const [text, setText] = useState('')
  const [target, setTarget] = useState(titles[0])
  const [isDeleting, setIsDeleting] = useState(false)
  const nextIndex = useRef(1)
  const [ready, setReady] = useState(false)

  const [paulClicks, setPaulClicks] = useState(0)

  const handlePaulClick = () => {
    setPaulClicks((count) => {
      const newCount = count + 1

      if (newCount === 4) {
        window.location.href = '/secret'
      }

      return newCount
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), TYPE_START)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready) return undefined

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
        setText(
          target.slice(
            0,
            text.length + (isDeleting ? -1 : 1)
          )
        )
    }

    const timer = setTimeout(action, delay)

    return () => clearTimeout(timer)
  }, [ready, text, target, isDeleting])

  return (
    <section ref={sectionRef} id="home" className="landing flex min-h-screen w-full">
      <aside className="enter-strip flex w-12 shrink-0 items-center justify-center bg-strip sm:w-14">
        <span className="rotate-180 text-2xl font-semibold tracking-widest text-white [writing-mode:vertical-rl] sm:text-[28px]">
          SUPER DELUXE EDITION
        </span>
      </aside>

      <div className="hero-bg relative flex-1 overflow-hidden">
        <div className="enter-curtain" aria-hidden="true" />

        <div className="leave-up relative z-10 px-6 pt-20 sm:px-12 lg:pr-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <AnimatedName />

            <p
              className="enter-up text-xl font-semibold text-white md:mt-6 md:max-w-sm md:text-right lg:text-2xl"
              style={{ '--at': '1s' }}
            >
              <span>{text}</span>

              <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-white align-middle motion-reduce:animate-none" />

              <span className="invisible">
                {target.slice(text.length)}
              </span>
            </p>
          </div>
        </div>

        <ul className="leave-fade absolute right-4 top-28 z-10 hidden flex-col gap-3 sm:flex">
          {socials.map((social, index) => (
            <li
              key={social.label}
              className="enter-right"
              style={{ '--i': index }}
            >
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                <img
                  src={social.src}
                  alt=""
                  className="h-8 w-8"
                />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2?si=e459eb722d5943e2"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={hereComesTheSun}
            alt=""
            className="leave-fade enter-slide-right absolute right-0 top-72 z-10 hidden h-75 w-15 object-contain sm:block"
          />
        </a>

        <div className="leave-down absolute bottom-0 left-1/2 aspect-780/355 w-[min(95%,1350px)] -translate-x-1/2">
          <img
            src={zebraCrossing}
            alt=""
            className="enter-rise absolute bottom-0 left-0 w-full"
          />

          {band.map((member, index) => (
            <img
              key={member.name}
              src={member.src}
              alt={member.name}
              onClick={
                member.name === 'Paul'
                  ? handlePaulClick
                  : undefined
              }
              className={`
                enter-walk
                absolute h-auto origin-bottom
                cursor-pointer
                transition-all duration-300
                hover:-translate-y-3
                hover:rotate-2
                ${member.hoverShadow}
                motion-reduce:transition-none
              `}
              style={{
                left: member.left,
                width: member.width,
                bottom: member.bottom,
                '--i': band.length - 1 - index,
              }}
            />
          ))}
        </div>

        <div
          className="enter-fade absolute bottom-3 right-4 z-10"
          style={{ '--at': '2.8s' }}
        >
          <a
            href="#about"
            className="leave-fade flex items-center gap-2 text-xl text-white/80 transition-colors hover:text-white"
          >
            Scroll down for more
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 animate-bounce motion-reduce:animate-none"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}