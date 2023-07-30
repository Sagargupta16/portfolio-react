import React from "react";
import CV from "../../assets/Resume.pdf";

function CTA() {
  return (
    <div className="cta">
      <a href={CV} download className="btn">
        Download CV
      </a>
      <a href="/Portfolio-React/contact" className="btn btn-primary">
        Let's Talk
      </a>
    </div>
  );
}

export default CTA;
