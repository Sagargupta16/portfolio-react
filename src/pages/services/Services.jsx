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
  },
  {
    id: 4,
    title: 'Data Science',
    list: [
      'Data Analysis',
      'Data Visualization',
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing'
    ]
  },
  {
    id: 5,
    title: 'Cloud Computing',
    list: [
      'Cloud Deployment',
      'Cloud Storage',
      'Cloud Security',
      'Cloud Networking',
      'Cloud Monitoring'
    ]
  },
  {
    id: 6,
    title: 'DevOps',
    list: [
      'Continuous Integration',
      'Continuous Delivery',
      'Continuous Deployment',
      'Continuous Monitoring',
      'Continuous Testing'
    ]
  }
]

const Services = () => (
  <section id="services">
    <h5>What I Offer</h5>
    <h2>Services</h2>
    <div className="container services__container">
      {ServiceArray.map(item => (
        <ServiceItem item={item} key={item.id} />
      ))}
    </div>
  </section>
)

export default Services
