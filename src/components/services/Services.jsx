import React from 'react'
import './services.css'
import ServiceItem from './serviceitem'

const ServiceArray = [
  {
    id: 1,
    title: 'UI Design',
    list: [
      'Responsive design',
      'Fast & Easy Navigation',
      'Modern UI design',
      'Animation effects',
      'Mobile design'
    ]
  },
  {
    id: 2,
    title: 'Web Development',
    list: [
      'Web design',
      'Frontend & Backend Connectivity',
      'Backend Design',
      'Component Creation',
      'Model Creation'
    ]
  },
  {
    id: 3,
    title: 'Problem Solving',
    list: [
      'Data Structures',
      'Algorithms',
      'Problem Solving',
      'Logic Building',
      'Debugging'
    ]
  }
]

const services = () => {
  return (
    <section id='services'>
      <h5>What I Offer</h5>
      <h2>Services</h2>
      <div className="container services__container" >
        {ServiceArray.map((item) => {
          return (
              <ServiceItem item={item} />
          );
        })}
      </div>
    </section>
  )
}

export default services
