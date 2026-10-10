import weMajor from '../assets/icons/wemajor.svg'

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

export const education = [
  {
    place: 'Rizal Technological University - Pasig Campus',
    detail: "Bachelor's of Science in Computer Engineering",
    period: 'August 2020 - July 2025',
  },
  {
    place: 'AMA Computer Learning Center - Caloocan Campus',
    detail: 'Humanities and Social Sciences',
    period: 'June 2018 - June 2020',
  },
]

export const work = [
  {
    place: 'Intelliseven Technology Solutions Inc.',
    detail: 'Front-end Developer - Intern',
    location: 'Quezon City',
    period: 'February 2020 - April 2024',
  },
  {
    place: 'Integrated GeoSys Development Inc.',
    detail: 'Software Developer',
    location: 'Antipolo, Rizal',
    period: 'August 2025 - Present',
  },
]

export const spotify = {
  src: weMajor,
  href: 'https://open.spotify.com/track/46fk9wjYcPm0sgym2b7EEE?si=e42559c1c59f481e',
  label: 'Listen to We Major on Spotify',
}

export const activeStack = [
  { label: 'React', src: findSvg('react') },
  { label: 'Python', src: findSvg('python') },
  { label: 'FastAPI', src: findSvg('fastapi') },
  { label: 'PostgreSQL', src: findSvg('postgres') },
  { label: 'Docker', src: findSvg('docker') },
  { label: 'HTML5', src: findSvg('html') },
  { label: 'CSS3', src: findSvg('css') },
]

export const exploring = [
  { label: 'TypeScript', src: findSvg('typescript') },
  { label: 'Java', src: findSvg('java') },
  { label: 'MongoDB', src: findSvg('mongo') },
  { label: 'Figma', src: findSvg('figma') },
]