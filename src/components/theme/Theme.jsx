import { AiOutlineBgColors } from 'react-icons/ai'
import './theme.css'
import themes from './themes'

const Theme = () => {
  const nextTheme = () => {
    const currentTheme = themes[Math.floor(Math.random() * themes.length) % themes.length]
    Object.keys(currentTheme.colors).forEach(property => {
      document.documentElement.style.setProperty(`--color-${property}`, currentTheme.colors[property])
    })
  }

  return (
    <button
      className="theme"
      onClick={nextTheme}
      title="Change theme"
      type="button"
      aria-label="Change theme"
    >
      <AiOutlineBgColors />
    </button>
  )
}

export default Theme
