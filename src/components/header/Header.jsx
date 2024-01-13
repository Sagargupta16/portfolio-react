import React from 'react'
import './header.css'
import CtaComponent from './CTA'
import ME from '../../assets/images/me.png'
import HeaderSocials from './HeaderSocials'
import TwComponent from './TW'

const Header = () => {
  const roles = [
    'Fullstack Developer',
    'Competitive Programmer',
    'Problem Solver',
    'Data Structures and Algorithms Enthusiast',
    'Open Source Contributor',
    'Tech Enthusiast'
  ]

  return (
    <section className="header" id="header">
      <div className="container header__container">
        <h5>Hey Myself</h5>
        <h1>Sagar Gupta</h1>
        <h5 className="text-light tw_comp">
          I'm a <TwComponent roles={roles} />
        </h5>
        <CtaComponent />
        <HeaderSocials />
        <div className="me">
          <img src={ME} alt="me" />
        </div>
      </div>
    </section>
  )
}

export default Header
