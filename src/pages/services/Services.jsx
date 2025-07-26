import React from 'react'
import './Services.css'
import ServiceItem from './serviceitem'
import ServiceArray from './ServicesArray'

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

