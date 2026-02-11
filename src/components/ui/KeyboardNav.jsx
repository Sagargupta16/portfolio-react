import { useEffect, useCallback } from 'react'

const SECTIONS = [
  'hero',
  'about',
  'experience',
  'skills',
  'projects',
  'achievements',
  'education',
  'services',
  'github',
  'contact'
]

const KeyboardNav = () => {
  const getCurrentSectionIndex = useCallback(() => {
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const viewMiddle = scrollY + windowHeight * 0.35

    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      const el = document.getElementById(SECTIONS[i])
      if (el) {
        const rect = el.getBoundingClientRect()
        const top = rect.top + scrollY
        if (viewMiddle >= top) return i
      }
    }
    return 0
  }, [])

  const scrollToSection = useCallback(id => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleKeyDown = useCallback(
    e => {
      // Ignore when typing in input fields
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return

      // Number keys 1-9 jump to sections (0 = hero handled by 't')
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key)
        if (index < SECTIONS.length) {
          e.preventDefault()
          scrollToSection(SECTIONS[index])
        }
        return
      }

      // 0 or t = scroll to top (hero)
      if (e.key === '0' || e.key === 't') {
        e.preventDefault()
        scrollToSection('hero')
        return
      }

      // j = next section, k = previous section
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const current = getCurrentSectionIndex()
        const next = e.key === 'j' ? Math.min(current + 1, SECTIONS.length - 1) : Math.max(current - 1, 0)
        scrollToSection(SECTIONS[next])
      }
    },
    [getCurrentSectionIndex, scrollToSection]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}

export default KeyboardNav
