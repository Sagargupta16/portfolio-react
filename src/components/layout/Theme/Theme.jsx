import { useCallback } from 'react'
import { AiOutlineBgColors } from 'react-icons/ai'
import themes from './themes.js'
import './Theme.css'

const Theme = () => {
  const nextTheme = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * themes.length)
    const currentTheme = themes[randomIndex]

    for (const [property, value] of Object.entries(currentTheme.colors)) {
      document.documentElement.style.setProperty(`--color-${property}`, value)
    }
  }, [])

  return (
    <button className="theme" onClick={nextTheme} title="Change theme" type="button" aria-label="Change color theme">
      <AiOutlineBgColors aria-hidden="true" />
    </button>
  )
}

export default Theme
