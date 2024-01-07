import React from 'react'
import './education.css'
import EducationItem from './educationitem'
import educationArray from './educationArray'

const Education = () => {
  return (
    <section id="education">
      <h5>What Qualifications I Have</h5>
      <h2>My Education</h2>
      <div className="container education__container">
        {educationArray.map(item => (
          <EducationItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}

export default Education
