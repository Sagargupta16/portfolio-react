# Personal Portfolio

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml)
[![Security Analysis](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml)

#### Project deployed link -> [Portfolio-react](https://sagargupta.live/portfolio-react)

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml)
[![Security Analysis](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml)
![Test Coverage](https://img.shields.io/badge/coverage-72%25-brightgreen)
![Node Version](https://img.shields.io/badge/node-18.20.4-green)
![React Version](https://img.shields.io/badge/react-18.3.1-blue)

---

## :pencil: About The Project

Personal Portfolio - A dynamic and interactive React application showcasing my professional journey as a DevOps & Cloud Engineer at Amazon Web Services. This platform serves as a comprehensive hub featuring my AWS expertise, infrastructure automation projects, and technical achievements. Built with a modern JSON-based data architecture for easy maintenance and updates.

---

## :cloud: Overview

This React application presents my professional experience at AWS Professional Services, specializing in DevOps Infrastructure Automation and Cloud solutions. The portfolio demonstrates my expertise with Terraform, AWS services, and modern development practices. With a centralized JSON data management system, the portfolio is designed for easy content updates while maintaining a visually appealing and user-friendly interface.

---

## 💻 Tech Stack

The portfolio is built using the following technologies:

- **React 18.3.1:** The core framework for building an efficient and interactive user interface.
- **JavaScript ES6+:** For implementing dynamic and functional features throughout the application.
- **HTML5/CSS3:** Modern web standards for structuring and styling components with responsive design.
- **JSON Data Architecture:** Centralized data management system for easy content updates and maintenance.
- **React Router:** For seamless navigation between different sections and pages.
- **React Icons:** Comprehensive icon library for enhanced visual elements.
- **EmailJS:** Direct email integration for the contact form functionality.
- **PropTypes:** Type checking for React components to ensure reliability.
- **GitHub Pages:** Deployment platform with automated CI/CD through GitHub Actions.

### **AWS & DevOps Technologies Featured:**
- **AWS Services:** EventBridge, CloudWatch, SNS, EBS, AWS Detective, ECS, CodePipeline, X-Ray
- **Infrastructure as Code:** Terraform, tftest for unit testing
- **DevOps Tools:** Docker, CI/CD pipelines, Blue-Green deployments
- **Monitoring & Observability:** AWS X-Ray, CloudWatch, distributed tracing

---

## Key Features

- **JSON-Based Data Architecture:**
  All portfolio content is centralized in JSON files within the `src/data/` folder, making it incredibly easy to update personal information, projects, skills, and experience without touching component code.

- **Modular Data Loading System:**
  Custom `dataLoader.js` utility provides structured access to all portfolio data through dedicated getter functions, ensuring consistent data access across components.

- **Professional AWS Experience Showcase:**
  Detailed presentation of current role at AWS Professional Services, featuring infrastructure automation projects, Terraform expertise, and cloud solutions.

- **Dynamic Project Display:**
  Smart project rendering system that maps JSON data to visual components, automatically handling project images and metadata.

- **Single Page Application for Mobile View:**
  The portfolio is designed as a single-page application (SPA) for an optimal mobile viewing experience. Users can seamlessly scroll through the content, eliminating the need for page reloads and ensuring a smooth and engaging mobile interaction.

- **Multi-Page Application for Desktop & Tablet View:**
  To enhance usability on larger screens, the portfolio transforms into a multi-page application using routes for desktop and tablet views. This design choice ensures a more organized and structured presentation, allowing users to navigate between different sections effortlessly.

- **Cool Hover Effects, Shadowing & Overall Structure:**
  The portfolio boasts eye-catching hover effects that add a touch of interactivity and liveliness to the user experience. Additionally, strategic use of shadowing and well-defined overall structure contributes to a visually appealing and aesthetically pleasing interface.

- **Smooth Navigation with 0 Refresh Rate:**
  Navigation within the portfolio is incredibly smooth, facilitated by a seameless user interface that eliminates the need for page refreshes. This ensures a delightful user experience, as visitors can effortlessly explore various sections without any interruptions.

- **Detailed Content:**
  Every section of the portfolio is meticulously crafted to provide detailed and comprehensive information. Whether it's showcasing projects, skills, or professional experiences, users can expect to find in-depth insights that highlight the depth of expertise.

- **Email Js to Receive Direct Mails in Contact Section:**
  The contact section of the portfolio is equipped with Email JS integration, allowing visitors to reach out directly by sending emails through the platform. This feature ensures a convenient and secure means of communication.

- **Used Flex & Grid Displays According to Requirement:**
  Employing a responsive design approach, the portfolio utilizes both Flexbox and Grid displays to adapt the layout according to specific requirements. This flexibility enables the content to adapt seamlessly to various screen sizes and devices.

- **Fully Responsive Site:**
  The portfolio is meticulously designed to be fully responsive across all devices, including mobiles, tablets, and desktops. This responsiveness ensures that users can access and enjoy a consistent and optimized experience, irrespective of the device they use.

With this impressive array of key features, my portfolio demonstrates my commitment to providing a cutting-edge user experience while showcasing my skills and accomplishments in a visually captivating manner.

---

## 🔮 Future Enhancements

- **Enhanced Data Management:** Add more sophisticated data validation and error handling for JSON files.
- **Component Testing:** Expand test coverage for all portfolio components with comprehensive unit tests.
- **Performance Optimization:** Implement lazy loading and code splitting for better performance.
- **Animation Library Integration:** Add smooth transitions and animations using libraries like Framer Motion.
- **Dark/Light Theme Toggle:** Implement dynamic theme switching with CSS variables.
- **Blog Integration:** Add a technical blog section to share insights about AWS and DevOps.
- **Interactive Project Demos:** Embed live demos and interactive elements for showcased projects.
- **SEO Optimization:** Enhance meta tags and structured data for better search engine visibility.
- **Progressive Web App:** Convert to PWA for offline functionality and mobile app-like experience.
- **Real-time Analytics:** Integrate analytics to track portfolio engagement and performance.

---

## :floppy_disk: Project Files Structure

```bash
- .github
  |-- workflows
    |-- main.yml
- public
  |-- favicon.ico
  |-- index.html
  |-- favicon_io/
- src
  |-- assets
  |   |-- images
  |   |   |-- me.png
  |   |   |-- me-about.jpg
  |   |   |-- bg-texture.png
  |   |   |-- projects_images/
  |   |   |   |-- project-1.png to project-13.jpg
  |   |-- cursors
  |       |-- cursor-1.svg
  |-- components
  |   |-- ErrorBoundary/
  |   |-- Loading/
  |   |-- footer
  |   |   |-- Footer.jsx
  |   |   |-- footer.css
  |   |   |-- socialLinks.js
  |   |-- header
  |   |   |-- Header.jsx
  |   |   |-- HeaderSocials.jsx
  |   |   |-- CTA.jsx
  |   |   |-- TW.jsx
  |   |   |-- header.css
  |   |   |-- profiles.js
  |   |-- nav
  |   |   |-- Nav.jsx
  |   |   |-- nav.css
  |   |-- theme
  |       |-- Theme.jsx
  |       |-- theme.css
  |       |-- themes.js
  |-- data (JSON Data Architecture)
  |   |-- personal.json
  |   |-- education.json
  |   |-- experience.json
  |   |-- skills.json
  |   |-- services.json
  |   |-- projects.json
  |   |-- achievements.json
  |   |-- contact.json
  |   |-- dataLoader.js
  |-- pages
  |   |-- about
  |   |   |-- About.jsx
  |   |   |-- about.css
  |   |-- contact
  |   |   |-- Contact.jsx
  |   |   |-- contact.css
  |   |-- education
  |   |   |-- Education.jsx
  |   |   |-- education.css
  |   |   |-- educationArray.js
  |   |   |-- educationitem.jsx
  |   |-- experience
  |   |   |-- Experience.jsx
  |   |   |-- experience.css
  |   |   |-- experienceArray.js
  |   |   |-- experienceitem.jsx
  |   |-- portfolio
  |   |   |-- Portfolio.jsx
  |   |   |-- portfolio.css
  |   |   |-- portfolioitem.jsx
  |   |   |-- projectsArray.js
  |   |-- services
  |   |   |-- Services.jsx
  |   |   |-- serviceitem.jsx
  |   |   |-- services.css
  |   |   |-- servicesArray.js
  |   |-- skill
  |   |   |-- Skill.jsx
  |   |   |-- skill.css
  |   |   |-- skillsArray.js
  |   |-- testimonials
  |       |-- Testimonial.jsx
  |       |-- testimonial.css
  |-- __tests__
      |-- Components.test.js
  |-- App.jsx
  |-- index.css
  |-- index.js
- .gitignore
- README.md
- package-lock.json
- package.json
```

## � JSON Data Architecture

This portfolio uses a modern JSON-based data management system for easy content updates:

### **Data Files Location:** `src/data/`

- **`personal.json`** - Personal information, bio, statistics, social profiles
- **`education.json`** - Educational background and academic achievements  
- **`experience.json`** - Professional experience and positions of responsibility
- **`skills.json`** - Technical skills categorized by type (languages, frameworks, cloud, etc.)
- **`services.json`** - Services offered and capabilities
- **`projects.json`** - Personal and collaborative projects with details
- **`achievements.json`** - Certifications, achievements, and coding platform stats
- **`contact.json`** - Contact information and communication preferences

### **Data Loader System:** `src/data/dataLoader.js`

Provides structured access functions for all data:
```javascript
// Examples of available functions
getPersonalInfo()     // Get all personal data
getName()             // Get name specifically  
getExperience()       // Get professional experience
getSkills()           // Get all skills data
getProjects()         // Get all projects
// ... and many more specific getters
```

### **How to Update Your Portfolio:**

1. **Add New Experience:** Edit `experience.json` → Add new job entry
2. **Update Skills:** Edit `skills.json` → Add new technologies to relevant categories
3. **Add New Project:** Edit `projects.json` → Add project details and image reference
4. **Update Bio:** Edit `personal.json` → Modify about section or statistics
5. **Add Certification:** Edit `achievements.json` → Add new certifications

**No code changes needed!** The components automatically reflect JSON data updates.

## �📼 How to Run Locally

To run this portfolio locally on your machine, follow these simple steps:

To run this portfolio locally on your machine, follow these simple steps:

1. **Clone the Repo:**
   Clone this repository to your local machine using the following command:

   ```bash
   git clone https://github.com/Sagargupta16/portfolio-react

   ```

2. **Install Node & NPM:**
   Ensure you have Node.js and npm (Node Package Manager) installed on your system. If you don't have them already, download and install them from the official Node.js website.

3. **Install Dependencies:**
   Navigate to the project's root directory in your terminal or command prompt, and run the following command to install all the necessary dependencies:

   ```bash
   npm install

   ```

4. **Start the Development Server:**
   After installing the dependencies, start the development server with the following command:

   ```bash
   npm start

   ```

5. **View the Portfolio:**
   Once the development server has started successfully, open your web browser and navigate to `http://localhost:3000/portfolio-react`. You should now be able to see and interact with the portfolio locally on your machine.

## 🧪 Testing

The portfolio includes a comprehensive test suite to ensure all components work correctly:

```bash
# Run all tests
npm test

# Run tests with coverage report  
npm test -- --coverage --watchAll=false

# Run tests in watch mode (for development)
npm test -- --watch
```

**Test Coverage:**
- All major components (Header, About, Education, Experience, Skills, Services, Portfolio, Contact, Footer)
- JSON data loader functionality
- Component rendering and basic functionality
- Currently achieving 67%+ test coverage

**Test Files:**
- `src/__tests__/Components.test.js` - Main component testing suite

With these steps, you can easily run the portfolio locally, explore its features, and make any desired modifications to suit your needs. The JSON data architecture makes updates simple and maintainable!

---

## Project Images
