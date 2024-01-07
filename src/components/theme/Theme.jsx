import { AiOutlineBgColors } from 'react-icons/ai'
import './theme.css'
import themes from './themes'

const Theme = () => {
  const nextTheme = () => {
    const nextIndex = Math.floor(Math.random() * themes.length) % themes.length
    const root = document.documentElement
    const currentTheme = themes[nextIndex]

    Object.entries(currentTheme.colors).forEach(([property, value]) => {
      root.style.setProperty(`--color-${property}`, value)
    })
  }

  return (
    <div className="theme">
      <div
        onClick={() => {
          nextTheme()
        }}
      >
        <AiOutlineBgColors />
      </div>
    </div>
  )
}

export default Theme
