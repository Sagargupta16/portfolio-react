import React from 'react'
import './experience.css'
import ExperienceItem from './experienceitem'
import { experienceArray, positionOfResponsibilityArray } from './experienceArray'

const Experience = () => {
  return (
    <section id="experience">
      <h5>Experience I got!!</h5>
      <h2>My Experience</h2>
      <div className="experience__container container">
        <h3 className="experience__heading">Industrial Experiece</h3>
        {experienceArray.map(item => (
          <ExperienceItem item={item} key={item.id} />
        ))}
      </div>
      <div className="experience__container container">
        <h3 className="experience__heading">Position of Responsibility</h3>
        {positionOfResponsibilityArray.map(item => (
          <ExperienceItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}

export default Experience
