import { useCallback, useEffect, useState } from 'react'
import { useInView } from '../hooks/scroll'
import {
  profile,
  games,
  dream,
  movies,
  hobbies,
  passions,
} from '../data/secret'
import './secret.css'

const ARM_MS = 8200
const TOTAL_MS = 9300

const TRAILS = [1, 2, 3, 4, 5]

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const delay = (ms) => ({ '--d': ms })

const pad = (value) => String(value).padStart(2, '0')

function Intro() {
  return (
    <div className="gb-stage" aria-hidden="true">
      {TRAILS.map((step) => (
        <span key={step} className={`gb-dot gb-trail gb-trail-${step}`} />
      ))}
      <span className="gb-dot gb-main" />
    </div>
  )
}

function FileSection({ index, title, children }) {
  const [ref, inView] = useInView(0.15)

  return (
    <section ref={ref} className={inView ? 'about-in' : ''}>
      <div className="reveal flex items-baseline gap-4" style={delay(0)}>
        <span className="text-xs font-semibold tracking-[0.4em] text-red-500 sm:text-sm">
          FILE {pad(index)}
        </span>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </div>

      <div
        className="reveal-line mb-10 mt-4 h-px bg-white/25"
        style={{ ...delay(120), transformOrigin: 'left center' }}
      />

      {children}
    </section>
  )
}

function Games() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game, index) => (
        <div
          key={game.title + index}
          className="reveal"
          style={delay(220 + index * 90)}
        >
          <article className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/4 transition-all duration-300 hover:-translate-y-1.5 hover:border-red-500/60 hover:bg-white/8">
            {game.image ? (
              <img
                src={game.image}
                alt={game.title}
                className="aspect-video w-full object-cover"
              />
            ) : null}
            <div className="p-6">
              <span className="text-5xl font-extrabold text-white/15 transition-colors duration-300 group-hover:text-red-500/70">
                {pad(index + 1)}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{game.title}</h3>
              <p className="mt-2 text-white/65">{game.note}</p>
            </div>
          </article>
        </div>
      ))}
    </div>
  )
}

function Dream() {
  return (
    <div
      className="reveal grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16"
      style={delay(220)}
    >
      <div>
        <p className="text-sm tracking-[0.35em] text-white/50">
          {dream.label.toUpperCase()}
        </p>
        <h3 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          {dream.role}
        </h3>
      </div>
      <p className="border-l-2 border-red-500 pl-6 text-lg leading-relaxed text-white/75 sm:text-xl">
        {dream.story}
      </p>
    </div>
  )
}

function Movies() {
  return (
    <ul className="flex flex-col">
      {movies.map((movie, index) => (
        <li
          key={movie.title + index}
          className="reveal"
          style={delay(220 + index * 90)}
        >
          <div className="group flex items-baseline gap-5 border-b border-white/10 px-2 py-5 transition-colors duration-300 hover:bg-white/5 sm:gap-8">
            <span className="w-8 shrink-0 text-2xl font-bold text-red-500/80">
              {pad(index + 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <h3 className="text-xl font-semibold transition-transform duration-300 group-hover:translate-x-1">
                {movie.title}
              </h3>
              <span className="text-white/45">{movie.year}</span>
              <p className="text-white/65 sm:ml-auto sm:text-right">{movie.note}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Hobbies() {
  return (
    <ul className="flex flex-wrap gap-3">
      {hobbies.map((hobby, index) => (
        <li
          key={hobby + index}
          className="reveal"
          style={delay(220 + index * 70)}
        >
          <span className="block cursor-default rounded-full border border-white/25 px-6 py-2.5 text-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-500 hover:bg-red-500/15">
            {hobby}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Passions() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {passions.map((passion, index) => (
        <div
          key={passion.title + index}
          className="reveal"
          style={delay(220 + index * 120)}
        >
          <article className="h-full rounded-2xl border border-white/10 bg-linear-to-b from-white/6 to-transparent p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-red-500/60">
            <div className="mb-5 h-0.5 w-10 bg-red-500" />
            <h3 className="text-2xl font-bold">{passion.title}</h3>
            <p className="mt-3 text-white/65">{passion.description}</p>
          </article>
        </div>
      ))}
    </div>
  )
}

function Dossier({ armed, onReplay }) {
  return (
    <div className="secret-content relative overflow-hidden bg-black text-white">
      <div className="secret-glow" aria-hidden="true" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 sm:px-10 lg:gap-32">
        <header
          className={`flex min-h-[85vh] flex-col items-center justify-center gap-6 pt-16 text-center ${armed ? 'about-in' : ''}`}
        >
          <p
            className="reveal text-sm font-semibold tracking-[0.55em] text-red-500"
            style={delay(0)}
          >
            {profile.eyebrow}
          </p>
          <h1
            className="reveal font-display text-5xl tracking-wide sm:text-7xl"
            style={delay(150)}
          >
            {profile.title}
          </h1>
          <p
            className="reveal max-w-xl text-lg text-white/70"
            style={delay(300)}
          >
            {profile.intro}
          </p>
          <div
            className="reveal-line mt-2 h-px w-44 bg-linear-to-r from-transparent via-red-500 to-transparent"
            style={{ ...delay(450), transformOrigin: 'center' }}
          />
          <span
            className="reveal mt-6 text-xs tracking-[0.5em] text-white/40"
            style={delay(700)}
          >
            SCROLL
          </span>
        </header>

        <FileSection index={1} title="Favorite Games">
          <Games />
        </FileSection>

        <FileSection index={2} title="What I Really Want To Be">
          <Dream />
        </FileSection>

        <FileSection index={3} title="Favorite Movies">
          <Movies />
        </FileSection>

        <FileSection index={4} title="Hobbies">
          <Hobbies />
        </FileSection>

        <FileSection index={5} title="Passions">
          <Passions />
        </FileSection>

        <footer className="flex flex-wrap justify-center gap-4 pt-8">
          <a
            href="/"
            className="rounded-full border border-white/30 px-6 py-2.5 text-sm tracking-widest transition-colors hover:bg-white hover:text-black"
          >
            BACK TO PORTFOLIO
          </a>
          <button
            type="button"
            onClick={onReplay}
            className="cursor-pointer rounded-full border border-red-500/60 px-6 py-2.5 text-sm tracking-widest text-red-400 transition-colors hover:bg-red-500 hover:text-white"
          >
            REPLAY INTRO
          </button>
        </footer>
      </main>
    </div>
  )
}

export default function Secret() {
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion() ? 'done' : 'intro',
  )
  const [armed, setArmed] = useState(() => prefersReducedMotion())
  const [run, setRun] = useState(0)

  const finish = useCallback(() => {
    setArmed(true)
    setPhase('done')
  }, [])

  useEffect(() => {
    if (phase !== 'intro') return undefined

    const armTimer = setTimeout(() => setArmed(true), ARM_MS)
    const doneTimer = setTimeout(finish, TOTAL_MS)
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        finish()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(armTimer)
      clearTimeout(doneTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase, run, finish])

  const replay = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setArmed(false)
    setRun((count) => count + 1)
    setPhase('intro')
  }

  return (
    <div className="secret-page min-h-screen bg-black">
      <div className={phase === 'intro' ? 'secret-iris' : ''}>
        <Dossier armed={armed} onReplay={replay} />
      </div>

      {phase === 'intro' ? (
        <>
          <Intro key={run} />
          <button
            type="button"
            onClick={finish}
            className="fixed bottom-6 right-6 z-70 cursor-pointer text-sm tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            SKIP
          </button>
        </>
      ) : null}
    </div>
  )
}
