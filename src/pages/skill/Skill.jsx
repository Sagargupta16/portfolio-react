import React from 'react'
import './skill.css'
import { BsPatchCheckFill } from 'react-icons/bs'
import skills from './skillsArray'

function Skill() {
  return (
    <section id="skill">
      <h5>What Skills I Have</h5>
      <h2>My Skills</h2>
      <div className="container skill__container">
        {Object.keys(skills).map(skillCategory => (
          <div className="skill__card" key={skillCategory}>
            <h3 className="skill__title">{skillCategory}</h3>
            <div className="skill__list">
              {skills[skillCategory].sort().map(skillItem => (
                <div key={skillItem} className="skill__item">
                  <BsPatchCheckFill className="skill__icon" />
                  {skillItem}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skill
