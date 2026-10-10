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

const DEFAULT_HIT = 10.3
const MIN_HIT = 10.3
const LAST_TRACK_KEY = 'gunbarrel-last-track'

const TRAIL_COUNT = 5
const TRAIL_LAG_SECONDS = 0.1
const RIGHT_STOP_VW = 87.5
const TRAILS = Array.from({ length: TRAIL_COUNT }, (_, index) => index + 1)

const AUDIO_VOLUME = 0.5
const AUDIO_WAIT_MS = 2500
const AUDIO_SKIP_S = 0

const BLOOD_REACH = 1.4
const BLOOD_SECONDS = 6.5
const SWAY_TRIGGER = 0.5
const BLOOD_HOLD_SECONDS = 0.5
const BLOOD_FADE_SECONDS = 1.2
const SWAY_COUNT = 3
const SWAY_SECONDS = 4
const SWAY_SHARE = 0.09
const SWAY_END_ANGLE = ((2 * SWAY_COUNT - 1) * Math.PI) / 2
const DROP_SECONDS = 1
const DROP_PAUSE_SECONDS = 1
const DROP_X_SHARE = 0.17
const DROP_Y_SHARE = 0.26
const RETURN_SECONDS = 1
const CHOREO_SECONDS =
  SWAY_SECONDS + DROP_SECONDS + DROP_PAUSE_SECONDS + RETURN_SECONDS
const DOT_SCALE = 3.125
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

const BARREL_LANDS = 7
const BARREL_START = 62
const BARREL_FULL = 150
const BARREL_OUTER = 560
const BARREL_TWIST = 2.4
const BARREL_GAP = 5
const BARREL_STEPS = 110
const BARREL_ROUGH = 0.09

const noise = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const barrelPath = (land) => {
  const sector = (Math.PI * 2) / BARREL_LANDS
  const mid = land * sector + sector / 2
  const left = []
  const right = []

  for (let step = 0; step <= BARREL_STEPS; step += 1) {
    const radius = BARREL_START * (BARREL_OUTER / BARREL_START) ** (step / BARREL_STEPS)
    const twist = BARREL_TWIST * Math.log(radius / BARREL_START)
    const grow = clamp01((radius - BARREL_START) / (BARREL_FULL - BARREL_START))
    const reach = (sector / 2 - BARREL_GAP / (2 * radius)) * Math.sqrt(grow)
    const rough = BARREL_ROUGH * Math.exp(-((Math.log(radius / 120) / 0.7) ** 2))
    const lead = mid + twist - reach + (noise(step + land * 31) - 0.5) * rough * 0.4
    const trail = mid + twist + reach + (noise(step * 1.7 + land * 17 + 5) - 0.5) * rough

    left.push(`${(Math.cos(lead) * radius).toFixed(2)} ${(Math.sin(lead) * radius).toFixed(2)}`)
    right.push(`${(Math.cos(trail) * radius).toFixed(2)} ${(Math.sin(trail) * radius).toFixed(2)}`)
  }

  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

const BARREL_PATHS = Array.from({ length: BARREL_LANDS }, (_, land) => barrelPath(land))

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

  const poolAmount = 1 - (1 - clamp01(progress / 0.08)) ** 2
  const pool = height * 0.03 * poolAmount
  const flow = 0.5 * clamp01(progress) + 0.5 * smooth(clamp01(progress))

  return pool + height * BLOOD_REACH * flow * (body + lobe * clamp01(progress * 3))
}

const meanDepth = (progress) => {
  const samples = 100
  let total = 0

  for (let index = 0; index <= samples; index += 1) {
    total += sheetDepth(index / samples, progress, 1)
  }

  return total / (samples + 1)
}

const progressAtTrigger = () => {
  let low = 0
  let high = 1

  for (let step = 0; step < 24; step += 1) {
    const mid = (low + high) / 2
    if (meanDepth(mid) < SWAY_TRIGGER) low = mid
    else high = mid
  }

  return high
}

const minDepth = (progress) => {
  const samples = 400
  let lowest = Infinity

  for (let index = 0; index <= samples; index += 1) {
    lowest = Math.min(lowest, sheetDepth(index / samples, progress, 1))
  }

  return lowest
}

const progressAtCover = () => {
  let low = 0
  let high = 1

  for (let step = 0; step < 24; step += 1) {
    const mid = (low + high) / 2
    if (minDepth(mid) < 1) low = mid
    else high = mid
  }

  return high
}

const SWAY_DELAY_SECONDS = progressAtTrigger() * BLOOD_SECONDS
const BLOOD_OUT_DELAY_SECONDS =
  progressAtCover() * BLOOD_SECONDS + BLOOD_HOLD_SECONDS
const ARM_LAG = SWAY_DELAY_SECONDS + CHOREO_SECONDS + 0.4
const TOTAL_LAG = SWAY_DELAY_SECONDS + CHOREO_SECONDS + 1.5

