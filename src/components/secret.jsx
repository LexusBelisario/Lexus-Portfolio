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
  endCard,
} from '../data/secret'
import './secret.css'

const AUDIO_LEAD_SECONDS = 0
const LAST_TRACK_KEY = 'gunbarrel-last-track'

const TRAIL_COUNT = 5
const TRAIL_LAG_SECONDS = 0.1
const RIGHT_STOP_VW = 94
const TRAILS = Array.from({ length: TRAIL_COUNT }, (_, index) => index + 1)

const AUDIO_VOLUME = 0.5

const TRACK_VOLUMES = {
  yolt: 1.5,
}

const trackVolume = (track) => {
  const match = Object.entries(TRACK_VOLUMES).find(([key]) => track.src.includes(key))
  return match ? match[1] : AUDIO_VOLUME
}
const AUDIO_WAIT_MS = 2500
const AUDIO_SKIP_S = 0

const GUNSHOT_SRC = '/audio/gunshot.mp3'
const GUNSHOT_VOLUME = 0.4
const GUNSHOT_OFFSET_SECONDS = 0

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
const DOT_SCALE = 3.4
const PHONE_QUERY = '(max-width: 767px) and (orientation: portrait)'
const PHONE_DOT_SCALE = 4.5

const dotScaleNow = () =>
  window.matchMedia(PHONE_QUERY).matches ? PHONE_DOT_SCALE : DOT_SCALE
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

const barrelImages = import.meta.glob('../assets/images/barrel.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const BARREL_IMAGE = Object.values(barrelImages)[0] ?? ''

const BARREL_IMAGE_ASPECT = 2576 / 1449
const BARREL_IMAGE_FOCUS_X = 0.5361
const BARREL_IMAGE_FOCUS_Y = 0.4993
const BARREL_IMAGE_RADIUS = 0.1362
const BARREL_IMAGE_FADE_X = 0.12
const BARREL_IMAGE_FADE_Y = 0.015

const BARREL_IMAGE_WIDTH = 50 / BARREL_IMAGE_RADIUS
const BARREL_IMAGE_HEIGHT = BARREL_IMAGE_WIDTH / BARREL_IMAGE_ASPECT
const BARREL_IMAGE_LEFT = -BARREL_IMAGE_FOCUS_X * BARREL_IMAGE_WIDTH
const BARREL_IMAGE_TOP = -BARREL_IMAGE_FOCUS_Y * BARREL_IMAGE_HEIGHT

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const smooth = (value) => value * value * (3 - 2 * value)

const BARREL_LANDS = 7
const BARREL_START = 62
const BARREL_FULL = 150
const BARREL_OUTER = 560
const BARREL_TWIST = 2.4
const BARREL_GAP = 5
const BARREL_STEPS = 110
const BARREL_ROUGH = 0.035
const BARREL_SHADOW_DEG = 2.9
const BARREL_RING_START = 66
const BARREL_RING_STEP = 1.045

const noise = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const barrelLand = (land) => {
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

  return {
    outline: `M${left.join('L')}L${[...right].reverse().join('L')}Z`,
    lead: `M${left.join('L')}`,
    trail: `M${right.join('L')}`,
  }
}

const BARREL_GEOMETRY = Array.from({ length: BARREL_LANDS }, (_, land) => barrelLand(land))

const BARREL_RINGS = []
for (let radius = BARREL_RING_START; radius < BARREL_OUTER; radius *= BARREL_RING_STEP) {
  BARREL_RINGS.push(Number(radius.toFixed(1)))
}

const BARREL_BORE = `M-${BARREL_OUTER} 0a${BARREL_OUTER} ${BARREL_OUTER} 0 1 0 ${BARREL_OUTER * 2} 0a${BARREL_OUTER} ${BARREL_OUTER} 0 1 0 -${BARREL_OUTER * 2} 0ZM-50 0a50 50 0 1 1 100 0a50 50 0 1 1 -100 0Z`

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
  fill.addColorStop(0, '#4d0000')
  fill.addColorStop(0.3, '#660000')
  fill.addColorStop(0.65, '#800000')
  fill.addColorStop(1, '#800000')

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
  vignette.addColorStop(0, 'rgba(20, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(20, 0, 0, 0.5)')
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

const readSeconds = (name, fallback) => {
  const node = document.querySelector('.secret-page')
  if (!node) return fallback

  const value = getComputedStyle(node).getPropertyValue(name).trim()
  const seconds = value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value)

  return Number.isFinite(seconds) ? seconds : fallback
}

const sequenceSeconds = () =>
  readSeconds('--sweep', 0) +
  readSeconds('--open-dur', 0) +
  readSeconds('--pause', 0) +
  readSeconds('--glide-dur', 0) +
  readSeconds('--hold', 0)

