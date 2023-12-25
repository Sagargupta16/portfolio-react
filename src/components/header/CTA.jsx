import React from 'react'
import CV from '../../assets/Resume.pdf'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <div className="cta">
      <a href={CV} download className="btn">
        Download CV
      </a>
      {window.screen.width > 600 ? (
        <Link to="/contact" className="btn btn-primary">
          Let's Talk
        </Link>
      ) : (
        <a href="#contact" className="btn btn-primary">
          Let's Talk
        </a>
      )}
    </div>
  )
}

export default CTA
