import Navbar from './components/navbar'
import LandingPage from './components/landing_page'
import AboutMe from './components/about_me'
import Experience from './components/experience'
import Secret from './components/secret'
import { useSmoothAnchors } from './hooks/scroll'

export default function App() {
  useSmoothAnchors()

  if (window.location.pathname.replace(/\/+$/, '') === '/secret') {
    return <Secret />
  }

  return (
    <>
      <Navbar />
      <LandingPage />
      <AboutMe />
      <Experience />
    </>
  )
}
