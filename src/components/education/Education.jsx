import React from 'react'
import './education.css'
import {BsFillCalendarEventFill} from 'react-icons/bs'
import {GoPrimitiveDot} from 'react-icons/go'

const Education = () => {
  return (
    <section id='education'>
        <h5>What Qualifications I have</h5>
        <h2>My Education</h2>
        <div className="container education__container">
            <GoPrimitiveDot/>
            <div className="education__item">
                <h3 className="education__date">
                    <BsFillCalendarEventFill/> 2021 - 2024
                </h3>
                <h4 className="education__title">Master's in Computer Applications (MCA)</h4>
                <p className="education__text">National Institute of Technology , Warangal </p>
            </div>
            <GoPrimitiveDot/>
            <div className="education__item">
                <h3 className="education__date">
                    <BsFillCalendarEventFill/> 2018 - 2021
                </h3>
                <h4 className="education__title">Bachelor's in Computer Applications (BCA)</h4>
                <p className="education__text">Sanskar College Of Professional Studies (DAVV University),Indore</p>
            </div>
            <GoPrimitiveDot/>
            <div className="education__item">
                <h3 className="education__date">
                    <BsFillCalendarEventFill/> 2016 - 2018
                </h3>
                <h4 className="education__title">Higher Secondary School (PCM+PE)</h4>
                <p className="education__text">Happy Days School , Shivpuri </p>
            </div>
            <GoPrimitiveDot/>
            <div className="education__item">
                <h3 className="education__date">
                    <BsFillCalendarEventFill/> 2014 - 2016
                </h3>
                <h4 className="education__title">High School</h4>
                <p className="education__text">Kids Garden School , Shivpuri </p>
            </div>
        </div>
    </section>
  )
}

export default Education
