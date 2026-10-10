import { useState } from 'react'
import { useInView, useScrollVars } from '../hooks/scroll'
import {
  education,
  work,
  spotify,
  activeStack,
  exploring,
} from '../data/experience'
import './experience.css'
import './section_transition.css'

const delay = (ms) => ({ '--d': ms })

function SpotifyCode({ src, href, label }) {
  const [failed, setFailed] = useState(false)

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="sp-link block h-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4a12c]"
    >
      {failed ? (
        <span className="exp-gold inline-flex h-full items-center rounded-full border border-current px-5 text-sm font-semibold tracking-widest">
          LISTEN ON SPOTIFY
        </span>
      ) : (
        <>
          <span
            className="sp-code"
            style={{ '--sp-src': `url("${src}")` }}
          />
          <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className="pointer-events-none absolute size-0 opacity-0"
            aria-hidden="true"
          />
        </>
      )}
    </a>
  )
}

function TechIcon({ tech }) {
  const [failed, setFailed] = useState(!tech.src)

  if (failed) {
    return (
      <span
        title={tech.label}
        className="flex size-full items-center justify-center rounded-full bg-white/15 text-xs font-bold"
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
      className="size-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:scale-115"
    />
  )
}

function IconRow({ items, baseDelay }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-[clamp(0.5rem,1vw,1.5rem)]">
      {items.map((tech, index) => (
        <li
          key={tech.label}
          className="reveal-pop size-[clamp(1.9rem,2.1vw,2.75rem)] shrink-0"
          style={delay(baseDelay + index * 80)}
        >
          <TechIcon key={tech.src || 'none'} tech={tech} />
        </li>
      ))}
    </ul>
  )
}

function Entries({ items, baseDelay }) {
  return (
    <ul className="flex flex-col">
      {items.map((item, index) => (
        <li
          key={item.place}
          className="reveal"
          style={delay(baseDelay + index * 150)}
        >
          {index > 0 ? <div className="exp-rule my-[clamp(1rem,1.6vw,1.75rem)]" /> : null}
          <div className="flex flex-col gap-[0.45em] text-[clamp(0.85rem,0.95vw,1.12rem)] leading-snug">
            <p className="font-bold">{item.place}</p>
            <p className="text-white/90">{item.detail}</p>
            {item.location ? <p className="text-white/90">{item.location}</p> : null}
            <p className="flex items-center gap-2 italic text-white/65">
              {item.period}
              {item.period.endsWith('Present') ? (
                <span className="exp-live" aria-hidden="true" />
              ) : null}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Card({ index, title, footer, children }) {
  return (
    <div className="reveal h-full" style={delay(220 + index * 160)}>
      <article className="exp-card group flex h-full flex-col rounded-[22px] p-[clamp(0.9rem,1.5vw,1.6rem)] transition-all duration-500 hover:-translate-y-1.5">
        <div
          className="exp-inner reveal-wipe flex flex-1 flex-col gap-[clamp(1rem,1.6vw,1.75rem)] px-[clamp(1rem,1.5vw,1.75rem)] pb-[clamp(1.25rem,2vw,2.25rem)] pt-[clamp(0.9rem,1.3vw,1.5rem)]"
          style={delay(380 + index * 160)}
        >
          <h3
            className="reveal exp-gold exp-label text-center text-[clamp(1.25rem,1.35vw,1.65rem)] leading-tight"
            style={delay(700 + index * 160)}
          >
            {title}
          </h3>
          {children}
          {footer ? (
            <div className="mt-auto flex justify-center pt-[clamp(0.75rem,1.2vw,1.25rem)]">
              {footer}
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}

export default function Experience() {
  const [sectionRef, inView] = useInView(0, '0px 0px -22% 0px', true)
  useScrollVars(sectionRef)

  return (
    <section
      ref={sectionRef}
      id="experience"
      className={`exp relative flex min-h-screen w-full items-center overflow-hidden text-white ${inView ? 'about-in' : ''}`}
    >
      <div className="exp-glow" aria-hidden="true" />

      <div className="exp-enter relative z-10 mx-auto flex w-full max-w-[1360px] flex-col gap-[clamp(2rem,4vw,4.5rem)] px-6 py-24 sm:px-10">
        <div
          className="reveal flex flex-wrap items-baseline gap-x-5 gap-y-1"
          style={delay(0)}
        >
          <span className="text-[clamp(1rem,1.2vw,1.5rem)] font-medium">
            TRACK 02:
          </span>
          <h2 className="exp-label text-[clamp(1.45rem,1.85vw,2.4rem)] font-bold tracking-wide">
            EXPERIENCES &amp; SKILLS
          </h2>
        </div>

        <div className="grid gap-[clamp(1.5rem,3.4vw,3.5rem)] lg:grid-cols-3">
          <Card index={0} title="Education">
            <Entries items={education} baseDelay={820} />
          </Card>

          <Card
            index={1}
            title="Work Experiences"
            footer={
              <div className="h-[clamp(2.2rem,3.1vw,3.5rem)]">
                <SpotifyCode
                  key={spotify.src}
                  src={spotify.src}
                  href={spotify.href}
                  label={spotify.label}
                />
              </div>
            }
          >
            <Entries items={work} baseDelay={980} />
          </Card>

          <Card index={2} title="Active Stack">
            <IconRow items={activeStack} baseDelay={1140} />
            <h3
              className="reveal exp-gold exp-label mt-[clamp(0.25rem,0.8vw,1rem)] text-center text-[clamp(1.25rem,1.35vw,1.65rem)] leading-tight"
              style={delay(1500)}
            >
              Currently Exploring
            </h3>
            <IconRow items={exploring} baseDelay={1600} />
          </Card>
        </div>
      </div>
    </section>
  )
}
