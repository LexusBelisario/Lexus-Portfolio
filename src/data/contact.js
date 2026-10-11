import gmailIcon from '../assets/icons/gmail.svg'
import githubIcon from '../assets/icons/github.svg'
import linkedinIcon from '../assets/icons/linkedin.svg'

const svgFiles = import.meta.glob('../assets/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const findSvg = (keyword) => {
  const path = Object.keys(svgFiles).find((key) =>
    key.toLowerCase().includes(keyword),
  )
  return path ? svgFiles[path] : ''
}

export const email = ''

export const resume = {
  href: '/resume.pdf',
  label: 'Resume',
  heading: 'Download My Resume (PDF)',
  button: 'My Resume',
}

export const endLines = ['THE END', 'NOT QUITE THE END']

export const socialsHeading = 'My Socials:'

export const socials = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    src: linkedinIcon,
    href: 'https://www.linkedin.com/in/lexus-john-belisario/',
  },
  {
    id: 'github',
    label: 'GitHub',
    src: githubIcon,
    href: 'https://github.com/LexusBelisario',
  },
  {
    id: 'email',
    label: 'Email',
    src: gmailIcon,
    href: email ? `mailto:${email}` : '',
  },
]

export const builtWithHeading = 'This portfolio was created using:'

export const builtWith = [
  { label: 'React', src: findSvg('react') },
  { label: 'Tailwind CSS', src: findSvg('tailwind') },
  { label: 'CSS3', src: findSvg('css') },
  { label: 'Figma', src: findSvg('figma') },
]

export const legal = {
  owner: 'Lexus Belisario',
  since: 2025,
  rights: 'All rights reserved',
}
