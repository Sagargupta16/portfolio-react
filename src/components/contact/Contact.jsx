import React, { useRef } from "react";
import "./contact.css";
import { MdOutlineEmail } from "react-icons/md";
import { ImWhatsapp } from "react-icons/im";
import { IoCallOutline } from "react-icons/io5";
import emailjs from "emailjs-com";

const Contact = () => {
  const form = useRef();

  const sendEmail = async (e) => {
    e.preventDefault();

    try {
      const result = await emailjs.sendForm(
        "service_lyt547p",
        "template_yz438w6",
        form.current,
        "PAcL61ygLI8WYG16R",
      );
      console.log(result.text);
    } catch (error) {
      console.log(error.text);
    }

    e.target.reset();
  };

  const contactOptions = [
    {
      id: 1,
      icon: <MdOutlineEmail className="contact__icon" />,
      title: "Email Me",
      value: "sg85207@gmail.com",
      link: "mailto:sg85207@gmail.com",
      message: "Send a Mail",
    },
    {
      id: 2,
      icon: <ImWhatsapp className="contact__icon" />,
      title: "WhatsApp Me",
      value: "+91-8770532413",
      link: "https://wa.me/+918770532413",
      message: "Send a Message",
    },
    {
      id: 3,
      icon: <IoCallOutline className="contact__icon" />,
      title: "Call me",
      value: "+91-8770532413",
      link: "tel:+918770532413",
      message: "Call Now",
    },
  ];

  return (
    <section id="contact">
      <h5>Get In Touch</h5>
      <h2>Contact Me</h2>
      <div className="container contact__container">
        <div className="contact__options">
          {contactOptions.map((option) => (
            <article className="contact__option" key={option.id}>
              <h4>
                {option.icon}
                {option.title}
              </h4>
              <h5>{option.value}</h5>
              <a href={option.link} target="_blank" rel="noreferrer">
                {option.message}
              </a>
            </article>
          ))}
        </div>
        <form ref={form} onSubmit={sendEmail} className="contact__form">
          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
          />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea
            name="message"
            rows="7"
            placeholder="Your Message"
            required
          />
          <button type="submit" className="">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
