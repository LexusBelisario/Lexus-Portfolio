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

const tech = (label, keyword) => ({ label, src: findSvg(keyword) })

const react = tech('React', 'react')
const tailwind = tech('Tailwind CSS', 'tailwind')
const postgres = tech('PostgreSQL', 'postgres')
const python = tech('Python', 'python')
const css = tech('CSS3', 'css')
const java = tech('Java', 'java')
const arduino = tech('Arduino', 'arduino')
const c = tech('C', '/c.svg')
const vb = { ...tech('Visual Basic', 'visualbasic'), chip: true }
const database = tech('Database', 'database')
const fastapi = tech('FastAPI', 'fastapi')
const docker = tech('Docker', 'docker')

export const groups = [
  {
    id: 'school',
    title: 'School Projects',
    projects: [
      {
        id: 'gps-tracker',
        title: 'Arduino Nano-Based GPS Tracker',
        period: 'August 22, 2022 - December 20, 2022',
        stack: [java, arduino, c, database],
        description:
          'This is our first group project from our first Cognate-Electives subject. The system is based on a GPS Tracker that can track people wherever they go.',
        members: [
          'Lexus Belisario (Leader)',
          'Dave Cabab',
          'Ernesto Batang Jr.',
          'Jeric Durana',
          'Cris John Andres',
        ],
        more: '',
        link: { label: 'Documentation', href: '' },
      },
      {
        id: 'watch-dogs',
        title: 'Watch Dogs: Pet Services System',
        period: 'October 4, 2021 - December 15, 2021',
        stack: [vb, database],
        description:
          "A 2nd-year Advanced Programming project built with VB.NET alongside my classmate Dindo Reyes. Together we have finished the project. It's a management system for any pet stores, specifically with dogs, handling products and grooming services with a fun Watch_Dogs theme to it (it is powered by ctOS!).",
        members: ['Lexus Belisario (Leader)', 'Dindo Reyes'],
        more: '',
        link: null,
      },
      {
        id: 'autoaquamans',
        title: 'Automated Aquaculture Monitoring System (AutoAquaManS)',
        period: 'August 12, 2024 - March 1, 2025',
        stack: [python, database, arduino, react, c, tailwind],
        description:
          'Our Capstone Project, an IoT and Machine Learning system (YOLOv8) for monitoring catfish vitality. It tracks water quality, temperature, pH, dissolved oxygen, and turbidity, while using computer vision to count fish, detect mortality, and alert users via a web dashboard.',
        members: [
          'Lexus Belisario (Leader)',
          'Ernesto Batang Jr.',
          'Jeric Durana',
          'John Daniel Furaque',
          'Nica Corpuz',
        ],
        more: '',
        link: { label: 'Repo', href: '' },
      },
    ],
  },
  {
    id: 'work',
    title: 'Work Projects',
    projects: [
      {
        id: 'lawchat',
        title: 'LawChat Dashboard',
        period: 'March 4, 2024 - April 30, 2024',
        stack: [react, tailwind],
        description:
          'During my OJT, my team built the foundation for LawSys Admin, the very first real web app I helped develop. As a front-end developer, I translated Figma UI/UX designs into responsive React and Tailwind CSS interfaces, using custom hooks to connect components with an Express.js backend to display and manage live user data.',
        members: null,
        more: '',
        link: { label: 'Link', href: '' },
      },
      {
        id: 'blgf',
        title: 'BLGF Web App',
        period: 'August 11, 2025 - Present',
        stack: [react, tailwind, postgres, python, fastapi, css],
        description:
          'A fullstack project at Integrated Geosys Development Inc. where I modernized the BLGF GIS Web Application. I took charge of the UI/UX redesign using React and Tailwind, built FastAPI endpoints and PostgreSQL schemas for role-based auth (Municipal vs. Provincial), and developed GIS features like parcel subdivision, consolidation, and a Spatial Data Manager for PostGIS datasets (.shp, .gpkg).',
        members: null,
        more: '',
        link: { label: 'Link', href: '' },
      },
      {
        id: 'cama-ai-tools',
        title: 'AI Tools - Computer Assisted Mass Appraisal',
        period: 'March 4, 2024 - April 30, 2024',
        stack: [react, tailwind, postgres, python, docker],
        description:
          'A mostly solo-developed AI module built for Computer Assisted Mass Appraisal (CAMA) to auto-appraise land parcels that lack unit values. Using React and Python ML models (XGBoost, Random Forest, Linear Regression), the tool calculates land predictions, visualizes residual errors via charts and map overlays, and exports updated GIS Shapefiles and PDF evaluation reports. Fully Dockerized for VM deployment.',
        members: null,
        more: '',
        link: { label: 'Repo', href: '' },
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Projects',
    projects: [
      {
        id: 'wd-recreation',
        title: 'Recreation of the WD: Pet Service System',
        period: 'Currently on planning stage',
        stack: [react, tailwind, postgres, python, css],
        description:
          'A recreation of my Watch Dogs-themed pet store management system from school, rebuilt as a modern web app.',
        members: null,
        more: '',
        link: { label: 'Link', href: '' },
      },
    ],
  },
]