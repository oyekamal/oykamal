# Data Model: Core Sections for Backend Portfolio Website

**Feature**: Core Sections for Backend Portfolio Website  
**Date**: 2025-09-26

## Overview
This document defines the content structure and data organization for the enhanced portfolio website sections. Since this is a static website, these represent content entities rather than database schemas.

## Content Entities

### Profile Entity
**Purpose**: Represents the core professional identity and branding
**Structure**:
```
Profile {
  name: string                    // "Muhammad Kamal" 
  title: string                  // "Python Backend Developer"
  specialization: string         // "Django | REST APIs | System Design | API Specialist"
  tagline: string               // One-line value proposition
  professionalPhoto: ImageAsset  // High-quality professional headshot
  yearsOfExperience: number     // Years in backend development
  location: string              // Current location
  availability: string          // "Available for opportunities"
}
```
**Usage**: Hero section, about section, meta tags

### SkillCategory Entity
**Purpose**: Organizes technical skills into logical groupings for better presentation
**Structure**:
```
SkillCategory {
  categoryName: string          // "Backend", "Databases", "DevOps/Cloud", "System Design"
  description: string           // Brief category explanation
  skills: Skill[]              // Array of individual skills
  displayOrder: number         // Sort order for presentation
  iconClass: string           // CSS class for category icon
}

Skill {
  name: string                 // "Django", "PostgreSQL", "Docker"
  proficiencyLevel: string     // "Expert", "Advanced", "Intermediate"  
  yearsExperience: number      // Years working with this technology
  iconUrl: string             // Path to skill icon
  description: string         // Brief description of experience
}
```
**Usage**: Skills section with categorized display

### Project Entity
**Purpose**: Showcases backend engineering projects with technical depth
**Structure**:
```
Project {
  title: string                    // "E-commerce API Platform"
  shortDescription: string         // One-line project summary
  detailedDescription: string      // Comprehensive project explanation
  problemStatement: string         // Business/technical challenge addressed
  solution: string                // How the problem was solved
  keyChallengess: string[]        // Technical challenges overcome
  technologies: string[]          // Tech stack used
  githubUrl: string              // Link to source code (if public)
  liveUrl: string                // Link to deployed application (if available)
  caseStudyUrl: string           // Link to detailed case study (if available)
  screenshots: ImageAsset[]       // Project screenshots/diagrams
  metrics: ProjectMetrics        // Performance/business metrics
  dateCompleted: date            // Project completion date
  featured: boolean              // Whether to highlight this project
  displayOrder: number           // Sort order for presentation
}

ProjectMetrics {
  performanceImprovements: string  // "50% faster response times"
  scalabilityAchievements: string  // "Handles 10k concurrent users"
  businessImpact: string          // "Reduced processing time by 30%"
  technicalMetrics: string        // "99.9% uptime, <100ms avg response"
}
```
**Usage**: Projects section with expandable details

### ContactInfo Entity  
**Purpose**: Professional contact and social media information
**Structure**:
```
ContactInfo {
  email: string                   // Professional email address
  linkedInUrl: string            // LinkedIn profile
  githubUrl: string              // GitHub profile
  portfolioUrl: string           // This portfolio website
  resumeUrl: string              // Link to downloadable resume
  calendlyUrl: string            // Meeting scheduling (if applicable)
  preferredContactMethod: string  // "Email", "LinkedIn"
}
```
**Usage**: Contact section, footer, social media links

### ImageAsset Entity
**Purpose**: Manages image resources with optimization requirements
**Structure**:
```
ImageAsset {
  src: string              // Primary image source
  srcWebP: string          // WebP optimized version
  srcSet: string           // Responsive image set
  alt: string              // Accessibility description
  width: number            // Image width
  height: number           // Image height
  lazyLoad: boolean        // Whether to implement lazy loading
  caption: string          // Image caption (optional)
}
```
**Usage**: All image displays across the portfolio

## Content Relationships

### Profile → SkillCategory (1:many)
Profile showcases multiple skill categories, each containing related technical competencies.

### Profile → Project (1:many)  
Profile displays a curated selection of 3-5 featured projects that demonstrate backend expertise.

### Project → ImageAsset (1:many)
Each project can have multiple screenshots, diagrams, or visual assets.

### Profile → ContactInfo (1:1)
Profile has one set of contact information for professional inquiries.

## Content Management Strategy

### Static Content Files
**Location**: `assets/data/` directory (to be created)
**Format**: JSON files for easy maintenance
**Structure**:
```
assets/data/
├── profile.json         // Profile entity data
├── skills.json          // SkillCategory and Skill data
├── projects.json        // Project entities data
└── contact.json         // ContactInfo data
```

### Content Loading Strategy
**Approach**: JavaScript-based content injection for maintainability
**Benefits**:
- Easy content updates without HTML editing
- Consistent data structure
- Reusable across different sections
- SEO-friendly with server-side rendering fallbacks

### Content Validation Rules
**Profile**:
- Name and title are required
- Professional photo must be high-resolution (minimum 300x300px)
- Tagline should be under 120 characters for social media

**Skills**:
- Each category must have at least 3 skills
- Proficiency levels must be consistent across categories
- Skills should be relevant to backend development focus

**Projects**:
- Featured projects (3-5 maximum) must have complete information
- At least one project must demonstrate API development
- Technical challenges should be specific and measurable
- Screenshots should be high-quality and professional

**Images**:
- All images must have alt text for accessibility
- Images over 100KB should have WebP alternatives
- Responsive srcSet required for images over 500px width

## SEO and Meta Data Structure
**PageMetadata Entity**:
```
PageMetadata {
  title: string              // "Muhammad Kamal - Python Backend Developer"
  description: string        // Meta description under 160 characters
  keywords: string[]         // Relevant technical keywords
  ogImage: ImageAsset       // Open Graph image for social sharing
  schemaMarkup: object      // Schema.org structured data
  canonicalUrl: string      // Canonical URL for SEO
}
```

## Accessibility Data Requirements
**AccessibilityLabels Entity**:
```
AccessibilityLabels {
  skipToMainContent: string     // "Skip to main content"
  navigationAria: string        // "Main navigation"
  sectionHeadings: string[]     // Proper heading hierarchy
  buttonLabels: string[]        // Clear button descriptions
  linkDescriptions: string[]    // Descriptive link text
}
```

## Performance Considerations
**Content Loading Strategy**:
- Critical above-the-fold content embedded in HTML
- Non-critical content loaded asynchronously
- Images optimized and lazy-loaded below the fold
- JSON data minified for production

**Caching Strategy**:
- Static content cached with long expiration
- Image assets cached with content-based versioning
- JSON data with shorter cache duration for updates