const paintBlood = (ctx, width, height, progress) => {
  ctx.clearRect(0, 0, width, height)
  if (progress <= 0) return

  const fill = ctx.createLinearGradient(0, 0, 0, height)
  fill.addColorStop(0, '#3a0414')
  fill.addColorStop(0.3, '#5e0a22')
  fill.addColorStop(0.65, '#800020')
  fill.addColorStop(1, '#8f1030')

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
  vignette.addColorStop(0, 'rgba(25, 0, 10, 0)')
  vignette.addColorStop(1, 'rgba(25, 0, 10, 0.5)')
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

const lerp = (from, to, amount) => from + (to - from) * amount

const swayPath = (seconds, width, height) => {
  const reach = width * SWAY_SHARE
  const dropX = width * DROP_X_SHARE
  const dropY = height * DROP_Y_SHARE

  if (seconds < SWAY_SECONDS) {
    const angle = (seconds / SWAY_SECONDS) * SWAY_END_ANGLE
    return { x: -Math.sin(angle) * reach, y: 0 }
  }

  const dropped = seconds - SWAY_SECONDS

  if (dropped < DROP_SECONDS) {
    const amount = smooth(clamp01(dropped / DROP_SECONDS))
    return { x: lerp(-reach, dropX, amount), y: lerp(0, dropY, amount) }
  }

  const held = dropped - DROP_SECONDS

  if (held < DROP_PAUSE_SECONDS) {
    return { x: dropX, y: dropY }
  }

  const amount = smooth(clamp01((held - DROP_PAUSE_SECONDS) / RETURN_SECONDS))
  return { x: lerp(dropX, 0, amount), y: lerp(dropY, 0, amount) }
}

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
        const { x, y } = swayPath(shake * CHOREO_SECONDS, width, height)
        const offsetX = (x / DOT_SCALE).toFixed(2)
        const offsetY = (y / DOT_SCALE).toFixed(2)
        dot.style.transform = `translate(${offsetX}px, ${offsetY}px)`
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

function Barrel() {
  return (
    <svg className="gb-barrel" viewBox="-400 -400 800 800" aria-hidden="true">
      <defs>
        <radialGradient
          id="gb-barrel-fill"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="400"
        >
          <stop offset="0.15" stopColor="#f1eef6" />
          <stop offset="0.5" stopColor="#d8d5dd" />
          <stop offset="1" stopColor="#c4c2c9" />
        </radialGradient>
      </defs>
      {BARREL_PATHS.map((d, index) => (
        <path key={index} d={d} fill="url(#gb-barrel-fill)" />
      ))}
    </svg>
  )
}

function Intro() {
  return (
    <div className="gb-stage" aria-hidden="true">
      {TRAILS.map((step) => (
        <span
          key={step}
          className="gb-dot gb-trail"
          style={{
            '--x': `${(RIGHT_STOP_VW * step) / (TRAIL_COUNT + 1)}vw`,
            '--at': `calc(var(--t0) + var(--sweep) * ${step / (TRAIL_COUNT + 1)} + ${TRAIL_LAG_SECONDS}s)`,
          }}
        />
      ))}
      <span className="gb-dot gb-main">
        <Barrel />
      </span>
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
  const [audioActive, setAudioActive] = useState(false)
  const audioRef = useRef(null)
  const mutedRef = useRef(false)
  const keepAudioRef = useRef(false)

  useEffect(() => {
    mutedRef.current = muted
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  useEffect(
    () => () => {
      if (audioRef.current) fadeOutAndStop(audioRef.current)
    },
    [],
  )

  useEffect(() => {
    if (phase !== 'intro') return undefined

    setStarted(false)

    if (audioRef.current) {
      fadeOutAndStop(audioRef.current)
      audioRef.current = null
      setAudioActive(false)
    }

    const chosen = pickTrack()
    setTrack(chosen)

    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = AUDIO_VOLUME
    audio.muted = mutedRef.current
    audioRef.current = audio

    let cancelled = false
    let began = false

    const onEnded = () => {
      if (audioRef.current === audio) audioRef.current = null
      setAudioActive(false)
    }

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
          if (cancelled) return
          setStarted(true)
          setAudioActive(true)
        })
        .catch((error) => {
          if (cancelled) return
          if (error.name === 'NotAllowedError') setPhase('gate')
          else setStarted(true)
        })
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('canplaythrough', begin, { once: true })
    const fallback = setTimeout(begin, AUDIO_WAIT_MS)
    audio.src = chosen.src
    audio.load()

    return () => {
      cancelled = true
      clearTimeout(fallback)
      audio.removeEventListener('canplaythrough', begin)

      if (keepAudioRef.current && !audio.paused && !audio.ended) {
        keepAudioRef.current = false
        return
      }

      keepAudioRef.current = false
      audio.removeEventListener('ended', onEnded)
      fadeOutAndStop(audio)
      if (audioRef.current === audio) audioRef.current = null
      setAudioActive(false)
    }
  }, [phase, run])

  const skip = useCallback(() => {
    keepAudioRef.current = false
    setArmed(true)
    setPhase('done')
  }, [])

  const finish = useCallback(() => {
    keepAudioRef.current = true
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
        skip()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(armTimer)
      clearTimeout(doneTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase, started, run, finish, skip, track])

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
  const timeline = {
    '--choreo': `${CHOREO_SECONDS}s`,
    '--stop': `${RIGHT_STOP_VW}vw`,
    '--blood-dur': `${BLOOD_SECONDS}s`,
    '--sway-delay': `${SWAY_DELAY_SECONDS}s`,
    '--blood-out-delay': `${BLOOD_OUT_DELAY_SECONDS}s`,
    '--blood-fade': `${BLOOD_FADE_SECONDS}s`,
    '--open': DOT_SCALE,
    ...(hit
      ? {
          '--t0': `calc(${hit}s - var(--sweep) - var(--open-dur) - var(--pause) - var(--glide-dur) - var(--hold))`,
        }
      : {}),
  }

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
            onClick={skip}
            className="fixed bottom-6 right-6 z-70 cursor-pointer text-sm tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            SKIP
          </button>
        </>
      ) : null}

      {phase === 'intro' || audioActive ? (
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          className="fixed bottom-6 left-6 z-70 cursor-pointer text-sm tracking-[0.3em] text-white/50 transition-colors hover:text-white"
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      ) : null}

      {phase === 'gate' ? <Gate onStart={start} /> : null}
    </div>
  )
}
