import { useRef, useState } from 'react'
import { useInView, useScrollVars } from '../hooks/scroll'
import { groups } from '../data/projects'
import './section_transition.css'

const delay = (ms) => ({ '--d': ms })

const linkBase = 'text-white/85 transition-colors motion-reduce:transition-none'

const showPlaceholders = import.meta.env.DEV

function Reveal({ className = '', children }) {
  const [ref, inView] = useInView(0, '0px 0px -12% 0px', true)

  return (
    <div ref={ref} className={`${className} ${inView ? 'about-in' : ''}`}>
      {children}
    </div>
  )
}

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className="size-[1.2em] shrink-0"
    >
      <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z" />
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className="size-[1.2em] shrink-0"
    >
      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className="size-[1.2em] shrink-0"
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}

const groupIcons = {
  school: CapIcon,
  work: BriefcaseIcon,
  personal: NoteIcon,
}

function LiveDot() {
  return (
    <span className="relative inline-flex size-[0.55em]" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-[#a9a2ff] opacity-70 motion-safe:animate-ping" />
      <span className="relative size-full rounded-full bg-[#a9a2ff]" />
    </span>
  )
}

function TechIcon({ tech }) {
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
      className={`size-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110 ${tech.chip ? 'rounded-md bg-white p-0.5' : ''}`}
    />
  )
}

