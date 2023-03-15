import React from 'react'
import { useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './nav.css'
import {RiHome3Line,RiServiceLine} from 'react-icons/ri'
import {AiOutlineUser,AiOutlineMessage} from 'react-icons/ai'
import {GoPencil} from 'react-icons/go'
import {GiSuitcase,GiChatBubble,GiSkills} from 'react-icons/gi'


const Nav = () => {
  const [activeNav, setActiveNav] = useState('#');
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <>
      <button className='nav-btn' onClick={() => document.querySelector('.nav').classList.toggle('active')}>
        <span className='nav-btn__line'></span>
        <span className='nav-btn__line'></span>
        <span className='nav-btn__line'></span>
      </button>
      <nav className='nav'>
        <Link to="/" className={activeNav === '#' ? 'active' : ''} onClick={() => setActiveNav('#')} alt="Home"><RiHome3Line/></Link>
        <Link to="/about" className={activeNav === 'about' ? 'active' : ''} onClick={() => setActiveNav('about')} alt="About"><AiOutlineUser/></Link>
        <Link to="/education" className={activeNav === 'education' ? 'active' : ''} onClick={() => setActiveNav('education')} alt="Education"><GoPencil/></Link>
        <Link to="/skill" className={activeNav === 'skill' ? 'active' : ''} onClick={() => setActiveNav('skill')} alt="Skills"><GiSkills/></Link>
        <Link to="/services" className={activeNav === 'services' ? 'active' : ''} onClick={() => setActiveNav('services')} alt="Services"><RiServiceLine/></Link>
        <Link to="/portfolio" className={activeNav === 'portfolio' ? 'active' : ''} onClick={() => setActiveNav('portfolio')} alt="Portfolio"><GiSuitcase/></Link>
        <Link to="/testimonial" className={activeNav === 'testimonial' ? 'active' : ''} onClick={() => setActiveNav('testimonial')} alt="Testimonial"><GiChatBubble/></Link>
        <Link to="/contact" className={activeNav === 'contact' ? 'active' : ''} onClick={() => setActiveNav('contact')} alt="Contact"><AiOutlineMessage/></Link>
      </nav>
    </>
  )
}

export default Nav
