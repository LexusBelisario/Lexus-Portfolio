import { useState } from 'react'
import { useInView } from '../hooks/scroll'
import {
  resume,
  endLines,
  socialsHeading,
  socials,
  builtWithHeading,
  builtWith,
  legal,
} from '../data/contact'

const delay = (ms) => ({ '--d': ms })

const showPlaceholders = import.meta.env.DEV

const year = new Date().getFullYear()
const years = legal.since === year ? `${year}` : `${legal.since}-${year}`

const iconBox = 'block size-[clamp(1.75rem,1.9vw,2.5rem)]'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

const glassButton =
  'group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/25 bg-white/10 px-[clamp(1.25rem,1.6vw,2rem)] py-[clamp(0.55rem,0.75vw,0.95rem)] text-[clamp(0.95rem,1.1vw,1.4rem)] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md backdrop-saturate-150 transition-[color,border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-white/70 hover:text-[#120c1c] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_36px_rgba(86,195,183,0.28)] focus-visible:border-white/70 focus-visible:text-[#120c1c] motion-reduce:transition-none motion-reduce:hover:translate-y-0'

const hologramLayer =
  'pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-[opacity,background-position] duration-700 ease-out [background-image:linear-gradient(110deg,#56c3b7_0%,#b9b3d9_14%,#51d0c2_28%,#c8bee1_42%,#fefefe_56%,#a4ccf3_70%,#f9fdfe_84%,#cbbcd5_100%)] [background-position:0%_50%] [background-size:220%_100%] group-hover:opacity-65 group-hover:[background-position:100%_50%] group-focus-visible:opacity-65 group-focus-visible:[background-position:100%_50%] motion-reduce:transition-none'

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[1.25em] shrink-0"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

function Social({ social }) {
  const { label, src, href } = social
  const external = href.startsWith('http')
  const image = <img src={src} alt="" className="size-full object-contain" />

  if (!href) {
    if (!showPlaceholders) return null

    return (
      <li>
        <span
          aria-disabled="true"
          title={`${label} - coming soon`}
          className={`${iconBox} cursor-default opacity-40`}
        >
          {image}
        </span>
      </li>
    )
  }

  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        aria-label={label}
        className={`${iconBox} transition-transform duration-300 hover:-translate-y-1 hover:scale-110 motion-reduce:transition-none ${focusRing}`}
      >
        {image}
      </a>
    </li>
  )
}

function BuiltIcon({ tech }) {
  const [failed, setFailed] = useState(!tech.src)

  if (failed) {
    return (
      <span
        title={tech.label}
        className="flex size-full items-center justify-center rounded-full bg-white/15 text-[0.6rem] font-bold"
      >
        {tech.label.slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={tech.src}
      alt={tech.label}
      title={tech.label}
      onError={() => setFailed(true)}
      className="size-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
    />
  )
}

export default function Contact() {
  const [sectionRef, inView] = useInView(0, '0px 0px -10% 0px', true)

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Contact"
      className={`relative flex w-full flex-col overflow-hidden bg-[#060a12] text-white ${inView ? 'about-in' : ''}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[image:radial-gradient(ellipse_62%_78%_at_50%_100%,rgba(87,0,128,0.95)_0%,rgba(87,0,128,0.7)_40%,transparent_100%),radial-gradient(ellipse_70%_100%_at_50%_104%,rgba(255,242,215,0.42)_0%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6 pt-[clamp(4rem,6.5vw,8rem)]">
        <div className="flex flex-col items-center gap-[clamp(1.25rem,3.4vw,4rem)] text-center text-[clamp(1.75rem,2.6vw,3.25rem)] font-bold uppercase leading-none">
          {endLines.map((line, index) => (
            <p key={line} className="reveal" style={delay(index * 500)}>
              {line}
            </p>
          ))}
        </div>

        <div className="mt-[clamp(3rem,7.5vw,9rem)] grid w-full max-w-[1100px] grid-cols-1 gap-12 text-center sm:grid-cols-2">
          <div
            className="reveal flex flex-col items-center gap-[clamp(0.9rem,1.1vw,1.4rem)]"
            style={delay(900)}
          >
            <p className="text-[clamp(1.1rem,1.45vw,1.8rem)]">{resume.heading}</p>
            <a
              href={resume.href}
              download=""
              className={`${glassButton} ${focusRing}`}
            >
              <span className={hologramLayer} aria-hidden="true" />
              <DownloadIcon />
              {resume.button}
            </a>
          </div>

          <div
            className="reveal flex flex-col items-center gap-[clamp(0.9rem,1.1vw,1.4rem)]"
            style={delay(1050)}
          >
            <p className="text-[clamp(1.1rem,1.45vw,1.8rem)]">{socialsHeading}</p>
            <ul className="flex items-center gap-[clamp(1.25rem,2.2vw,2.75rem)]">
              {socials.map((social) => (
                <Social key={social.id} social={social} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mt-[clamp(2rem,3vw,3.5rem)] grid w-full grid-cols-1 items-end gap-5 px-[max(1rem,1.2vw)] pb-[max(0.75rem,0.9vw)] text-center text-[clamp(0.7rem,0.8vw,1rem)] font-medium uppercase tracking-wide sm:grid-cols-3 sm:text-left">
        <p className="reveal" style={delay(1200)}>
          &copy; {years} {legal.owner}
        </p>
        <p className="reveal sm:text-center" style={delay(1250)}>
          {legal.rights}
        </p>
        <div
          className="reveal flex flex-col items-center gap-2 normal-case sm:items-end"
          style={delay(1300)}
        >
          <p className="text-[clamp(0.75rem,0.85vw,1.05rem)]">{builtWithHeading}</p>
          <ul className="flex items-center gap-[clamp(0.6rem,0.9vw,1.1rem)]">
            {builtWith.map((tech) => (
              <li key={tech.label} className="size-[clamp(1.25rem,1.4vw,1.75rem)]">
                <BuiltIcon tech={tech} />
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </section>
  )
}
