import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/scroll'
import {
  profile,
  games,
  dream,
  movies,
  bondIntro,
  bondActors,
  bondFilms,
  hobbies,
  passions,
  gunbarrelTracks,
} from '../data/secret'
import './secret.css'

const DEFAULT_HIT = 12.27
const MIN_HIT = 9.3
const ARM_LAG = 6.4
const TOTAL_LAG = 7.5
const LAST_TRACK_KEY = 'gunbarrel-last-track'

const TRAILS = [1, 2, 3, 4, 5]

const AUDIO_VOLUME = 0.9
const AUDIO_WAIT_MS = 2500
const AUDIO_SKIP_S = 0

const BLOOD_LEAD = 0.3
const BLOOD_SECONDS = 5.6
const SHAKE_SECONDS = BLOOD_LEAD + BLOOD_SECONDS
const BLOOD_REACH = 1.4
const SHAKE_HZ = 3.2
const SHAKE_SHARE = 0.006
const DOT_SCALE = 3.1
const LOBES = [
  { x: 0.06, w: 0.04, a: 0.22 },
  { x: 0.17, w: 0.035, a: 0.34 },
  { x: 0.3, w: 0.05, a: 0.26 },
  { x: 0.43, w: 0.04, a: 0.38 },
  { x: 0.55, w: 0.055, a: 0.2 },
  { x: 0.67, w: 0.04, a: 0.36 },
  { x: 0.79, w: 0.05, a: 0.24 },
  { x: 0.92, w: 0.04, a: 0.3 },
]

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const smooth = (value) => value * value * (3 - 2 * value)

const sheetDepth = (x, progress, height) => {
  const drift = progress * 1.6
  const body =
    0.86 +
    0.07 * Math.sin(x * 14.5 + 0.7 + drift) +
    0.05 * Math.sin(x * 31 + 2.1 - drift) +
    0.012 * Math.sin(x * 86 + 4.4 + drift * 0.5)

  let lobe = 0
  for (const { x: centre, w, a } of LOBES) {
    const offset = (x - centre) / w
    lobe += a * Math.exp(-offset * offset)
  }

  const pool = height * 0.03 * smooth(clamp01(progress / 0.08))
  const flow = smooth(clamp01((progress - 0.12) / 0.88))

  return pool + height * BLOOD_REACH * flow * (body + lobe * clamp01(progress * 3))
}

const paintBlood = (ctx, width, height, progress) => {
  ctx.clearRect(0, 0, width, height)
  if (progress <= 0) return

  const fill = ctx.createLinearGradient(0, 0, 0, height)
  fill.addColorStop(0, '#5a050c')
  fill.addColorStop(0.3, '#9d0b16')
  fill.addColorStop(0.65, '#cf111d')
  fill.addColorStop(1, '#d9161f')

  ctx.fillStyle = fill

  const step = 5
  const front = []
  for (let x = 0; x <= width + step; x += step) {
    front.push([x, sheetDepth(x / width, progress, height)])
  }

  ctx.beginPath()
  ctx.moveTo(-8, -8)
  ctx.lineTo(width + 8, -8)
  for (let index = front.length - 1; index >= 0; index -= 1) {
    ctx.lineTo(front[index][0], front[index][1])
  }
  ctx.closePath()
  ctx.fill()

  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  )
  vignette.addColorStop(0, 'rgba(35, 0, 5, 0)')
  vignette.addColorStop(1, 'rgba(35, 0, 5, 0.5)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

const pickTrack = () => {
  let last = -1
  try {
    last = Number(sessionStorage.getItem(LAST_TRACK_KEY))
  } catch {
    last = -1
  }

  const pool = gunbarrelTracks
    .map((track, index) => ({ track, index }))
    .filter(({ index }) => gunbarrelTracks.length < 2 || index !== last)
  const choice = pool[Math.floor(Math.random() * pool.length)]

  try {
    sessionStorage.setItem(LAST_TRACK_KEY, String(choice.index))
  } catch {
    last = -1
  }

  return choice.track
}

const fadeOutAndStop = (audio) => {
  const step = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - 0.1)
  }, 40)
  setTimeout(() => {
    clearInterval(step)
    audio.pause()
  }, 500)
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const delay = (ms) => ({ '--d': ms })

