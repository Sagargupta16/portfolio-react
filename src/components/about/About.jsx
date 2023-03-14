import React from 'react'
import './about.css'
import ME from '../../assets/me-about.jpg'
import {BsCodeSlash} from 'react-icons/bs'
import {MdDeveloperMode} from 'react-icons/md'
import {SiCodersrank} from 'react-icons/si'

const About = () => {
  return (
    <section id='about'>
      <h5>Get to Know</h5>
      <h2>About Me</h2>
      <div className="container about__container">
        <div className="about__me">
          <div className="about__me-image">
            <img src={ME} alt="about me" />
          </div>
        </div>
        <div className="about__content">
          <div className="about__cards">
            <article className='about__card'>
              <BsCodeSlash className='about__icon'/>
              <h5>Coding</h5>
              <small>1000+ Questions</small>
            </article>
            <article className='about__card'>
              <MdDeveloperMode className='about__icon'/>
              <h5>Projects</h5>
              <small>15+ Projects</small>
            </article>
            <article className='about__card'>
              <SiCodersrank className='about__icon'/>
              <h5>CP</h5>
              <small>50+ Contests</small>
            </article>
          </div>
        </div>
        <div className='about__text'>
            <p>
              👋 Hi, my name is Sagar Gupta, from Shivpuri, MP, India.<br/>
              I'm an Postgraduate 🎓 from NIT Warangal.<br/>
              I'm a Web developer & Programmer who loves to write clean and efficient code.<br/>
              Apart from web development I love Problem Solving with use of Data Structures and Algorithms in Efficient Way.
            </p>
            <a href="#contact" className="btn btn-primary">Let's Talk</a>
          </div>
      </div>
    </section>
  )
}

export default About
