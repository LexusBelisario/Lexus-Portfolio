import { Fragment, useEffect, useState } from 'react'
import { useInView } from '../hooks/scroll'
import './end_quotes.css'

const EXIT_MS = 450

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pickNext = (current, count) => {
  if (count < 2) return current

  let next = current
  while (next === current) next = Math.floor(Math.random() * count)

  return next
}

const toWords = (line) => line.split(' ')

export default function EndQuotes({ quotes, interval = 20000 }) {
  const [ref, inView] = useInView(0.2)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const onChange = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const running = inView && pageVisible

  useEffect(() => {
    if (!running || quotes.length < 2) return undefined

    let swap = 0

    const rotate = setInterval(() => {
      if (prefersReducedMotion()) {
        setIndex((current) => pickNext(current, quotes.length))
        return
      }

      setLeaving(true)
      swap = setTimeout(() => {
        setIndex((current) => pickNext(current, quotes.length))
        setLeaving(false)
      }, EXIT_MS)
    }, interval)

    return () => {
      clearInterval(rotate)
      clearTimeout(swap)
      setLeaving(false)
    }
  }, [running, quotes.length, interval])

  const quote = quotes[index]
  let counter = 0

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center text-center text-[clamp(1.75rem,2.6vw,3.25rem)] font-bold leading-[1.1]"
      style={{
        minHeight:
          'calc(2 * clamp(1.75rem, 2.6vw, 3.25rem) + clamp(1.25rem, 3.4vw, 4rem))',
      }}
    >
      <div
        key={index}
        className={`eq-block eq-${quote.effect ?? 'rise'}${quote.caps ? ' uppercase' : ''}${leaving ? ' eq-out' : ''} flex flex-col items-center gap-[clamp(1.25rem,3.4vw,4rem)]`}
      >
        {quote.lines.map((line, lineIndex) => {
          let local = 0
          const words = toWords(line)
          const total = words.reduce((sum, word) => sum + [...word].length, 0)

          return (
            <p key={line} className={`eq-line-${lineIndex}`} aria-label={line}>
              {words.map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  {wordIndex > 0 ? ' ' : null}
                  <span
                    aria-hidden="true"
                    className={`eq-word-${wordIndex} inline-block whitespace-nowrap`}
                  >
                    {[...word].map((char, charIndex, chars) => {
                      const order = counter
                      const lineOrder = local
                      const last =
                        wordIndex === words.length - 1 &&
                        charIndex === chars.length - 1
                      counter += 1
                      local += 1

                      return (
                        <span
                          key={charIndex}
                          className={last ? 'eq-char eq-last' : 'eq-char'}
                          style={{
                            '--i': order,
                            '--k': lineOrder,
                            '--c': charIndex,
                            '--n': total,
                          }}
                        >
                          {char}
                        </span>
                      )
                    })}
                  </span>
                </Fragment>
              ))}
            </p>
          )
        })}
      </div>
    </div>
  )
}