function FooterLink({ label, href }) {
  if (!href) {
    if (!showPlaceholders) return null

    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className="inline-flex cursor-default items-center gap-2 text-white/50"
      >
        {label}
        <span className="rounded-full border border-white/25 px-2 py-0.5 text-[0.65em] uppercase tracking-widest">
          Soon
        </span>
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${linkBase} hover:text-[#a9a2ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9a2ff]`}
    >
      {label}
    </a>
  )
}

function ProjectCard({ project, baseDelay }) {
  const { title, period, stack, description, members, more, link } = project
  const isLive = period.endsWith('Present')
  const hasMore = Boolean(more) || showPlaceholders
  const hasLink = Boolean(link) && (Boolean(link.href) || showPlaceholders)

  return (
    <li
      className="reveal min-h-[28rem] shrink-0 basis-[85%] snap-start sm:basis-[calc((100%_-_var(--gap))/2)] lg:min-h-0 lg:aspect-[550/580] lg:basis-[calc((100%_-_2*var(--gap))/3)]"
      style={delay(baseDelay)}
    >
      <article className="relative isolate flex h-full flex-col gap-[clamp(0.75rem,0.85vw,1.1rem)] rounded-[20px] border border-white/20 bg-[image:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(15,23,42,0.05))] p-[clamp(1rem,1.6vw,2rem)] shadow-[0_4px_40px_rgba(0,0,0,0.25)] transition-all duration-500 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[image:radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(96,128,255,0.2),transparent_70%)] before:opacity-0 before:transition-opacity before:duration-500 hover:-translate-y-1.5 hover:border-[rgba(140,165,255,0.5)] hover:shadow-[0_4px_40px_rgba(0,0,0,0.25),0_0_24px_rgba(96,128,255,0.3),0_0_48px_rgba(70,95,230,0.2)] hover:before:opacity-100 focus-within:border-[rgba(140,165,255,0.5)] focus-within:shadow-[0_4px_40px_rgba(0,0,0,0.25),0_0_24px_rgba(96,128,255,0.3),0_0_48px_rgba(70,95,230,0.2)] focus-within:before:opacity-100 motion-reduce:transition-none motion-reduce:before:transition-none">
        <header className="flex flex-col gap-[0.4em]">
          <h4 className="text-[clamp(1rem,1.25vw,1.6rem)] font-bold leading-snug">
            {title}
          </h4>
          <p className="flex items-center gap-2 text-[clamp(0.72rem,0.85vw,1.05rem)] italic text-white/60">
            {period}
            {isLive ? <LiveDot /> : null}
          </p>
        </header>

        <ul className="flex flex-wrap items-center gap-[clamp(0.5rem,1vw,1.25rem)]">
          {stack.map((tech, index) => (
            <li
              key={tech.label}
              className="reveal-pop size-[clamp(1.5rem,1.9vw,2.4rem)] shrink-0"
              style={delay(baseDelay + 250 + index * 70)}
            >
              <TechIcon key={tech.src || 'none'} tech={tech} />
            </li>
          ))}
        </ul>

        <p className="text-left text-[clamp(0.75rem,0.9vw,1.1rem)] leading-relaxed text-white/85">
          {description}
        </p>

        {members ? (
          <div className="flex flex-col gap-[0.4em] text-[clamp(0.72rem,0.8vw,1rem)]">
            <p className="font-semibold">Group Members:</p>
            <ul className="list-disc pl-5 leading-snug text-white/80">
              {members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasMore || hasLink ? (
          <footer className="mt-auto flex items-center justify-between border-t border-white/12 pt-[clamp(0.6rem,0.9vw,1rem)] text-[clamp(0.7rem,0.8vw,1rem)]">
            {hasMore ? <FooterLink label="View More" href={more} /> : null}
            {hasLink ? (
              <span className="ml-auto">
                <FooterLink label={link.label} href={link.href} />
              </span>
            ) : null}
          </footer>
        ) : null}
      </article>
    </li>
  )
}

function Group({ group }) {
  const headingId = `proj-${group.id}`
  const Icon = groupIcons[group.id] ?? CapIcon

  return (
    <Reveal>
      <section
        aria-labelledby={headingId}
        className="flex flex-col gap-[clamp(1rem,1.6vw,1.75rem)]"
      >
        <h3
          id={headingId}
          className="reveal flex items-center gap-3 text-[clamp(1.1rem,1.3vw,1.6rem)] font-semibold"
          style={delay(0)}
        >
          <Icon />
          {group.title}
        </h3>

        <ul
          tabIndex={0}
          aria-label={`${group.title} list`}
          className="-mx-6 -my-12 flex snap-x snap-mandatory scroll-px-6 gap-[var(--gap)] overflow-x-auto overflow-y-hidden px-6 py-12 [--gap:clamp(1rem,3.85vw,4.625rem)] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a9a2ff] sm:-mx-10 sm:scroll-px-10 sm:px-10 lg:-mx-[min(3.23vw,62px)] lg:scroll-px-[min(3.23vw,62px)] lg:px-[min(3.23vw,62px)]"
        >
          {group.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              baseDelay={150 + index * 140}
            />
          ))}
        </ul>
      </section>
    </Reveal>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)
  useScrollVars(sectionRef)

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full overflow-hidden bg-[image:linear-gradient(to_bottom,#2b0f0b_0%,#140c0f_14%,#0a111f_50%,#060a12_100%)] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_26vh)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_26vh)]"
        aria-hidden="true"
      >
        <span className="absolute left-[0.83vw] top-[17.19vw] size-[31.25vw] rounded-full bg-[#272757] blur-[7.8125vw]" />
        <span className="absolute left-[34.27vw] top-[6.15vw] size-[31.25vw] rounded-full bg-[#272757] blur-[7.8125vw]" />
        <span className="absolute left-[34.27vw] top-[13.54vw] size-[31.25vw] rounded-full bg-[#6c6c6c] blur-[7.8125vw]" />
        <span className="absolute left-[68.96vw] top-[15.94vw] size-[31.25vw] rounded-full bg-[#272757] blur-[7.8125vw]" />
      </div>

      <div className="exp-enter relative z-10 mx-auto flex w-full max-w-[1920px] flex-col gap-[clamp(2.5rem,4vw,4.5rem)] px-6 py-24 sm:px-10 lg:px-[min(3.23vw,62px)]">
        <Reveal>
          <div
            className="reveal flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[clamp(1rem,1.2vw,1.5rem)] font-medium"
            style={delay(0)}
          >
            <span>TRACK 03:</span>
            <h2 className="font-semibold">My Projects</h2>
          </div>
        </Reveal>

        {groups.map((group) => (
          <Group key={group.id} group={group} />
        ))}
      </div>
    </section>
  )
}
