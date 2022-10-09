import React from 'react'
import './nav.css'
import {RiHome3Line,RiServiceLine} from 'react-icons/ri'
import {AiOutlineUser,AiOutlineMessage} from 'react-icons/ai'
import {GoPencil} from 'react-icons/go'
import {GiSuitcase,GiChatBubble,GiSkills} from 'react-icons/gi'
import { useState } from 'react'
const Nav = () => {
  const [activeNav, setActiveNav] = useState('#');
  return (
    <nav>
      <a href='# ' onClick={()=> setActiveNav('#')} className={activeNav === '#' ? 'active' : ''}  
      alt="Home"><RiHome3Line/></a>
      <a href='#about' onClick={()=> setActiveNav('#about')} className={activeNav === '#about' ? 'active' : ''} alt="About" ><AiOutlineUser/></a>
      <a href='#education' onClick={()=> setActiveNav('#education')} className={activeNav === '#education' ? 'active' : ''} alt="Education"><GoPencil/></a>
      <a href='#skill' onClick={()=> setActiveNav('#skill')} className={activeNav === '#skill' ? 'mob-hid active' : 'mob-hid'} alt="Skills"><GiSkills/></a>
      <a href='#services' onClick={()=> setActiveNav('#services')} className={activeNav === '#services' ? 'active' : ''} alt="Services"><RiServiceLine/></a>
      <a href='#portfolio'onClick={()=> setActiveNav('#portfolio')} className={ activeNav === '#portfolio' ? 'mob-hid active' : 'mob-hid'} alt="Portfolio" ><GiSuitcase/></a>
      <a href='#testimonial'onClick={()=> setActiveNav('#testimonial')} className={ activeNav === '#testimonial' ? 'mob-hid active' : 'mob-hid'} alt="Testimonials" ><GiChatBubble/></a>
      <a href='#contact'onClick={()=> setActiveNav('#contact')} className={activeNav === '#contact' ? 'active' : ''} alt="Contact" ><AiOutlineMessage/></a>
    </nav>
  )
}

export default Nav