const bloodStartSeconds = (track) => {
  const sequence = sequenceSeconds()
  return track?.hit ? Math.max(track.hit, sequence) : sequence + AUDIO_LEAD_SECONDS
}

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
    let dotScale = dotScaleNow()

    const resize = () => {
      dotScale = dotScaleNow()
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
        const offsetX = (x / dotScale).toFixed(2)
        const offsetY = (y / dotScale).toFixed(2)
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
  if (BARREL_IMAGE) {
    return (
      <svg className="gb-barrel" viewBox="-400 -400 800 800" aria-hidden="true">
        <defs>
          <linearGradient id="gb-fade-x-grad">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset={BARREL_IMAGE_FADE_X} stopColor="#fff" stopOpacity="1" />
            <stop offset={1 - BARREL_IMAGE_FADE_X} stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gb-fade-y-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset={BARREL_IMAGE_FADE_Y} stopColor="#fff" stopOpacity="1" />
            <stop offset={1 - BARREL_IMAGE_FADE_Y} stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask
            id="gb-fade-x"
            maskUnits="userSpaceOnUse"
            x={BARREL_IMAGE_LEFT}
            y={BARREL_IMAGE_TOP}
            width={BARREL_IMAGE_WIDTH}
            height={BARREL_IMAGE_HEIGHT}
          >
            <rect
              x={BARREL_IMAGE_LEFT}
              y={BARREL_IMAGE_TOP}
              width={BARREL_IMAGE_WIDTH}
              height={BARREL_IMAGE_HEIGHT}
              fill="url(#gb-fade-x-grad)"
            />
          </mask>
          <mask
            id="gb-fade-y"
            maskUnits="userSpaceOnUse"
            x={BARREL_IMAGE_LEFT}
            y={BARREL_IMAGE_TOP}
            width={BARREL_IMAGE_WIDTH}
            height={BARREL_IMAGE_HEIGHT}
          >
            <rect
              x={BARREL_IMAGE_LEFT}
              y={BARREL_IMAGE_TOP}
              width={BARREL_IMAGE_WIDTH}
              height={BARREL_IMAGE_HEIGHT}
              fill="url(#gb-fade-y-grad)"
            />
          </mask>
        </defs>
        <g mask="url(#gb-fade-y)">
          <image
            href={BARREL_IMAGE}
            x={BARREL_IMAGE_LEFT}
            y={BARREL_IMAGE_TOP}
            width={BARREL_IMAGE_WIDTH}
            height={BARREL_IMAGE_HEIGHT}
            preserveAspectRatio="none"
            mask="url(#gb-fade-x)"
          />
        </g>
      </svg>
    )
  }

  return (
    <svg className="gb-barrel" viewBox="-400 -400 800 800" aria-hidden="true">
      <defs>
        <radialGradient id="gb-bore" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={BARREL_OUTER}>
          <stop offset="0.09" stopColor="#8a8690" />
          <stop offset="0.2" stopColor="#55525b" />
          <stop offset="0.45" stopColor="#2b2930" />
          <stop offset="1" stopColor="#0b0a0d" />
        </radialGradient>
        <radialGradient id="gb-land" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={BARREL_OUTER}>
          <stop offset="0.1" stopColor="#fbfaff" />
          <stop offset="0.22" stopColor="#e6e3ec" />
          <stop offset="0.4" stopColor="#c3c0ca" />
          <stop offset="0.7" stopColor="#8d8a95" />
          <stop offset="1" stopColor="#4f4c55" />
        </radialGradient>
        <radialGradient id="gb-edge" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={BARREL_OUTER}>
          <stop offset="0.1" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="gb-vignette" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="400">
          <stop offset="0.28" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.78" />
        </radialGradient>
        <radialGradient id="gb-spill" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="140">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gb-light" gradientUnits="userSpaceOnUse" x1="-320" y1="-320" x2="320" y2="320">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="gb-crown" gradientUnits="userSpaceOnUse" x1="-60" y1="-60" x2="60" y2="60">
          <stop offset="0" stopColor="#fdfcff" />
          <stop offset="0.5" stopColor="#bdbac3" />
          <stop offset="1" stopColor="#6f6c76" />
        </linearGradient>
      </defs>
      <path d={BARREL_BORE} fill="url(#gb-bore)" fillRule="evenodd" />
      {BARREL_GEOMETRY.map(({ outline }, index) => (
        <path
          key={`shadow-${index}`}
          d={outline}
          fill="#000"
          opacity="0.45"
          transform={`rotate(${BARREL_SHADOW_DEG})`}
        />
      ))}
      {BARREL_GEOMETRY.map(({ outline }, index) => (
        <path key={`land-${index}`} d={outline} fill="url(#gb-land)" />
      ))}
      <g fill="none" strokeWidth="0.6">
        {BARREL_RINGS.map((radius, index) => (
          <circle
            key={radius}
            r={radius}
            stroke={index % 2 ? '#000' : '#fff'}
            strokeOpacity={index % 2 ? 0.045 : 0.03}
          />
        ))}
      </g>
      {BARREL_GEOMETRY.map(({ lead }, index) => (
        <path
          key={`lead-${index}`}
          d={lead}
          fill="none"
          stroke="url(#gb-edge)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {BARREL_GEOMETRY.map(({ trail }, index) => (
        <path
          key={`trail-${index}`}
          d={trail}
          fill="none"
          stroke="#000"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
      ))}
      <path d={BARREL_BORE} fill="url(#gb-light)" fillRule="evenodd" />
      <circle r={BARREL_OUTER} fill="url(#gb-vignette)" />
      <circle r="140" fill="url(#gb-spill)" />
      <circle r="55.5" fill="none" stroke="url(#gb-crown)" strokeWidth="10" />
      <circle r="50.6" fill="none" stroke="#3a3840" strokeWidth="1.2" />
      <circle r="61.6" fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="1.4" />
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

const STAMP_LABELS = ['TOP SECRET', 'RESTRICTED', 'MI6 DOSSIER']
const STAMP_TILTS = [-6, 4, -3]

function Stamp({ index, small = false, className = '' }) {
  const slot = index % STAMP_LABELS.length

  return (
    <span
      className={`stamp bond-type ${small ? 'stamp-sm' : ''} ${className}`}
      style={{ '--tilt': `${STAMP_TILTS[slot]}deg` }}
      aria-hidden="true"
    >
      {STAMP_LABELS[slot]}
    </span>
  )
}

const AGENT_STATUSES = [
  'Licensed To Code',
  'Licensed To Kill',
  'Licensed To Vibe',
  'Licensed To Ship',
]
const AGENT_CYCLE_MS = 2800

function AgentBadge({ active }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) return undefined

    const timer = setInterval(() => {
      setStep((value) => (value + 1) % AGENT_STATUSES.length)
    }, AGENT_CYCLE_MS)

    return () => clearInterval(timer)
  }, [active])

  const status = AGENT_STATUSES[step]

  return (
    <div
      className="agent-badge reveal bond-type relative w-fit border border-[#c9a45c] bg-[#121212]/80"
      style={delay(0)}
    >
      <span className="agent-slot" aria-hidden="true" />
      <div className="flex items-center justify-between gap-8 border-b border-[#c9a45c]/45 px-4 py-1.5 text-xs tracking-widest text-[#c9a45c]">
        <span>MI6 DOSSIER NO. 007</span>
        <span className="size-2 rounded-full bg-[#b81d1d] motion-safe:animate-pulse" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5 px-4 py-3 text-sm tracking-widest sm:text-base">
        <p className="font-bold text-[#e9e5db]">LEXUS / AGENT - 062123</p>
        <p className="flex flex-wrap gap-x-2">
          <span className="font-bold text-[#b81d1d]">STATUS:</span>
          <span
            key={`${active}-${status}`}
            className="agent-status font-bold text-[#c9a45c]"
            style={{ '--chars': status.length }}
            aria-hidden="true"
          >
            {status}
          </span>
        </p>
      </div>
      <span className="sr-only">Status: {AGENT_STATUSES.join(', ')}</span>
    </div>
  )
}

