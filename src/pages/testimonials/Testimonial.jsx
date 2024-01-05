import React from 'react'
import './testimonial.css'
import AVTR1 from '../../assets/me.png'

// import { Swiper, SwiperSlide } from 'swiper/react'

// import 'swiper/css'
// import 'swiper/css/pagination'

const data = [
  {
    id: 1,
    avatar: AVTR1,
    name: 'Mr. ABCD',
    designation: 'CEO, XYZ',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit1. Quisquam'
  },
  {
    id: 2,
    avatar: AVTR1,
    name: 'Mr. XYZ',
    designation: 'CEO, ABC',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit2. Quisquam'
  },
  {
    id: 3,
    avatar: AVTR1,
    name: 'Mr. PQR',
    designation: 'CEO, PQR',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit3. Quisquam'
  },
  {
    id: 4,
    avatar: AVTR1,
    name: 'Mr. XYZS',
    designation: 'CEO, PQR',
    review: 'Lorem ipsum dolor sit amet consectetur adipisicing elit4. Quisquam'
  }
]

const Testimonial = () => {
  return (
    <section id="testimonial">
      <h5>Recommendation from friends</h5>
      <h2>Testimonials</h2>

      {/* <Swiper
        className="container testimonials__container"
        pagination={{
          clickable: true
        }}
      > */}
      {data.map(({ id, avatar, name, designation, review }) => {
        return (
          // <SwiperSlide key={id}>
          <div className="testimonial">
            <div className="recommenders__avatar">
              <img src={avatar} alt="Recommenders avatar" />
            </div>
            <h5 className="recommenders__name">{name}</h5>
            <p className="recommenders__designation">{designation}</p>
            <small className="recommenders__review">{review}</small>
          </div>
          // </SwiperSlide>
        )
      })}
      {/* </Swiper> */}
    </section>
  )
}

export default Testimonial
