import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import './project_modal.css'

const showPlaceholders = import.meta.env.DEV

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff]'

const actionButton =
  'group inline-flex w-fit max-w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-left font-semibold text-white transition-colors hover:border-white/70 hover:bg-white hover:text-[#120c1c] motion-reduce:transition-none'

const ENTER_MS = 650
const EXIT_MS = 450
const REVEAL_AFTER_MS = 260
const VIEWER_ENTER_MS = 550
const VIEWER_EXIT_MS = 450
const VIEWER_REST_CLIP = 'inset(-6rem round 8px)'
const VIEWER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const at = (ms) => ({ '--d': ms })

const isGithub = (href) => /^https?:\/\/(www\.)?github\.com\//i.test(href)

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fromOrigin = (panel, overlay, origin) => {
  if (!panel || !overlay || !origin) return null

  const from = origin.getBoundingClientRect()
  const area = overlay.getBoundingClientRect()
  const width = panel.offsetWidth
  const height = panel.offsetHeight

  if (!width || !height) return null

  const dx = from.left + from.width / 2 - (area.left + area.width / 2)
  const dy = from.top + from.height / 2 - (area.top + area.height / 2)

  return `translate(${dx}px, ${dy}px) scale(${from.width / width}, ${from.height / height})`
}

const thumbFrame = (img, thumb) => {
  if (!img || !thumb) return null

  const to = img.getBoundingClientRect()
  const from = thumb.getBoundingClientRect()

  if (!to.width || !to.height || !from.width || !from.height) return null

  const scale = Math.max(from.width / to.width, from.height / to.height)
  const cropX = Math.max(0, (to.width - from.width / scale) / 2)
  const cropY = Math.max(0, (to.height - from.height / scale) / 2)
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)

  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    clipPath: `inset(${cropY}px ${cropX}px round ${12 / scale}px)`,
  }
}

export function LiveDot() {
  return (
    <span className="relative inline-flex size-[0.55em]" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-[#a9a2ff] opacity-70 motion-safe:animate-ping" />
      <span className="relative size-full rounded-full bg-[#a9a2ff]" />
    </span>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

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

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="size-[1.35em] shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
    >
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  )
}

function ExternalIcon() {
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
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function ZoomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </svg>
  )
}

function ChevronIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-6 ${className}`}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function AnimatedTitle({ id, text }) {
  const words = text.split(' ').map((word, index, all) => ({
    word,
    offset: all.slice(0, index).join(' ').length + (index > 0 ? 1 : 0),
  }))

  return (
    <h3
      id={id}
      aria-label={text}
      className="text-[clamp(1.25rem,1.8vw,2.25rem)] font-bold leading-snug"
    >
      {words.map(({ word, offset }, index) => (
        <Fragment key={offset}>
          {index > 0 ? ' ' : null}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {[...word].map((char, charIndex) => (
              <span
                key={charIndex}
                className="pm-char inline-block"
                style={at(80 + (offset + charIndex) * 16)}
              >
                {char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h3>
  )
}

function Section({ title, delay, empty = false, children }) {
  if (empty && !showPlaceholders) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="pm-rule h-px bg-white/12" style={at(delay)} />
      <h4
        className="pm-item pt-1 text-[clamp(1rem,1.15vw,1.35rem)] font-semibold text-white"
        style={at(delay + 100)}
      >
        {title}
      </h4>
      {empty ? (
        <p className="pm-item italic text-white/40" style={at(delay + 200)}>
          To be added
        </p>
      ) : (
        children
      )}
    </section>
  )
}

const PAGE_SIZE = 4

const arrowButton =
  'pointer-events-auto absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm transition-[background-color,color,opacity] duration-300 hover:bg-white hover:text-[#120c1c] disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff]'

function Gallery({ images, title, viewer, thumbsRef, onOpen }) {
  const slots = showPlaceholders ? images : images.filter(Boolean)
  const trackRef = useRef(null)
  const [page, setPage] = useState(0)

  const pageCount = Math.ceil(slots.length / PAGE_SIZE)

  useEffect(() => {
    const track = trackRef.current
    if (viewer === null || !track) return

    track.scrollTo({
      left: Math.floor(viewer / PAGE_SIZE) * track.clientWidth,
      behavior: 'auto',
    })
  }, [viewer])

  if (!slots.length) return null

  const goTo = (target) => {
    const track = trackRef.current
    if (!track) return

    const next = Math.min(pageCount - 1, Math.max(0, target))

    track.scrollTo({
      left: next * track.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  const pages = Array.from({ length: pageCount }, (_, index) =>
    slots.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
  )

  const first = page * PAGE_SIZE + 1
  const last = Math.min(slots.length, (page + 1) * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ul
          ref={trackRef}
          onScroll={(event) => {
            const track = event.currentTarget
            setPage(Math.round(track.scrollLeft / track.clientWidth))
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((group, pageIndex) => (
            <li key={pageIndex} className="shrink-0 basis-full snap-start">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {group.map((src, offset) => {
                  const index = pageIndex * PAGE_SIZE + offset

                  return (
                    <li
                      key={src || `empty-${index}`}
                      ref={(node) => {
                        thumbsRef.current[index] = node
                      }}
                      className="pm-shot group relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-white/5 transition-colors duration-300 hover:border-[#a9a2ff]/60 motion-reduce:transition-none"
                      style={at(180 + offset * 140)}
                    >
                      {src ? (
                        <button
                          type="button"
                          onClick={() => onOpen(index)}
                          aria-label={`Enlarge ${title} screenshot ${index + 1}`}
                          className={`block size-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a9a2ff] ${viewer === index ? 'invisible' : ''}`}
                        >
                          <img
                            src={src}
                            alt={`${title} screenshot ${index + 1}`}
                            loading="lazy"
                            className="pm-shot-img size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                          />
                          <span className="pointer-events-none absolute bottom-3 right-3 flex size-9 translate-y-1 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none">
                            <ZoomIcon />
                          </span>
                        </button>
                      ) : (
                        <span className="flex size-full items-center justify-center text-sm italic text-white/30">
                          Picture {index + 1} to be added
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>

        {pageCount > 1 ? (
          <div
            className="pm-item pointer-events-none absolute inset-0"
            style={at(700)}
          >
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Previous pictures"
              className={`${arrowButton} left-2 sm:-left-5`}
            >
              <ChevronIcon className="rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === pageCount - 1}
              aria-label="Next pictures"
              className={`${arrowButton} right-2 sm:-right-5`}
            >
              <ChevronIcon />
            </button>
          </div>
        ) : null}
      </div>

      {pageCount > 1 ? (
        <div
          className="pm-item flex items-center justify-center gap-4"
          style={at(600)}
        >
          <ul className="flex items-center gap-2">
            {pages.map((group, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show pictures ${index * PAGE_SIZE + 1} to ${index * PAGE_SIZE + group.length}`}
                  aria-current={page === index ? 'true' : undefined}
                  className={`block h-2 cursor-pointer rounded-full transition-all duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff] ${page === index ? 'w-6 bg-[#a9a2ff]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                />
              </li>
            ))}
          </ul>
          <span aria-live="polite" className="text-sm text-white/60">
            {first} - {last} of {slots.length}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function TechChip({ tech, delay }) {
  const [failed, setFailed] = useState(!tech.src)

  return (
    <li className="pm-pop" style={at(delay)}>
      <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-4 transition-colors duration-300 hover:border-[#a9a2ff]/70 hover:bg-white/10 motion-reduce:transition-none">
        <span className="size-6 shrink-0">
          {failed ? (
            <span className="flex size-full items-center justify-center rounded-full bg-white/15 text-[0.55rem] font-bold">
              {tech.label.slice(0, 2)}
            </span>
          ) : (
            <img
              src={tech.src}
              alt=""
              onError={() => setFailed(true)}
              className={`size-full object-contain ${tech.chip ? 'rounded-md bg-white p-0.5' : ''}`}
            />
          )}
        </span>
        {tech.label}
      </div>
    </li>
  )
}

const viewerButton =
  'pointer-events-auto flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition-[background-color,color] duration-300 hover:bg-white hover:text-[#120c1c] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff]'

function Lightbox({ images, captions, title, index, thumbsRef, onNavigate, onClose }) {
  const [reduced] = useState(prefersReducedMotion)
  const [shown, setShown] = useState(reduced)

  const overlayRef = useRef(null)
  const imgRef = useRef(null)
  const closeRef = useRef(null)
  const enterRef = useRef(null)
  const navRef = useRef(null)
  const closingRef = useRef(false)
  const directionRef = useRef(1)
  const previousRef = useRef(index)
  const startRef = useRef(index)

  const count = images.length
  const caption = captions[index] ?? ''
  const reserve = showPlaceholders || captions.some(Boolean)

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true

    const img = imgRef.current

    if (enterRef.current) enterRef.current.cancel()
    if (navRef.current) navRef.current.cancel()

    const frame = prefersReducedMotion() ? null : thumbFrame(img, thumbsRef.current[index])

    if (!frame) {
      onClose()
      return
    }

    setShown(false)

    const exit = img.animate(
      [{ transform: 'none', clipPath: VIEWER_REST_CLIP }, frame],
      { duration: VIEWER_EXIT_MS, easing: 'cubic-bezier(0.55, 0, 0.3, 1)', fill: 'forwards' },
    )

    exit.finished.then(onClose, () => {})
  }, [index, thumbsRef, onClose])

  const go = useCallback(
    (step) => {
      if (count < 2 || closingRef.current) return
      directionRef.current = step
      onNavigate((index + step + count) % count)
    },
    [count, index, onNavigate],
  )

  useLayoutEffect(() => {
    if (reduced) return undefined

    const frame = thumbFrame(imgRef.current, thumbsRef.current[startRef.current])
    if (!frame) return undefined

    const animation = imgRef.current.animate(
      [frame, { transform: 'none', clipPath: VIEWER_REST_CLIP }],
      { duration: VIEWER_ENTER_MS, easing: VIEWER_EASE },
    )

    enterRef.current = animation

    return () => {
      animation.cancel()
      if (enterRef.current === animation) enterRef.current = null
    }
  }, [reduced, thumbsRef])

  useLayoutEffect(() => {
    if (previousRef.current === index) return undefined
    previousRef.current = index

    if (reduced || !imgRef.current) return undefined

    const animation = imgRef.current.animate(
      [
        { opacity: 0, transform: `translateX(${directionRef.current * 48}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 400, easing: VIEWER_EASE },
    )

    navRef.current = animation

    return () => {
      animation.cancel()
      if (navRef.current === animation) navRef.current = null
    }
  }, [index, reduced])

  useEffect(() => {
    const trigger = document.activeElement
    let frame = 0

    if (!reduced) frame = requestAnimationFrame(() => setShown(true))

    closeRef.current?.focus()

    return () => {
      cancelAnimationFrame(frame)
      if (trigger && typeof trigger.focus === 'function') trigger.focus()
    }
  }, [reduced])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        requestClose()
        return
      }

      if (event.key === 'ArrowRight') {
        event.stopPropagation()
        go(1)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.stopPropagation()
        go(-1)
        return
      }

      if (event.key !== 'Tab' || !overlayRef.current) return

      event.stopPropagation()

      const nodes = overlayRef.current.querySelectorAll('button:not([disabled])')
      if (!nodes.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [requestClose, go])

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} screenshot ${index + 1} of ${count}`}
      aria-describedby={caption ? 'lightbox-caption' : undefined}
      className="fixed inset-0 z-110 flex items-center justify-center px-4 pb-20 pt-16"
    >
      <div
        onMouseDown={requestClose}
        className={`absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative flex flex-col items-center gap-5">
        <img
          ref={imgRef}
          src={images[index]}
          alt={`${title} screenshot ${index + 1}`}
          onClick={requestClose}
          className="max-h-[68vh] max-w-[92vw] cursor-zoom-out rounded-lg object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />

        {reserve ? (
          <div
            className={`flex min-h-[4.5rem] w-full max-w-2xl justify-center transition-opacity duration-300 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}`}
          >
            {caption ? (
              <p
                key={index}
                id="lightbox-caption"
                className="pm-caption text-center text-[clamp(0.9rem,1vw,1.15rem)] leading-relaxed text-white/85"
              >
                {caption}
              </p>
            ) : showPlaceholders ? (
              <p className="text-center italic text-white/30">Description to be added</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${shown ? 'opacity-100 delay-300' : 'opacity-0'}`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          aria-label="Close enlarged picture"
          className={`${viewerButton} absolute right-4 top-4`}
        >
          <CloseIcon />
        </button>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous picture"
              className={`${viewerButton} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`}
            >
              <ChevronIcon className="rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next picture"
              className={`${viewerButton} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`}
            >
              <ChevronIcon />
            </button>
          </>
        ) : null}

        <p
          aria-live="polite"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-1.5 text-sm text-white backdrop-blur-sm"
        >
          {index + 1} / {count}
        </p>
      </div>
    </div>,
    document.body,
  )
}

export default function ProjectModal({ project, originRef, onClose }) {
  const { id, title, period, stack, members, more } = project
  const {
    gallery = [],
    captions = [],
    documentation = [],
    visit = null,
    advisers = [],
    features = [],
    contributions = [],
    outcome,
    challenges = [],
  } = more

  const [reduced] = useState(prefersReducedMotion)
  const [shown, setShown] = useState(reduced)
  const [revealed, setRevealed] = useState(reduced)
  const [leaving, setLeaving] = useState(false)
  const [viewer, setViewer] = useState(null)

  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const enterRef = useRef(null)
  const closingRef = useRef(false)
  const thumbsRef = useRef([])

  const images = gallery ? gallery.filter(Boolean) : []
  const later = contributions.length ? 300 : 0
  const titleId = `project-modal-${id}`
  const isLive = period.endsWith('Present')

  const closeViewer = useCallback(() => setViewer(null), [])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true

    const panel = panelRef.current
    const end = prefersReducedMotion()
      ? null
      : fromOrigin(panel, overlayRef.current, originRef.current)

    if (!end) {
      onClose()
      return
    }

    if (enterRef.current) enterRef.current.cancel()
    setLeaving(true)
    setShown(false)

    const exit = panel.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: end, opacity: 0.3 },
      ],
      { duration: EXIT_MS, easing: 'cubic-bezier(0.55, 0, 0.3, 1)', fill: 'forwards' },
    )

    exit.finished.then(onClose, () => {})
  }, [onClose, originRef])

  useLayoutEffect(() => {
    if (reduced) return undefined

    const start = fromOrigin(panelRef.current, overlayRef.current, originRef.current)
    if (!start) return undefined

    const animation = panelRef.current.animate(
      [
        { transform: start, opacity: 0.4 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: ENTER_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    )

    enterRef.current = animation

    return () => {
      animation.cancel()
      if (enterRef.current === animation) enterRef.current = null
    }
  }, [reduced, originRef])

  useEffect(() => {
    const trigger = document.activeElement
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    let frame = 0
    let timer = 0

    if (!reduced) {
      frame = requestAnimationFrame(() => setShown(true))
      timer = setTimeout(() => setRevealed(true), REVEAL_AFTER_MS)
    }

    closeRef.current?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        requestClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const nodes = panelRef.current.querySelectorAll(focusableSelector)
      if (!nodes.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      if (trigger && typeof trigger.focus === 'function') trigger.focus()
    }
  }, [reduced, requestClose])

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none sm:p-6 ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[20px] border border-white/20 bg-[#0a111f] bg-[image:radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(96,128,255,0.2),transparent_70%)] text-white shadow-[0_8px_60px_rgba(0,0,0,0.6),0_0_48px_rgba(70,95,230,0.2)] ${revealed ? 'pm-in' : ''} ${leaving ? 'pm-leaving' : ''}`}
      >
        <header className="pm-fade flex shrink-0 items-start justify-between gap-4 border-b border-white/12 px-[clamp(1.25rem,2vw,2.5rem)] py-[clamp(1rem,1.5vw,1.75rem)]">
          <div className="flex flex-col gap-[0.4em]">
            <AnimatedTitle id={titleId} text={title} />
            <p
              className="pm-item flex items-center gap-2 text-[clamp(0.8rem,0.95vw,1.15rem)] italic text-white/60"
              style={at(420)}
            >
              {period}
              {isLive ? <LiveDot /> : null}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={requestClose}
            aria-label="Close"
            style={at(300)}
            className={`pm-pop flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/25 transition-[rotate,background-color,color] duration-300 hover:rotate-90 hover:bg-white hover:text-[#120c1c] motion-reduce:transition-none ${focusRing}`}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="pm-fade flex-1 overflow-y-auto overscroll-contain px-[clamp(1.25rem,2vw,2.5rem)] py-[clamp(1.25rem,2vw,2.5rem)] text-[clamp(0.85rem,0.95vw,1.1rem)] leading-relaxed text-white/85 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]">
          <div className="flex flex-col gap-[clamp(1.5rem,2.4vw,2.75rem)]">
            {gallery ? (
              <Gallery
                images={gallery}
                title={title}
                viewer={viewer}
                thumbsRef={thumbsRef}
                onOpen={setViewer}
              />
            ) : null}

            <div className="grid gap-[clamp(1.5rem,2.4vw,2.75rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div className="flex flex-col gap-[clamp(1.25rem,1.8vw,2rem)]">
                {documentation.length ? (
                  <Section title="Documentation" delay={560}>
                    <ul className="flex flex-col gap-3">
                      {documentation.map((doc, index) => (
                        <li
                          key={doc.href}
                          className="pm-item"
                          style={at(760 + index * 90)}
                        >
                          <a
                            href={doc.href}
                            download={doc.file}
                            className={`${actionButton} ${focusRing}`}
                          >
                            <span className="inline-flex shrink-0 transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transition-none">
                              <DownloadIcon />
                            </span>
                            <span className="flex flex-col">
                              Download documentation
                              {documentation.length > 1 ? (
                                <span className="text-sm font-normal text-white/60 transition-colors group-hover:text-[#120c1c]/70 motion-reduce:transition-none">
                                  {doc.label}
                                </span>
                              ) : null}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}

                {visit && visit.href ? (
                  <Section title="Link" delay={560}>
                    <a
                      href={visit.href}
                      target="_blank"
                      rel="noreferrer"
                      style={at(760)}
                      className={`pm-item ${actionButton} ${focusRing}`}
                    >
                      {isGithub(visit.href) ? <GithubIcon /> : null}
                      {visit.label}
                      <span className="inline-flex transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none">
                        <ExternalIcon />
                      </span>
                    </a>
                  </Section>
                ) : null}

                {members ? (
                  <Section title="Members" delay={680} empty={!members.length}>
                    <ul className="flex flex-col gap-3">
                      {members.map((member, index) => (
                        <li
                          key={member.name}
                          className="pm-item flex flex-col leading-snug"
                          style={at(880 + index * 90)}
                        >
                          <span className="font-semibold text-white">{member.name}</span>
                          {member.role ? (
                            <span className="text-white/60">{member.role}</span>
                          ) : showPlaceholders ? (
                            <span className="italic text-white/30">Role to be added</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}

                {advisers.map((adviser, index) => (
                  <Section
                    key={adviser.label}
                    title={adviser.label}
                    delay={800 + index * 120}
                    empty={!adviser.name}
                  >
                    <p
                      className="pm-item font-semibold text-white"
                      style={at(1000 + index * 120)}
                    >
                      {adviser.name}
                    </p>
                  </Section>
                ))}
              </div>

              <div className="flex flex-col gap-[clamp(1.25rem,1.8vw,2rem)]">
                <Section title="Features" delay={640} empty={!features.length}>
                  <ul className="list-disc pl-5 marker:text-[#a9a2ff]">
                    {features.map((feature, index) => (
                      <li
                        key={feature}
                        className="pm-slide pl-1"
                        style={at(840 + index * 80)}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Section>

                {contributions.length ? (
                  <Section title="My contributions" delay={1000}>
                    <ul className="list-disc pl-5 marker:text-[#a9a2ff]">
                      {contributions.map((item, index) => (
                        <li
                          key={item}
                          className="pm-slide pl-1"
                          style={at(1200 + index * 70)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}

                {outcome !== undefined ? (
                  <Section title="Outcome" delay={1000 + later} empty={!outcome}>
                    <p className="pm-item" style={at(1200 + later)}>
                      {outcome}
                    </p>
                  </Section>
                ) : null}

                <Section
                  title="Challenges and learnings"
                  delay={1120 + later}
                  empty={!challenges.length}
                >
                  <ul className="flex flex-col gap-4">
                    {challenges.map((item, index) => (
                      <li
                        key={index}
                        className="pm-item flex flex-col gap-1 border-l-2 border-[#a9a2ff]/60 pl-4"
                        style={at(1320 + later + index * 100)}
                      >
                        <p>
                          <span className="font-semibold text-white">Challenge: </span>
                          {item.challenge}
                        </p>
                        <p className="text-white/75">
                          <span className="font-semibold text-white">Learning: </span>
                          {item.learning}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>

            <Section title="Tech stack used" delay={1250 + later} empty={!stack.length}>
              <ul className="flex flex-wrap gap-3">
                {stack.map((tech, index) => (
                  <TechChip key={tech.label} tech={tech} delay={1450 + later + index * 70} />
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>

      {viewer !== null && images[viewer] ? (
        <Lightbox
          images={images}
          captions={captions}
          title={title}
          index={viewer}
          thumbsRef={thumbsRef}
          onNavigate={setViewer}
          onClose={closeViewer}
        />
      ) : null}
    </div>,
    document.body,
  )
}
