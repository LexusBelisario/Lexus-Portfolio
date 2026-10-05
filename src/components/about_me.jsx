import { useState } from 'react'
import { useInView, useScrollVars } from '../hooks/scroll'
import gradBear from '../assets/icons/gradbear.png'
import gradPic from '../assets/images/grad_pic.png'
import './section_transition.css'

const svgFiles = import.meta.glob('../assets/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const findSvg = (keyword, fallback) => {
  const path = Object.keys(svgFiles).find((key) =>
    key.toLowerCase().includes(keyword),
  )
  return path ? svgFiles[path] : fallback
}

const techStack = [
  { label: 'React', src: findSvg('react', '/icons/react.svg') },
  { label: 'Python', src: findSvg('python', '/icons/python.svg') },
  { label: 'PostgreSQL', src: findSvg('postgres', '/icons/postgresql.svg') },
  { label: 'HTML5', src: findSvg('html', '/icons/html5.svg') },
  { label: 'CSS3', src: findSvg('css', '/icons/css3.svg') },
]

const paragraphs = [
  'I am a BS Computer Engineering Graduate (2025) at Rizal Technological University - Pasig Campus, currently working as a Full-Stack Software Developer for a year. I also have 2 years of experience in programming different kinds of software including hardware integration.',
  'While I personally love Front-end development, and have a strong passion for improving website experiences, and bringing anything that you design to life, I am highly flexible, growth-oriented, and willing to learn and adapt to new programming languages, modern frameworks, tech stacks, and committed to continuously evolving alongside industry trends.',
]

const delay = (ms) => ({ '--d': ms })

function TechIcon({ tech }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="flex size-full items-center justify-center rounded-full bg-white/15 text-xs font-bold">
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
      className="size-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:scale-110"
    />
  )
}

export default function AboutMe() {
  const [sectionRef, inView] = useInView(0, '0px 0px -22% 0px')
  useScrollVars(sectionRef)

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`about relative flex min-h-screen w-full items-center overflow-hidden text-white ${inView ? 'about-in' : ''}`}
    >
      <div className="about-glow" aria-hidden="true" />

      <div className="about-leave relative z-10 mx-auto flex w-full max-w-[1360px] flex-col gap-14 px-6 pb-20 pt-28 sm:px-10 lg:flex-row lg:items-start lg:justify-between lg:gap-[4vw] lg:pb-16 lg:pt-24">
        <div className="flex min-w-0 flex-col lg:flex-1">
          <div className="grid w-fit grid-cols-[auto_1fr] items-center gap-x-[clamp(0.75rem,1.1vw,1.5rem)] gap-y-[clamp(0.4rem,0.6vw,0.9rem)] text-[clamp(1rem,1.1vw,1.55rem)] font-medium">
            <span className="reveal justify-self-end" style={delay(0)}>
              TRACK 01:
            </span>

            <div className="flex items-center gap-[clamp(0.75rem,1vw,1.4rem)]">
              <h2
                className="reveal text-[clamp(1.3rem,1.5vw,2.2rem)] font-extrabold leading-none"
                style={delay(120)}
              >
                ABOUT ME
              </h2>
              <img
                src={gradBear}
                alt=""
                className="reveal-pop size-[clamp(1.9rem,2vw,3rem)] object-contain"
                style={delay(520)}
              />
            </div>

            <span className="reveal justify-self-end" style={delay(200)}>
              ARTIST:
            </span>
            <span className="reveal font-semibold" style={delay(320)}>
              LEXUS BELISARIO
            </span>
          </div>

          <div
            className="reveal-line mt-[clamp(1.5rem,2.4vw,3.2rem)] h-px w-[clamp(4rem,6vw,8rem)] bg-linear-to-r from-white/80 to-transparent"
            style={{ ...delay(300), transformOrigin: 'left center' }}
          />

          <div className="mt-[clamp(1.25rem,2vw,2.8rem)] flex max-w-[31em] flex-col gap-[1.1em] text-justify text-[clamp(1rem,1.22vw,1.7rem)] font-light leading-[1.5] text-white/95 hyphens-auto [text-shadow:0_1px_18px_rgba(40,0,35,0.45)]">
            {paragraphs.map((paragraph, index) => (
              <p
                key={paragraph.slice(0, 24)}
                className="reveal"
                style={delay(380 + index * 160)}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col self-center lg:w-[25vw] lg:max-w-[34rem] lg:shrink-0 lg:self-start">
          <ul className="flex items-center justify-end gap-[clamp(0.8rem,1.5vw,2rem)] pb-[clamp(0.4rem,0.6vw,0.9rem)]">
            {techStack.map((tech, index) => (
              <li
                key={tech.label}
                className="reveal-pop size-[clamp(1.9rem,2.1vw,3rem)]"
                style={delay(280 + index * 90)}
              >
                <TechIcon tech={tech} />
              </li>
            ))}
          </ul>

          <div className="reveal-line h-px bg-white" style={delay(180)} />

          <p
            className="reveal pt-[clamp(0.4rem,0.6vw,0.9rem)] text-right text-[clamp(0.95rem,1.1vw,1.55rem)] font-medium"
            style={delay(560)}
          >
            MY CURRENT TECH STACKS
          </p>

          <div className="about-parallax mt-[clamp(1.25rem,1.8vw,2.4rem)]">
            <div className="polaroid-tilt relative">
              <span
                className="tape reveal-pop absolute -top-[2.4%] left-1/2 z-10 h-[5.5%] w-[26%] -translate-x-1/2 -rotate-3"
                style={delay(1000)}
                aria-hidden="true"
              />
              <img
                src={gradPic}
                alt="Me in Grad Pic :))"
                className="polaroid block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