const DOT_TONES = ['teal', 'yellow', 'green', 'magenta', 'orange']
const ROW_TONES = ['wine', 'red', 'orange', 'yellow', 'sage', 'green', 'teal', 'magenta', 'wine']

const MARGIN_SPOTS = [
  { top: '11rem', kind: 'pair' },
  { top: '22%', kind: 'cross' },
  { top: '37%', kind: 'block' },
  { top: '53%', kind: 'columns' },
  { top: '69%', kind: 'cross' },
  { top: '85%', kind: 'pair' },
]

function DotBlock({ cols, rows, tones, size = '0.65rem', pitch = '0.95rem', className = '' }) {
  return (
    <span
      className={`dot-block ${className}`}
      style={{ '--cols': cols, '--size': size, '--pitch': pitch }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }, (_, index) => (
        <span
          key={index}
          className="binder-dot"
          style={{ '--i': index, background: `var(--bd-${tones[(index % cols) % tones.length]})` }}
        />
      ))}
    </span>
  )
}

function DotRow({ className = '' }) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
      {ROW_TONES.map((tone, index) => (
        <span
          key={tone + index}
          className="binder-pop size-3 rounded-full sm:size-3.5"
          style={{ '--i': index, background: `var(--bd-${tone})` }}
        />
      ))}
    </span>
  )
}

function RankTile({ value, label, tone = 'red', className = '' }) {
  return (
    <span className={`rank-tile rank-tile-${tone} ${className}`} aria-hidden="true">
      {label ?? pad(value)}
    </span>
  )
}

