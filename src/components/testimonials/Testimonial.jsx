import React from 'react'
import './testimonial.css'
import AVTR1 from '../../assets/avatar1.jpg'
import AVTR2 from '../../assets/avatar2.jpg'
import AVTR3 from '../../assets/avatar3.jpg'
import AVTR4 from '../../assets/avatar4.jpg'

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
// import { Pagination } from "swiper";

const data = [
  {
    id: 1,
    avatar: AVTR1,
    name: 'Mr. ABCD',
    designation: 'CEO, XYZ',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit1. Quisquam',
  },
  {
    id: 2,
    avatar: AVTR2,
    name: 'Mr. XYZ',
    designation: 'CEO, ABC',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit2. Quisquam',
  },
  {
    id: 3,
    avatar: AVTR3,
    name: 'Mr. PQR',
    designation: 'CEO, PQR',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit3. Quisquam',
  },
  {
    id: 4,
    avatar: AVTR4,
    name: 'Mr. ABC',
    designation: 'CEO, PQR',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit4. Quisquam',
  }
]

const Testimonial = () => {
  return (
    <section id='testimonial'>
      <h5>Recommendation from friends</h5>
      <h2>Testimonials</h2>
      
        <Swiper className='container testimonials__container'
        // pagination={{dynamicBullets: true,}} loop={true} modules={[Pagination]}
        >
            {
              data.map(({avatar,name,designation,review},id) => {
                return(
                  <SwiperSlide>
                    <div key={id} className='testimonial'>
                      <div className="recommenders__avatar">
                        <img src={avatar} alt="Recommenders avatar" />
                      </div>
                      <h5 className='recommenders__name'>{name}</h5>
                      <p className='recommenders__designation'>{designation}</p>
                      <small className='recommenders__review'>{review}</small>
                    </div>
                  </SwiperSlide>
                )
              })
            }
          
       </Swiper>
    </section>
  )
}

export default Testimonial