const pad = (value) => String(value).padStart(2, '0')

function Blood() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const dot = canvas.parentElement.querySelector('.gb-main')
    const ctx = canvas.getContext('2d')
    let frame = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let ratio = 1

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }

    const render = () => {
      frame = requestAnimationFrame(render)

      const style = getComputedStyle(canvas)
      const progress = parseFloat(style.getPropertyValue('--blood')) || 0
      const shake = parseFloat(style.getPropertyValue('--shake')) || 0

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      paintBlood(ctx, width, height, progress)

      if (shake > 0 && shake < 1) {
        const seconds = shake * SHAKE_SECONDS
        const fade = 1 - shake * shake
        const wave =
          Math.sin(seconds * Math.PI * 2 * SHAKE_HZ) +
          0.4 * Math.sin(seconds * Math.PI * 2 * SHAKE_HZ * 1.7 + 1.3)
        const offset = (wave * fade * width * SHAKE_SHARE) / DOT_SCALE
        dot.style.transform = `translateX(${offset.toFixed(2)}px)`
      } else {
        dot.style.transform = ''
      }
    }

    resize()
    render()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      dot.style.transform = ''
    }
  }, [])

  return <canvas ref={canvasRef} className="gb-blood" />
}

function Intro() {
  return (
    <div className="gb-stage" aria-hidden="true">
      {TRAILS.map((step) => (
        <span key={step} className={`gb-dot gb-trail gb-trail-${step}`} />
      ))}
      <span className="gb-dot gb-main" />
      <Blood />
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

function BondActors() {
  return (
    <>
      <p
        className="reveal mb-8 border-l-2 border-red-500 pl-6 text-lg leading-relaxed text-white/75 sm:text-xl"
        style={delay(180)}
      >
        {bondIntro}
      </p>
      <BondActorsList />
    </>
  )
}

function BondActorsList() {
  return (
    <ul className="flex flex-col">
      {bondActors.map((actor, index) => (
        <li
          key={actor.name + index}
          className="reveal"
          style={delay(220 + index * 90)}
        >
          <div className="group flex items-baseline gap-5 border-b border-white/10 px-2 py-5 transition-colors duration-300 hover:bg-white/5 sm:gap-8">
            <span className="w-8 shrink-0 text-2xl font-bold text-red-500/80">
              {pad(index + 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <h3 className="text-xl font-semibold transition-transform duration-300 group-hover:translate-x-1">
                {actor.name}
              </h3>
              <span className="text-white/45">{actor.years}</span>
              <p className="text-white/65 sm:ml-auto sm:text-right">{actor.note}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function BondFilms() {
  return (
    <ul className="flex flex-col">
      {bondFilms.map((film, index) => (
        <li
          key={film.title + index}
          className="reveal"
          style={delay(220 + index * 90)}
        >
          <div className="group flex items-baseline gap-5 border-b border-white/10 px-2 py-5 transition-colors duration-300 hover:bg-white/5 sm:gap-8">
            <span className="w-8 shrink-0 text-2xl font-bold text-red-500/80">
              {pad(index + 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <h3 className="text-xl font-semibold transition-transform duration-300 group-hover:translate-x-1">
                {film.title}
              </h3>
              <span className="text-white/45">{film.year}</span>
              <span className="text-white/45">{film.actor}</span>
              <p className="text-white/65 sm:ml-auto sm:text-right">{film.note}</p>
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

        <FileSection index={1} title="Favorite Games of All Time">
          <Games />
        </FileSection>

        <FileSection index={2} title="Aside from being a Software Developer/Computer Engineering Graduate, I also have a dream of becoming......">
          <Dream />
        </FileSection>

        <FileSection index={3} title="Favorite Movies">
          <Movies />
        </FileSection>

        <FileSection index={4} title="Favorite Bond Actors">
          <BondActors />
        </FileSection>

        <FileSection index={5} title="Favorite Bond Films">
          <BondFilms />
        </FileSection>

        <FileSection index={6} title="Hobbies">
          <Hobbies />
        </FileSection>

        <FileSection index={7} title="Passions">
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

function Gate({ onStart }) {
  useEffect(() => {
    window.addEventListener('pointerdown', onStart, { once: true })
    window.addEventListener('keydown', onStart, { once: true })

    return () => {
      window.removeEventListener('pointerdown', onStart)
      window.removeEventListener('keydown', onStart)
    }
  }, [onStart])

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black px-6 text-center">
      <p className="text-sm tracking-[0.5em] text-white/60">
        CLICK OR PRESS ANY KEY TO START
      </p>
    </div>
  )
}

export default function Secret() {
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion() ? 'done' : 'intro',
  )
  const [started, setStarted] = useState(false)
  const [track, setTrack] = useState(null)
  const [armed, setArmed] = useState(() => prefersReducedMotion())
  const [run, setRun] = useState(0)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef(null)
  const mutedRef = useRef(false)

  useEffect(() => {
    mutedRef.current = muted
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    if (phase !== 'intro') return undefined

    setStarted(false)

    const chosen = pickTrack()
    setTrack(chosen)

    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = AUDIO_VOLUME
    audio.muted = mutedRef.current
    audioRef.current = audio

    let cancelled = false
    let began = false

    const begin = () => {
      if (cancelled || began) return
      began = true

      if (AUDIO_SKIP_S > 0) {
        try {
          audio.currentTime = AUDIO_SKIP_S
        } catch {
          audio.currentTime = 0
        }
      }

      audio
        .play()
        .then(() => {
          if (!cancelled) setStarted(true)
        })
        .catch((error) => {
          if (cancelled) return
          if (error.name === 'NotAllowedError') setPhase('gate')
          else setStarted(true)
        })
    }

    audio.addEventListener('canplaythrough', begin, { once: true })
    const fallback = setTimeout(begin, AUDIO_WAIT_MS)
    audio.src = chosen.src
    audio.load()

    return () => {
      cancelled = true
      clearTimeout(fallback)
      audio.removeEventListener('canplaythrough', begin)
      fadeOutAndStop(audio)
      if (audioRef.current === audio) audioRef.current = null
    }
  }, [phase, run])

  const finish = useCallback(() => {
    setArmed(true)
    setPhase('done')
  }, [])

  useEffect(() => {
    if (phase !== 'intro' || !started) return undefined

    const hit = Math.max(track?.hit ?? DEFAULT_HIT, MIN_HIT)
    const armTimer = setTimeout(() => setArmed(true), (hit + ARM_LAG) * 1000)
    const doneTimer = setTimeout(finish, (hit + TOTAL_LAG) * 1000)
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
  }, [phase, started, run, finish, track])

  const start = useCallback(() => {
    setRun((count) => count + 1)
    setPhase('intro')
  }, [])

  const replay = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setArmed(false)
    setRun((count) => count + 1)
    setPhase('intro')
  }

  const playing = phase === 'intro' && started
  const hit = track?.hit ? Math.max(track.hit, MIN_HIT) : null
  const timeline = hit
    ? {
        '--t-blood': `${hit}s`,
        '--glide-dur': `calc(${hit}s - 1.6s - var(--t-glide))`,
      }
    : undefined

  return (
    <div className="secret-page min-h-screen bg-black" style={timeline}>
      <div className={playing ? 'secret-iris' : ''}>
        <Dossier armed={armed} onReplay={replay} />
      </div>

      {phase === 'intro' ? (
        <>
          {playing ? (
            <Intro key={run} />
          ) : (
            <div className="fixed inset-0 z-50 bg-black" />
          )}
          <button
            type="button"
            onClick={finish}
            className="fixed bottom-6 right-6 z-70 cursor-pointer text-sm tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            SKIP
          </button>
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            className="fixed bottom-6 left-6 z-70 cursor-pointer text-sm tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            {muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        </>
      ) : null}

      {phase === 'gate' ? <Gate onStart={start} /> : null}
    </div>
  )
}