function MarginDots() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden xl:block"
      style={{ '--ms': 'clamp(0.65rem, 0.95vw, 1.25rem)', '--mp': 'clamp(0.95rem, 1.4vw, 1.9rem)' }}
      aria-hidden="true"
    >
      {MARGIN_SPOTS.map((spot) => (
        <div key={spot.top} className="absolute left-5" style={{ top: spot.top }}>
          {spot.kind === 'cross' ? (
            <div className="relative h-[calc(var(--mp)*4+var(--ms))] w-[calc(var(--mp)*4+var(--ms))]">
              <DotBlock
                cols={1}
                rows={5}
                tones={['red']}
                size="var(--ms)"
                pitch="var(--mp)"
                className="absolute left-[calc(var(--mp)*3)] top-0"
              />
              <DotBlock
                cols={5}
                rows={1}
                tones={['wine', 'wine', 'wine', 'red', 'red']}
                size="var(--ms)"
                pitch="var(--mp)"
                className="absolute left-0 top-[calc(var(--mp)*2)]"
              />
            </div>
          ) : null}
          {spot.kind === 'pair' ? (
            <div className="relative h-[calc(var(--mp)*5)] w-[calc(var(--mp)*3)]">
              <DotBlock cols={1} rows={2} tones={['magenta']} size="var(--ms)" pitch="var(--mp)" />
              <DotBlock
                cols={1}
                rows={1}
                tones={['green']}
                size="var(--ms)"
                pitch="var(--mp)"
                className="absolute left-[calc(var(--mp)*2.3)] top-[calc(var(--mp)*0.5)]"
              />
              <DotBlock
                cols={1}
                rows={1}
                tones={['yellow']}
                size="var(--ms)"
                pitch="var(--mp)"
                className="absolute left-[calc(var(--mp)*1.2)] top-[calc(var(--mp)*3.6)]"
              />
            </div>
          ) : null}
          {spot.kind === 'block' ? (
            <DotBlock cols={3} rows={4} tones={['teal']} size="var(--ms)" pitch="var(--mp)" />
          ) : null}
          {spot.kind === 'columns' ? (
            <div className="flex items-start gap-[var(--mp)]">
              <DotBlock cols={2} rows={7} tones={['teal', 'yellow']} size="var(--ms)" pitch="var(--mp)" />
              <div className="flex flex-col items-center gap-[calc(var(--mp)*0.5)]">
                <DotBlock cols={1} rows={5} tones={['green']} size="var(--ms)" pitch="var(--mp)" />
                <span className="size-[calc(var(--ms)*1.6)] rounded-full bg-[var(--bd-red)]" />
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

const TRAIL_FADE_SECONDS = 2.8
const TRAIL_MIN_ROWS_PER_SECOND = 5
const TRAIL_MAX_ROWS_PER_SECOND = 13
const TRAIL_MOVING_THRESHOLD = 30
const TRAIL_HOLD_MS = 160
const TRAIL_PATTERNS = [
  ['orange', 'orange', 'red', 'orange', 'orange', 'yellow', 'orange', 'sage'],
  ['wine', 'red', 'wine', 'wine', 'green', 'red', 'wine', 'teal'],
]
const TRAIL_KEYFRAMES = [
  { opacity: 1, transform: 'scale(1)' },
  { opacity: 0.8, transform: 'scale(0.95)', offset: 0.2 },
  { opacity: 0, transform: 'scale(0.6)' },
]

const clampRange = (value, low, high) => Math.min(high, Math.max(low, value))

function ScrollTrail() {
  const trailRef = useRef(null)
  const [layout, setLayout] = useState({ cols: 1, rows: 0 })

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const node = trailRef.current
    const host = node.closest('.secret-page') ?? document.documentElement
    const wide = window.matchMedia('(min-width: 1280px)')
    const animations = new Map()

    let cols = 1
    let rows = 0
    let frame = 0
    let running = false
    let wasMoving = false
    let last = 0
    let lastEventY = window.scrollY
    let lastScrollAt = -1000
    let pending = 0
    let velocity = 0
    let dir = 1
    let head = 0

    const measure = () => {
      const pitch = parseFloat(getComputedStyle(host).getPropertyValue('--rp')) || 14

      cols = wide.matches ? 2 : 1
      rows = Math.ceil(window.innerHeight / pitch) + 1
      animations.forEach((animation) => animation.cancel())
      animations.clear()
      setLayout({ cols, rows })
    }

    const light = (row) => {
      const wrapped = ((row % rows) + rows) % rows

      for (let col = 0; col < cols; col += 1) {
        const index = wrapped * cols + col
        const dot = node.children[index]
        if (!dot) continue

        animations.get(index)?.cancel()
        animations.set(
          index,
          dot.animate(TRAIL_KEYFRAMES, {
            duration: TRAIL_FADE_SECONDS * 1000,
            easing: 'linear',
          }),
        )
      }
    }

    const step = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      const instant = pending / dt
      pending = 0
      velocity += (instant - velocity) * (1 - Math.exp(-dt * 5))

      const moving =
        now - lastScrollAt < TRAIL_HOLD_MS && Math.abs(velocity) > TRAIL_MOVING_THRESHOLD

      if (moving && rows > 0) {
        const nextDir = velocity > 0 ? 1 : -1

        if (!wasMoving || nextDir !== dir) {
          dir = nextDir
          head = dir > 0 ? 0 : rows - 1
          light(Math.floor(head))
        }

        const speed = clampRange(
          Math.abs(velocity) / 140,
          TRAIL_MIN_ROWS_PER_SECOND,
          TRAIL_MAX_ROWS_PER_SECOND,
        )
        let cursor = Math.floor(head)
        head += dir * speed * dt
        const target = Math.floor(head)

        while (cursor !== target) {
          cursor += dir
          light(cursor)
        }

        head = ((head % rows) + rows) % rows
      }

      wasMoving = moving

      if (moving) {
        frame = requestAnimationFrame(step)
      } else {
        running = false
        velocity = 0
      }
    }

    const wake = () => {
      if (running) return
      running = true
      last = performance.now()
      frame = requestAnimationFrame(step)
    }

    const onScroll = () => {
      const y = window.scrollY
      pending += y - lastEventY
      lastEventY = y
      lastScrollAt = performance.now()
      wake()
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      animations.forEach((animation) => animation.cancel())
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={trailRef} className="dot-trail" style={{ '--tcols': layout.cols }} aria-hidden="true">
      {Array.from({ length: layout.rows * layout.cols }, (_, index) => {
        const row = Math.floor(index / layout.cols)
        const col = index % layout.cols
        const pattern = TRAIL_PATTERNS[col % TRAIL_PATTERNS.length]

        return (
          <span
            key={index}
            className="trail-dot"
            style={{ background: `var(--bd-${pattern[row % pattern.length]})` }}
          />
        )
      })}
    </div>
  )
}

function FileSection({ index, title, children }) {
  const [ref, inView] = useInView(0.15)

  return (
    <section ref={ref} className={inView ? 'about-in' : ''}>
      <div className="reveal flex items-start gap-4 sm:items-center sm:gap-5" style={delay(0)}>
        <span className="bond-type grid size-11 shrink-0 place-items-center rounded-full border border-[#c9a45c]/70 text-base tracking-widest text-[#c9a45c] sm:size-14 sm:text-lg">
          {pad(index)}
        </span>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        <Stamp index={index - 1} className="ml-auto hidden shrink-0 md:inline-block" />
      </div>

      <div className="relative mb-12 mt-6">
        <div
          className="reveal-line flex h-px bg-[#e9e5db]/20"
          style={{ ...delay(120), transformOrigin: 'left center' }}
        >
          <span className="-mt-px h-[3px] w-16 bg-[#b81d1d]" />
        </div>
        <DotRow className="absolute right-0 top-1/2 -translate-y-1/2" />
      </div>

      {children}
    </section>
  )
}

const gameImageFiles = import.meta.glob('../assets/secrets/games/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const GAME_IMAGES = Object.fromEntries(
  Object.entries(gameImageFiles).map(([path, url]) => [
    slugify(path.split('/').pop().replace(/\.[^.]+$/, '')),
    url,
  ]),
)

const gameImage = (game) =>
  game.image || GAME_IMAGES[slugify(game.file ?? game.title)] || ''

const movieImageFiles = import.meta.glob('../assets/secrets/movies/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const MOVIE_IMAGES = Object.fromEntries(
  Object.entries(movieImageFiles).map(([path, url]) => [
    slugify(path.split('/').pop().replace(/\.[^.]+$/, '')),
    url,
  ]),
)

const movieImage = (movie) =>
  movie.image || MOVIE_IMAGES[slugify(movie.file ?? movie.title)] || ''

const bondImageFiles = import.meta.glob('../assets/secrets/bonds/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const BOND_IMAGES = Object.fromEntries(
  Object.entries(bondImageFiles).map(([path, url]) => [
    slugify(path.split('/').pop().replace(/\.[^.]+$/, '')),
    url,
  ]),
)

const bondImage = (actor) =>
  actor.image || BOND_IMAGES[slugify(actor.file ?? actor.name)] || ''

const GAMES_INTRO = [
  'I am such a huge gamer, and gaming has been a part of my life since my childhood up to now.',
  "Some games I finish in a weekend and never touch again. Others I keep going back to for years, and a few I still think about when I'm supposed to be working.",
  'It even leaked into school. My 2nd-year pet store system has a Watch Dogs theme, ctOS and all.',
  "Here are the six I'd pick if you made me choose.",
]

function Games() {
  return (
    <>
      <div className="mb-10 flex max-w-3xl flex-col gap-4 border-l-2 border-[#b81d1d] pl-6 text-lg leading-relaxed text-[#e9e5db]/85 sm:text-xl">
        {GAMES_INTRO.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 24)}
            className="reveal"
            style={delay(180 + index * 120)}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <ul className="flex flex-col gap-16 lg:gap-24">
        {games.map((game, index) => (
          <ShowcaseRow
            key={game.title + index}
            item={game}
            index={index}
            image={gameImage(game)}
          />
        ))}
      </ul>
    </>
  )
}

function ScalesIcon({ className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M32 12v44" />
      <path d="M20 56h24" />
      <circle cx="32" cy="9" r="3" />
      <path d="M8 18h48" />
      <path d="M10 18 3 38M10 18l7 20" />
      <path d="M3 38h14c0 4-3 6.5-7 6.5S3 42 3 38Z" />
      <path d="M54 18l-7 20M54 18l7 20" />
      <path d="M47 38h14c0 4-3 6.5-7 6.5S47 42 47 38Z" />
    </svg>
  )
}

function Dream() {
  const story = Array.isArray(dream.story) ? dream.story : [dream.story]
  const lead = story.slice(0, -1)
  const closing = story[story.length - 1]
  const roleStart = 800
  const roleStep = 70
  const roleEnd = roleStart + [...dream.role].length * roleStep

  return (
    <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
      <div className="relative">
        <div
          className="reveal-pop pointer-events-none absolute -left-4 top-1/2 size-[min(70vw,24rem)] -translate-y-1/2 text-[#c9a45c]/10 sm:-left-10"
          style={delay(600)}
          aria-hidden="true"
        >
          <ScalesIcon className="size-full" />
        </div>

        <div className="relative">
          <p
            className="reveal text-sm tracking-[0.35em] text-[#e9e5db]/85"
            style={delay(450)}
          >
            {dream.label.toUpperCase()}
          </p>
          <h3
            aria-label={dream.role}
            className="mt-4 text-6xl font-extrabold leading-none tracking-tight sm:text-8xl"
          >
            {[...dream.role].map((char, index) =>
              char === ' ' ? (
                <span key={index} className="inline-block w-[0.3em]" aria-hidden="true" />
              ) : (
                <span
                  key={index}
                  className="reveal inline-block"
                  style={delay(roleStart + index * roleStep)}
                  aria-hidden="true"
                >
                  {char}
                </span>
              ),
            )}
          </h3>
          {dream.nameplate ? (
            <p
              className="reveal mt-8 inline-flex rounded-md border border-[#c9a45c]/40 bg-linear-to-b from-[#c9a45c]/15 to-[#b81d1d]/10 px-4 py-2 text-xs font-semibold tracking-[0.35em] text-[#c9a45c]"
              style={delay(roleEnd + 250)}
            >
              {dream.nameplate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {lead.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 24)}
            className="reveal text-lg leading-relaxed text-[#e9e5db]/85 sm:text-xl"
            style={delay(900 + index * 150)}
          >
            {paragraph}
          </p>
        ))}
        <blockquote
          className="reveal mt-2 border-l-2 border-[#b81d1d] pl-6 text-xl font-medium leading-relaxed text-[#e9e5db] sm:text-2xl"
          style={delay(900 + lead.length * 150 + 150)}
        >
          {closing}
        </blockquote>
      </div>
    </div>
  )
}

function ShowcaseRow({ item, index, image, imageClass = 'object-cover' }) {
  const [ref, inView] = useInView(0.15, '0px 0px -10% 0px', true)
  const hasBody = Boolean(item.quote || item.note)

  return (
    <li
      ref={ref}
      className={`transition-opacity duration-1000 ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${inView ? 'opacity-100' : 'opacity-0'}`}
    >
      <article className="group grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
        <div className={`photo-wrap lg:row-span-2 dots-${DOT_TONES[index % DOT_TONES.length]}`}>
          <span className="dot-ring" aria-hidden="true" />
          <div className="dossier-photo relative aspect-[2/3] overflow-hidden bg-[#e9e5db]/5">
            {image ? (
              <img
                src={image}
                alt={item.title}
                loading="lazy"
                className={`develop size-full ${imageClass} group-hover:scale-105 ${inView ? 'developed' : ''}`}
              />
            ) : (
              <span className="bond-type absolute bottom-5 left-6 text-5xl font-bold tracking-widest text-[#e9e5db]/15 transition-colors duration-300 group-hover:text-[#b81d1d]">
                {pad(index + 1)}
              </span>
            )}
            <Stamp index={index} small className="absolute right-4 top-4 z-[3]" />
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 lg:col-span-2 lg:pb-6">
          {item.mention ? (
            <span className="bond-type text-sm tracking-widest text-[#c9a45c]">Honourable mention</span>
          ) : (
            <RankTile value={index + 1} className="rank-tile-sm" />
          )}
          <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-5xl">
            {item.title}
          </h3>
          <span className="bond-type tracking-widest text-[#c9a45c]">{item.year}</span>
        </div>

        {hasBody ? (
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-2 lg:pt-6">
            {item.quote ? (
              <blockquote className="bond-type border-l-2 border-[#b81d1d] pl-4 text-base leading-relaxed tracking-wide text-[#e9e5db] sm:pl-5 sm:text-xl sm:tracking-wider">
                &ldquo;{item.quote}&rdquo;
                {item.quoteBy ? (
                  <footer className="mt-3 text-sm tracking-widest text-[#c9a45c]">
                    {item.quoteBy}
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
            {item.note ? (
              <p className="text-lg font-normal leading-relaxed text-[#e9e5db]/85">{item.note}</p>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  )
}

function Movies() {
  return (
    <ul className="flex flex-col gap-16 lg:gap-24">
      {movies.map((movie, index) => (
        <ShowcaseRow
          key={movie.title + index}
          item={movie}
          index={index}
          image={movieImage(movie)}
        />
      ))}
    </ul>
  )
}

function BondActors() {
  return (
    <>
      <p
        className="reveal mb-10 border-l-2 border-[#b81d1d] pl-6 text-lg font-normal leading-relaxed text-[#e9e5db]/85 sm:text-xl"
        style={delay(180)}
      >
        {bondIntro}
      </p>
      <BondActorsList />
    </>
  )
}

function ActorCard({ actor, index }) {
  const [ref, inView] = useInView(0.15, '0px 0px -10% 0px', true)
  const lead = index === 0
  const image = bondImage(actor)

  return (
    <li
      ref={ref}
      className={`transition-opacity duration-1000 ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${inView ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDelay: `${index * 140}ms` }}
    >
      <article className="group">
        <div className={`photo-wrap dots-${DOT_TONES[index % DOT_TONES.length]}`}>
          <span className="dot-ring" aria-hidden="true" />
          <div className="dossier-photo relative aspect-[2/3] overflow-hidden bg-[#e9e5db]/5">
            {image ? (
              <img
                src={image}
                alt={actor.name}
                loading="lazy"
                className={`develop size-full object-cover object-top group-hover:scale-105 ${inView ? 'developed' : ''}`}
              />
            ) : null}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/85 to-transparent"
              aria-hidden="true"
            />
            <RankTile
              value={index + 1}
              tone={lead ? 'red' : 'brown'}
              className="absolute bottom-5 left-5 z-[3]"
            />
            <Stamp index={index + 1} small className="absolute right-4 top-4 z-[3]" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <h3 className="text-xl font-semibold leading-tight sm:text-2xl">{actor.name}</h3>
          <span className="bond-type text-sm tracking-widest text-[#c9a45c]">{actor.years}</span>
          {actor.note ? (
            <p className="mt-2 font-normal leading-relaxed text-[#e9e5db]/85">{actor.note}</p>
          ) : null}
        </div>
      </article>
    </li>
  )
}

function BondActorsList() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:items-end lg:gap-x-6">
      {bondActors.map((actor, index) => (
        <ActorCard key={actor.name + index} actor={actor} index={index} />
      ))}
    </ul>
  )
}

function BondFilms() {
  return (
    <ul className="flex flex-col">
      <li className="film-cap flex justify-end gap-2 py-1.5 sm:gap-3" aria-hidden="true">
        <span className="rank-tile rank-tile-red" />
        <span className="rank-tile rank-tile-brown" />
      </li>
      {bondFilms.map((film, index) => (
        <li
          key={film.title + index}
          className="reveal"
          style={delay(220 + index * 90)}
        >
          <div className="group flex items-center gap-3 py-1.5 sm:gap-6">
            <div className="min-w-0 flex-1 sm:flex-none">
              <h3 className="text-xl font-semibold leading-tight transition-colors duration-300 group-hover:text-[#c9a45c] sm:text-2xl">
                {film.title}
                <span className="bond-type ml-3 text-sm tracking-widest text-[#c9a45c]">{film.year}</span>
              </h3>
              <p className="starring mt-1 sm:hidden">
                starring <span className="uppercase">{film.actor}</span>
              </p>
              {film.note ? (
                <p className="mt-1 font-normal text-[#e9e5db]/85">{film.note}</p>
              ) : null}
            </div>
            <span
              className="hidden h-px min-w-6 flex-1 border-b border-dotted border-[#e9e5db]/35 sm:block"
              aria-hidden="true"
            />
            <p className="starring hidden text-right sm:block">
              starring <span className="uppercase">{film.actor}</span>
            </p>
            <span className="flex gap-2 sm:gap-3">
              <RankTile value={index + 1} tone="red" />
              <span className="rank-tile rank-tile-brown" aria-hidden="true" />
            </span>
          </div>
        </li>
      ))}
      <li className="film-cap flex justify-end gap-2 py-1.5 sm:gap-3" aria-hidden="true">
        <span className="rank-tile rank-tile-brown" />
        <span className="rank-tile rank-tile-brown" />
      </li>
    </ul>
  )
}

function Hobbies() {
  return (
    <ol className="grid gap-4 lg:grid-cols-2">
      {hobbies.map((hobby, index) => (
        <li
          key={hobby.title + index}
          className="reveal"
          style={delay(220 + index * 80)}
        >
          <div className="group flex h-full items-center gap-4 border border-[#e9e5db]/25 px-4 py-3 transition-colors duration-300 hover:border-[#c9a45c] sm:gap-5">
            <RankTile
              value={index + 1}
              label={hobby.mention ? 'HM' : undefined}
              tone={hobby.mention ? 'brown' : 'red'}
              className="rank-tile-sm"
            />
            <div className="flex min-w-0 flex-col gap-1">
              {hobby.mention ? (
                <span className="bond-type text-xs tracking-widest text-[#c9a45c]">Honourable mention</span>
              ) : null}
              <span className="text-lg font-medium leading-snug sm:text-xl">{hobby.title}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

const PASSION_DOTS = [
  { cols: 3, rows: 4, tones: ['teal'] },
  { cols: 2, rows: 6, tones: ['teal', 'yellow'] },
  { cols: 1, rows: 6, tones: ['green'] },
]

function Passions() {
  return (
    <div className="grid divide-y divide-[#e9e5db]/15 md:grid-cols-3 md:divide-x md:divide-y-0">
      {passions.map((passion, index) => (
        <div
          key={passion.title + index}
          className="reveal py-8 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0"
          style={delay(220 + index * 120)}
        >
          <article className="group relative h-full md:pr-14">
            <DotBlock
              {...PASSION_DOTS[index % PASSION_DOTS.length]}
              size="0.55rem"
              pitch="0.9rem"
              className="absolute right-0 top-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            />
            <div className="mb-5 h-[3px] w-10 bg-[#b81d1d] transition-all duration-500 group-hover:w-20 group-hover:bg-[#c9a45c]" />
            <h3 className="text-2xl font-semibold">{passion.title}</h3>
            <p className="mt-3 font-normal text-[#e9e5db]/85">{passion.description}</p>
          </article>
        </div>
      ))}
    </div>
  )
}

function Rifling() {
  const view = 300

  return (
    <div
      className="reveal-pop relative mx-auto aspect-square w-[min(78vw,30rem)] shrink-0 rounded-full shadow-[0_0_110px_18px_rgba(201,164,92,0.2),0_0_36px_2px_rgba(201,164,92,0.14)] lg:mx-0 lg:w-[min(42vw,36rem)]"
      style={delay(500)}
      aria-hidden="true"
    >
      <svg
        viewBox={`${-view} ${-view} ${view * 2} ${view * 2}`}
        className="size-full motion-safe:animate-[spin_160s_linear_infinite]"
      >
        <defs>
          <linearGradient id="rifling-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8a8379" />
            <stop offset="0.5" stopColor="#3f3b36" />
            <stop offset="1" stopColor="#12100e" />
          </linearGradient>
          <radialGradient id="rifling-depth">
            <stop offset="0.16" stopColor="#000" stopOpacity="1" />
            <stop offset="0.7" stopColor="#000" stopOpacity="0.15" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rifling-core">
            <stop offset="0" stopColor="#c9a45c" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#6b4a1c" stopOpacity="0.35" />
            <stop offset="1" stopColor="#000" stopOpacity="1" />
          </radialGradient>
          <filter id="rifling-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="rifling-clip">
            <circle r={view - 2} />
          </clipPath>
        </defs>

        <g clipPath="url(#rifling-clip)">
          <circle r={view} fill="#080605" />
          {BARREL_GEOMETRY.map((land, index) => (
            <g key={index}>
              <path d={land.outline} fill="url(#rifling-land)" stroke="#000" strokeWidth="1.5" />
              <path d={land.trail} fill="none" stroke="#e9e5db" strokeOpacity="0.4" strokeWidth="1.2" />
            </g>
          ))}
          <circle r={view} fill="url(#rifling-depth)" />
        </g>

        <circle
          r={view - 2}
          fill="none"
          stroke="#c9a45c"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          filter="url(#rifling-glow)"
        />
        <circle r="52" fill="url(#rifling-core)" stroke="#c9a45c" strokeWidth="2.5" filter="url(#rifling-glow)" />
      </svg>

      <span className="bond-type absolute -bottom-3 left-0 -rotate-6 border-2 border-[#b81d1d] bg-[#121212]/80 px-4 py-1.5 text-xl font-bold tracking-widest text-[#b81d1d] sm:text-2xl lg:-left-8">
        EYES ONLY
      </span>
    </div>
  )
}

function Flourish() {
  return (
    <div className="flex w-full items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#b81d1d]" />
      <span className="size-2.5 rotate-45 bg-[#b81d1d]" />
      <span className="size-2 rotate-45 border border-[#b81d1d]" />
      <span className="size-2.5 rotate-45 bg-[#b81d1d]" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#b81d1d]" />
    </div>
  )
}

function EndCard({ onReplay }) {
  const [ref, inView] = useInView(0.3)

  return (
    <footer
      ref={ref}
      className={`flex flex-col items-center gap-14 pb-8 pt-24 text-center ${inView ? 'about-in' : ''}`}
    >
      <div className="reveal flex w-full max-w-4xl flex-col items-center gap-9" style={delay(0)}>
        <Flourish />
        <p className="end-title text-4xl font-medium uppercase tracking-[0.16em] text-[#c9a45c] sm:text-6xl lg:text-7xl">
          {endCard}
        </p>
        <Flourish />
      </div>
      <div className="reveal flex flex-wrap justify-center gap-4" style={delay(350)}>
        <a
          href="/"
          className="border border-[#e9e5db]/40 px-6 py-2.5 text-sm tracking-widest transition-colors hover:bg-[#e9e5db] hover:text-[#121212]"
        >
          BACK TO PORTFOLIO
        </a>
        <button
          type="button"
          onClick={onReplay}
          className="cursor-pointer border border-[#b81d1d] px-6 py-2.5 text-sm tracking-widest text-[#c9a45c] transition-colors hover:bg-[#b81d1d] hover:text-[#e9e5db]"
        >
          REPLAY INTRO
        </button>
      </div>
    </footer>
  )
}

function Dossier({ armed, onReplay }) {
  return (
    <div className="secret-content cold-war relative overflow-hidden text-[#e9e5db]">
      <MarginDots />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 sm:gap-24 sm:px-10 sm:pb-24 lg:gap-32">
        <header
          className={`relative flex min-h-[90svh] flex-col justify-center gap-10 pt-20 sm:gap-12 sm:pt-24 lg:flex-row lg:items-center lg:justify-between lg:gap-8 ${armed ? 'about-in' : ''}`}
        >
          <div className="relative z-10 flex max-w-xl flex-col gap-6">
            <AgentBadge active={armed} />
            <p
              className="reveal bond-type flex items-center gap-4 text-lg tracking-widest text-[#c9a45c] sm:text-xl"
              style={delay(100)}
            >
              <span className="h-px w-10 bg-[#c9a45c]" aria-hidden="true" />
              {profile.eyebrow}
            </p>
            <h1
              className="reveal text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-8xl"
              style={delay(200)}
            >
              {profile.title}
            </h1>
            <p
              className="reveal border-l-2 border-[#b81d1d] pl-6 text-lg font-normal leading-relaxed text-[#e9e5db]/85 sm:text-xl"
              style={delay(320)}
            >
              {profile.intro}
            </p>
            <div
              className="reveal bond-type mt-4 flex items-center gap-4 text-sm tracking-widest text-[#e9e5db]/85"
              style={delay(650)}
            >
              <span
                className="h-12 w-px bg-linear-to-b from-[#c9a45c] to-transparent motion-safe:animate-pulse"
                aria-hidden="true"
              />
              Scroll down for more
            </div>
          </div>

          <Rifling />
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

        <EndCard onReplay={onReplay} />
      </main>

      <div className="film-grain pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="cold-vignette" aria-hidden="true" />

      <ScrollTrail />
    </div>
  )
}

function Gate({ onStart }) {
  const touch = window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    let fired = false

    const go = () => {
      if (fired) return
      fired = true
      onStart()
    }

    window.addEventListener('pointerdown', go)
    window.addEventListener('pointerup', go)
    window.addEventListener('keydown', go)

    return () => {
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('pointerup', go)
      window.removeEventListener('keydown', go)
    }
  }, [onStart])

  return (
    <div className="fixed inset-0 z-70 flex flex-col items-center justify-center gap-10 bg-black px-6 text-center">
      <span className="gate-dot" aria-hidden="true" />
      <div className="flex flex-col gap-3">
        <p className="text-sm tracking-[0.35em] text-white/80 sm:tracking-[0.5em]">
          {touch ? 'TAP ANYWHERE TO START' : 'CLICK OR PRESS ANY KEY TO START'}
        </p>
        <p className="bond-type text-xs tracking-widest text-white/50">
          Sound on for the full experience
        </p>
      </div>
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
  const [dotScale, setDotScale] = useState(dotScaleNow)
  const [muted, setMuted] = useState(false)
  const [audioActive, setAudioActive] = useState(false)
  const audioRef = useRef(null)
  const mutedRef = useRef(false)
  const keepAudioRef = useRef(false)
  const unlockedRef = useRef(false)
  const shotRef = useRef(null)

  useEffect(() => {
    const sync = () => setDotScale(dotScaleNow())

    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    if (audioRef.current) audioRef.current.muted = muted
    if (shotRef.current) shotRef.current.muted = muted
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
    audio.volume = trackVolume(chosen)
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
          if (error.name === 'NotAllowedError' && !unlockedRef.current) setPhase('gate')
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

    const hit = bloodStartSeconds(track)
    const armTimer = setTimeout(() => setArmed(true), (hit + ARM_LAG) * 1000)
    const doneTimer = setTimeout(finish, (hit + TOTAL_LAG) * 1000)

    const holdSeconds = readSeconds('--hold', 0.7)
    const shot = new Audio(GUNSHOT_SRC)
    shot.preload = 'auto'
    shot.volume = GUNSHOT_VOLUME
    shot.muted = mutedRef.current
    shotRef.current = shot

    const shotTimer = setTimeout(
      () => {
        shot.muted = mutedRef.current
        shot.currentTime = 0
        shot.play().catch(() => {})
      },
      Math.max(0, hit - holdSeconds + GUNSHOT_OFFSET_SECONDS) * 1000,
    )

    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        skip()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(armTimer)
      clearTimeout(doneTimer)
      clearTimeout(shotTimer)
      shot.pause()
      if (shotRef.current === shot) shotRef.current = null
      window.removeEventListener('keydown', onKey)
    }
  }, [phase, started, run, finish, skip, track])

  const start = useCallback(() => {
    unlockedRef.current = true
    setRun((count) => count + 1)
    setPhase('intro')
  }, [])

  const replay = () => {
    unlockedRef.current = true
    window.scrollTo({ top: 0, behavior: 'instant' })
    setArmed(false)
    setRun((count) => count + 1)
    setPhase('intro')
  }

  const playing = phase === 'intro' && started
  const timeline = {
    '--choreo': `${CHOREO_SECONDS}s`,
    '--stop': `${RIGHT_STOP_VW}vw`,
    '--blood-dur': `${BLOOD_SECONDS}s`,
    '--sway-delay': `${SWAY_DELAY_SECONDS}s`,
    '--blood-out-delay': `${BLOOD_OUT_DELAY_SECONDS}s`,
    '--blood-fade': `${BLOOD_FADE_SECONDS}s`,
    '--open': dotScale,
    '--end-x': BARREL_IMAGE ? `${BARREL_IMAGE_FOCUS_X * 100}vw` : '50vw',
    '--end-pct': BARREL_IMAGE ? `${BARREL_IMAGE_FOCUS_X * 100}%` : '50%',
    '--t0': track?.hit
      ? `max(0s, calc(${track.hit}s - var(--sweep) - var(--open-dur) - var(--pause) - var(--glide-dur) - var(--hold)))`
      : `${AUDIO_LEAD_SECONDS}s`,
  }

  return (
    <div className="secret-page min-h-[100svh] bg-[#000000]" style={timeline}>
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
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-2 z-70 cursor-pointer px-4 py-3 text-sm tracking-[0.3em] text-white/70 transition-colors hover:text-white sm:bottom-4 sm:right-5"
          >
            SKIP
          </button>
        </>
      ) : null}

      {phase === 'intro' || audioActive ? (
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-2 z-70 cursor-pointer px-4 py-3 text-sm tracking-[0.3em] text-white/70 transition-colors hover:text-white sm:bottom-4 sm:left-5"
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      ) : null}

      {phase === 'gate' ? <Gate onStart={start} /> : null}
    </div>
  )
}
