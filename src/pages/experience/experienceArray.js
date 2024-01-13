const experienceArray = [
  {
    id: 1,
    date: 'May 2023 - July 2023',
    title: 'Software Developer Associate',
    position: 'Internship',
    company: 'Ikarus-3D',
    location: 'Mohali, Punjab',
    description: {
      1: 'Automated CI/CD workflow using GitHub Actions to handle web app linting, testing, building, and deployment.',
      2: 'Containerized the application using Docker and deployed it on AWS using ECR and ECS.',
      3: 'Implemented linting for Python (pylint, flake8, Black), JavaScript/TypeScript (ESLint), and CSS (Stylelint).',
      4: 'Managed versioning in the CI/CD workflow.',
      5: 'Conducted unit testing with Pytest (Python) and Jest (JavaScript).',
      6: 'Deployed SonarQube on AWS EC2 from Amazon Marketplace, seamlessly integrated it into GitHub workflows, and utilized it for code analysis.',
      7: 'Integrated SonarQube with Amazon RDS for seamless data storage and retrieval.',
      8: 'Provisioned Forem, employing Ansible for infrastructure automation and deployment.',
      9: 'Analyzed all features and explored the full potential of the Forem platform, gaining a deep understanding of its capabilities and functionalities.'
    },
    skills: [
      'Python',
      'JavaScript',
      'GitHub Actions',
      'Amazon EC2',
      'Docker',
      'AWS',
      'Ansible',
      'SonarQube',
      'Forem',
      'CI/CD',
      'Testing',
      'Linting',
      'DevOps',
      'Infrastructure Automation',
      'Deployment'
    ]
  }
]

const positionOfResponsibilityArray = [
  {
    id: 1,
    date: 'August 2023 - Present',
    title: 'Additional Secretary',
    position: '',
    company: 'CSES, NIT Warangal',
    location: 'Warangal, Telangana',
    description: {
      1: 'Part of the core team of the club, responsible for the smooth functioning of the club.',
      2: 'Organized and conducted various events, workshops, and competitions for the club.',
      3: 'Git & GitHub Workshop',
      4: 'Frontend Workshop',
      5: 'Backend Workshop',
      6: 'Code 2 Start: Coding Contest'
    },
    skills: ['Communication', 'Leadership', 'Teamwork', 'Management', 'Git', 'GitHub', 'React', 'Nodejs']
  },
  {
    id: 2,
    date: 'August 2023 - Present',
    title: 'Class Representative',
    position: '',
    company: 'MCA, NIT Warangal',
    location: 'Warangal, Telangana',
    description: {
      1: 'Facilitate effective communication between students and faculty, representing the class in meetings.',
      2: 'Manage class attendance records and administrative tasks with precision and efficiency.',
      3: 'Oversee the class WhatsApp group for streamlined information dissemination.',
      4: 'Collaborate with class representatives to address student concerns and enhance the learning environment.'
    },
    skills: ['Communication', 'Leadership', 'Teamwork', 'Management']
  }
]

export { experienceArray, positionOfResponsibilityArray }
