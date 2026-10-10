import { useInView, useScrollVars } from '../hooks/scroll'
import { channels, closing } from '../data/contact'
import './section_transition.css'

const delay = (ms) => ({ '--d': ms })

const year = new Date().getFullYear()

const visibleChannels = channels
  .filter((channel) => channel.href || import.meta.env.DEV)
  .sort((a, b) => Number(!a.href) - Number(!b.href))

const focusRing =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a9a2ff]'

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[1.1em] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function Row({ channel, index }) {
  const { label, value, href, download } = channel
  const external = href.startsWith('http')

  const rowStyle =
    'flex items-baseline gap-4 border-b border-white/10 px-2 py-5 sm:gap-8'

  return (
    <li className="reveal" style={delay(260 + index * 100)}>
      {href ? (
        <a
          href={href}
          download={download ? '' : undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className={`group ${rowStyle} transition-colors duration-300 hover:bg-white/5 motion-reduce:transition-none ${focusRing}`}
        >
          <span className="w-24 shrink-0 text-xl font-semibold transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none sm:w-32">
            {label}
          </span>
          <span className="min-w-0 flex-1 break-words text-white/70 sm:text-right">
            {value}
          </span>
          <ArrowIcon />
        </a>
      ) : (
        <div aria-disabled="true" title="Coming soon" className={`${rowStyle} cursor-default`}>
          <span className="w-24 shrink-0 text-xl font-semibold text-white/50 sm:w-32">
            {label}
          </span>
          <span className="flex-1 text-right">
            <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-xs uppercase tracking-widest text-white/55">
              Coming soon
            </span>
          </span>
        </div>
      )}
    </li>
  )
}

function Record() {
  return (
    <div
      className="reveal-pop size-[clamp(9rem,16vw,15rem)] shrink-0"
      style={delay(700)}
      aria-hidden="true"
    >
      <div className="relative size-full rounded-full bg-[image:repeating-radial-gradient(circle_at_center,#0b0b10_0,#0b0b10_2px,#17171f_2px,#17171f_4px)] shadow-[0_1.2vw_3vw_rgba(0,0,0,0.6)] ring-1 ring-white/10 motion-safe:animate-[spin_28s_linear_infinite]">
        <span className="absolute inset-0 rounded-full bg-[image:conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.14)_36deg,transparent_84deg,transparent_180deg,rgba(255,255,255,0.1)_216deg,transparent_264deg)]" />
        <span className="absolute inset-[35%] rounded-full bg-[#d4a12c]" />
        <span className="absolute inset-[47.5%] rounded-full bg-black" />
      </div>
    </div>
  )
}

export default function Contact() {
  const [sectionRef, inView] = useInView(0, '0px 0px -22% 0px', true)
  useScrollVars(sectionRef)

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`relative flex min-h-screen w-full flex-col overflow-hidden bg-[image:linear-gradient(to_bottom,#060a12_0%,#05070d_55%,#000_100%)] text-white ${inView ? 'about-in' : ''}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(ellipse_50%_28%_at_72%_42%,rgba(212,161,44,0.12),transparent_70%),radial-gradient(ellipse_55%_24%_at_16%_82%,rgba(104,78,224,0.16),transparent_75%)]"
        aria-hidden="true"
      />

      <div className="exp-enter relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center gap-[clamp(2rem,4vw,4.5rem)] px-6 pb-10 pt-24 sm:px-10">
        <div
          className="reveal flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[clamp(1rem,1.2vw,1.5rem)] font-medium"
          style={delay(0)}
        >
          <span>TRACK 04:</span>
          <h2 className="font-semibold">Contact</h2>
        </div>

        <div className="grid gap-[clamp(2.5rem,5vw,6rem)] lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-[clamp(1.25rem,2vw,2.25rem)]">
            <h3
              className="reveal max-w-[14em] font-display text-[clamp(2rem,3.6vw,4.5rem)] leading-[1.08]"
              style={delay(120)}
            >
              {closing.title}
            </h3>
            <p
              className="reveal max-w-[30em] text-[clamp(1rem,1.15vw,1.5rem)] leading-relaxed text-white/80"
              style={delay(240)}
            >
              {closing.intro}
            </p>
            <Record />
          </div>

          <ul className="flex flex-col border-t border-white/10">
            {visibleChannels.map((channel, index) => (
              <Row key={channel.id} channel={channel} index={index} />
            ))}
          </ul>
        </div>
      </div>

      <footer className="relative z-10 mx-auto w-full max-w-[1360px] px-6 pb-8 sm:px-10">
        <div
          className="reveal-line h-px bg-white/20"
          style={{ ...delay(900), transformOrigin: 'left center' }}
        />
        <div
          className="reveal mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-[clamp(0.8rem,0.85vw,1rem)] text-white/70"
          style={delay(1000)}
        >
          <span className="font-semibold tracking-widest">THE END</span>
          <span>Super Deluxe Edition</span>
          <span>&copy; {year} Lexus Belisario</span>
          <a
            href="#home"
            className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff] motion-reduce:transition-none"
          >
            Back to top
          </a>
        </div>
      </footer>
    </section>
  )
}
