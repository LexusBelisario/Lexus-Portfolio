import { useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const cancelEvents = ['wheel', 'touchstart', 'keydown', 'mousedown']

let activeFrame = 0
let activeCancel = null

export function smoothScrollTo(targetY) {
  if (activeCancel) activeCancel()

  const maxY = document.documentElement.scrollHeight - window.innerHeight
  const endY = clamp(targetY, 0, Math.max(0, maxY))
  const startY = window.scrollY
  const distance = endY - startY
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced || Math.abs(distance) < 2) {
    window.scrollTo({ top: endY, behavior: 'instant' })
    return
  }

  const duration = clamp(Math.abs(distance) * 0.8, 700, 1400)
  const startTime = performance.now()

  const stop = () => {
    cancelAnimationFrame(activeFrame)
    cancelEvents.forEach((name) => window.removeEventListener(name, stop))
    activeCancel = null
  }

  const step = (now) => {
    const progress = clamp((now - startTime) / duration, 0, 1)
    window.scrollTo({
      top: startY + distance * easeInOutCubic(progress),
      behavior: 'instant',
    })

    if (progress < 1) {
      activeFrame = requestAnimationFrame(step)
    } else {
      stop()
    }
  }

  activeCancel = stop
  cancelEvents.forEach((name) =>
    window.addEventListener(name, stop, { passive: true }),
  )
  activeFrame = requestAnimationFrame(step)
}

export function useSmoothAnchors() {
  useEffect(() => {
    const onClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const link = event.target.closest('a[href^="#"]')
      if (!link) return

      const id = link.getAttribute('href').slice(1)
      const target = id ? document.getElementById(id) : null
      if (id && !target) return

      event.preventDefault()
      smoothScrollTo(target ? target.getBoundingClientRect().top + window.scrollY : 0)

      const { pathname, search } = window.location
      window.history.replaceState(null, '', id ? `${pathname}${search}#${id}` : `${pathname}${search}`)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}

export function useInView(threshold = 0.15, rootMargin = '0px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= threshold),
      { threshold: [0, threshold], rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView]
}

export function useScrollVars(ref) {
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    let frame = 0

    const update = () => {
      frame = 0
      const viewport = window.innerHeight
      const rect = node.getBoundingClientRect()
      const leave = clamp(-rect.top / viewport, 0, 1)
      const exit = clamp(1 - rect.bottom / viewport, 0, 1)
      const enter = clamp((viewport - rect.top) / viewport, 0, 1)
      const pass = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1)
      node.style.setProperty('--leave', leave.toFixed(4))
      node.style.setProperty('--exit', exit.toFixed(4))
      node.style.setProperty('--enter', enter.toFixed(4))
      node.style.setProperty('--pass', pass.toFixed(4))
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
  }, [ref])
}