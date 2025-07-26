import React from 'react'
import './header.css'
import CtaComponent from './CTA'
import ME from '../../assets/images/me.png'
import HeaderSocials from './HeaderSocials'
import TwComponent from './TW'
import { getName, getRoles } from '../../data/dataLoader'

const Header = () => {
  const name = getName()
  const roles = getRoles()

  return (
    <section className="header" id="header">
      <div className="container header__container">
        <h5>Hey Myself</h5>
        <h1>{name}</h1>
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
