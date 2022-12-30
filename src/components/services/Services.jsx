import React from 'react'
import './services.css'
import {GiCheckMark} from 'react-icons/gi'

const services = () => {
  return (
    <section id='services'>
      <h5>What I Offer</h5>
      <h2>Services</h2>
      <div className="container services__container" >
        <article className="service">
          <div className="service__head">
            <h3>UI Design</h3>
          </div>
          <ul className="service__list">
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Responsive design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Fast & Easy Navigation</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Modern UI design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Animation effects</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Mobile design</p>
            </li>
          </ul>
        </article>

        <article className="service">
          <div className="service__head">
            <h3>Web Development</h3>
          </div>
          <ul className="service__list">
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Web design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Frontend & Backend Connectivity</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Backend Design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Component Creation</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Model Creation</p>
            </li>
          </ul>
        </article>

        <article className="service">
          <div className="service__head">
            <h3>Problem Solving</h3>
          </div>
          <ul className="service__list">
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Web design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Responsive design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Fast & Easy Navigation</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Modern UI design</p>
            </li>
            <li>
              <GiCheckMark className='service__list-icon' />
              <p>Animation effects</p>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default services
