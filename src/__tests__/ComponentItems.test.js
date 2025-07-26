// ComponentItems.test.js - Tests for individual component items
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import EducationItem from '../pages/education/educationitem'
import ExperienceItem from '../pages/experience/experienceitem'
import ServiceItem from '../pages/services/serviceitem'
import PortFolioItem from '../pages/portfolio/portfolioitem'

describe('Component Items', () => {
  const mockEducationData = {
    id: 1,
    title: 'Bachelor of Science',
    text: 'University of Test',
    date: '2020-2024',
    cgpa: 'CGPA: 8.5/10'
  }

  const mockExperienceData = {
    id: 1,
    title: 'Software Developer',
    position: 'Full Stack Developer',
    company: 'Test Company',
    location: 'Test City',
    date: '2022-Present',
    description: {
      'desc1': 'Developed web applications',
      'desc2': 'Worked with React'
    },
    skills: ['React', 'JavaScript', 'Node.js']
  }

  const mockServiceData = {
    id: 1,
    title: 'Web Development',
    list: ['Responsive design', 'Modern frameworks', 'API integration']
  }

  const mockPortfolioData = {
    id: 1,
    image: 'test-image.jpg',
    title: 'Test Project',
    description: 'A test project description',
    github: 'https://github.com/test',
    demo: 'https://demo.test.com',
    tools_tech: ['React', 'CSS'],
    features: ['Feature 1', 'Feature 2']
  }

  test('EducationItem renders education data correctly', () => {
    render(<EducationItem item={mockEducationData} />)
    
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument()
    expect(screen.getByText('University of Test')).toBeInTheDocument()
  })

  test('ExperienceItem renders experience data correctly', () => {
    render(<ExperienceItem item={mockExperienceData} />)
    
    expect(screen.getByText(/Software Developer/)).toBeInTheDocument()
    expect(screen.getByText('Test Company')).toBeInTheDocument()
  })

  test('ServiceItem renders service data correctly', () => {
    render(<ServiceItem item={mockServiceData} />)
    
    expect(screen.getByText('Web Development')).toBeInTheDocument()
  })

  test('PortFolioItem renders portfolio data correctly', () => {
    render(<PortFolioItem data={mockPortfolioData} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Project')
  })

  test('Components handle missing optional props gracefully', () => {
    // Test with minimal props
    expect(() => render(<EducationItem item={{ id: 1, title: "Test", date: "2021", text: "Test", cgpa: "8.0/10" }} />)).not.toThrow()
    expect(() => render(<ExperienceItem item={{ 
      id: 1, 
      title: "Test", 
      position: "Developer",
      date: "2021", 
      company: "Test", 
      location: "Remote",
      description: { 'desc1': 'Test description' },
      skills: ['Test Skill']
    }} />)).not.toThrow()
    expect(() => render(<ServiceItem item={{ id: 1, title: "Test", list: ['Test item'] }} />)).not.toThrow()
    expect(() => render(<PortFolioItem data={{ id: 1, title: "Test", image: "test.jpg", description: "Test desc", tools_tech: ['Test'], features: ['Test feature'], github: "https://github.com/test" }} />)).not.toThrow()
  })
})
