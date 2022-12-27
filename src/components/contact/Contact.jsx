import React, { useRef } from 'react'
import './contact.css'
import {MdOutlineEmail} from 'react-icons/md'
import {ImWhatsapp} from 'react-icons/im'
import {IoCallOutline} from 'react-icons/io5'
import emailjs from 'emailjs-com';

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_lyt547p', 'template_yz438w6', form.current, 'PAcL61ygLI8WYG16R')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
    e.target.reset();
  };
  return (
    <section id='contact'>
      <h5>Get In Touch</h5>
      <h2>Contact Me</h2>
      <div className="container contact__container">
        <div className="contact__options">
          <article className="contact__option">
            <MdOutlineEmail className="contact__icon" />
            <h4>Email</h4>
            <h5>sg85207@gmail.com</h5>
            <a href="mailto:sg85207@gmail.com" target="_blank" rel="noreferrer">Send a Message</a>
          </article>
          <article className="contact__option">
            <ImWhatsapp className="contact__icon" />
            <h4>WhatsApp</h4>
            <h5>+91-8770532413</h5>
            <a href="https://wa.me/+918770532413" target="_blank" rel="noreferrer">Send a Message</a>
          </article>
          <article className="contact__option">
            <IoCallOutline className="contact__icon" />
            <h4>Call me</h4>
            <h5>+91-8770532413</h5>
            <a href="tel:+918770532413" target="_blank" rel="noreferrer">Call</a>
          </article>
        </div>
        <form ref={form} onSubmit={sendEmail} className="contact__form">
          <input type="text" name='name' placeholder='Your Full Name' required />
          <input type="email" name='email' placeholder='Your Email' required />
          <textarea name="message" rows="7" placeholder='Your Message' required></textarea>
          <button type='submit' className='btn btn-primary'>Send Message</button>
        </form>
      </div>
    </section>
  )
}

export default Contact
