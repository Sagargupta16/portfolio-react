import React from 'react'
import './skill.css'
import {BsPatchCheckFill} from 'react-icons/bs'

function Skill() {
  return (
    <section id='skill'>
      <h5>What Skills I Have</h5>
      <h2>My Skills</h2>
      <div className="container skill__container">
        {/* Full Stack Start */}
        <div className="skill__item">
          <h3>Fullstack Development</h3>
          <div className="skill__content">
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
                <h4>HTML</h4>
                <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
                <h4>CSS</h4>
                <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
                <h4>JavaScript</h4>
                <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
                <h4>React JS</h4>
                <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
                <h4>Node Js</h4>
                <small className='text-light'>Beginner</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Express Js</h4>
              <small className='text-light'>Beginner</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Mongo DB</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
          </div>
        </div>
        {/* FullStack End */}
        {/* Programming Start */}
        <div className="skill__item">
          <h3>Programming Languages</h3>
          <div className="skill__content">
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>C++</h4>
              <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Java</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>C</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>R</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Python</h4>
              <small className='text-light'>beginner</small>
              </div>
            </article>
          </div>
        </div>
        {/* Programming End */}
        {/* CourseWork Start */}
        <div className="skill__item">
          <h3>Coursework</h3>
          <div className="skill__content">
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Data Structures</h4>
              <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Web Development</h4>
              <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>OOPs</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Game Development</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Databases</h4>
              <small className='text-light'>Beginner</small>
              </div>
            </article>
          </div>
        </div>
        {/* CourseWork End */}
        {/* Tools Start */}
        <div className="skill__item">
          <h3>Tools , Editors and IDEs</h3>
          <div className="skill__content">
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Unity Engine</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>VS Code</h4>
              <small className='text-light'>Experienced</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Oracle DB</h4>
              <small className='text-light'>Beginner</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>R Studio</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>IntelliJ</h4>
              <small className='text-light'>Intermediate</small>
              </div>
            </article>
          </div>
        </div>
        {/* Tools End */}
        {/* Soft Skills Start*/}
        <div className="skill__item">
          <h3>Soft Skills</h3>
          <div className="skill__content">
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Problem Solving</h4>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Leadership</h4>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Teamwork</h4>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Critical Thinking</h4>
              </div>
            </article>
            <article className='skill__details'>
              <BsPatchCheckFill className='skill__details-icons'/>
              <div>
              <h4>Communication</h4>
              </div>
            </article>
          </div>
        </div>
        {/* Soft Skills Ends*/}
      </div>
    </section>
  )
}

export default Skill
