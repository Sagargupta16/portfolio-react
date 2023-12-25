import React from 'react'
import './services.css'
import ServiceItem from './serviceitem'

const ServiceArray = [
  {
    id: 1,
    title: 'UI/UX Design',
    list: [
      'Web Design',
      'Mobile App Design',
      'Wireframing',
      'Prototyping',
      'User Research'
    ]
  },
  {
    id: 2,
    title: 'Web Development',
    list: [
      'Frontend Development',
      'Backend Development',
      'Fullstack Development',
      'Responsive Web Design',
      'Web App Development'
    ]
  },
  {
    id: 3,
    title: 'Competitive Programming',
    list: [
      'Data Structures',
      'Algorithms',
      'Problem Solving',
      'Dynamic Programming',
      'Code Debugging'
    ]
  }
]

const services = () => {
  return (
    <section id="services">
      <h5>What I Offer</h5>
      <h2>Services</h2>
      <div className="container services__container">
        {ServiceArray.map(item => {
          return <ServiceItem item={item} key={item.id} />
        })}
      </div>
    </section>
  )
}

export default services
