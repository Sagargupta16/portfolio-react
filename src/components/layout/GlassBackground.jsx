import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const GlassBackground = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll()

  // Each orb moves at different parallax speeds
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -350])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -280])
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -420])
  const y6 = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div className="glass-bg" ref={ref} aria-hidden="true">
      <motion.div className="glass-orb glass-orb-1" style={{ y: y1 }} />
      <motion.div className="glass-orb glass-orb-2" style={{ y: y2 }} />
      <motion.div className="glass-orb glass-orb-3" style={{ y: y3 }} />
      <motion.div className="glass-orb glass-orb-4" style={{ y: y4 }} />
      <motion.div className="glass-orb glass-orb-5" style={{ y: y5 }} />
      <motion.div className="glass-orb glass-orb-bg" style={{ y: y6 }} />
    </div>
  )
}

export default GlassBackground
