# Content Loading Contract

**Purpose**: Defines the interface for loading and displaying dynamic content in portfolio sections
**Implementation**: JavaScript module for content management

## Contract Definition

### ContentLoader Interface
```typescript
interface ContentLoader {
  loadProfile(): Promise<Profile>
  loadSkills(): Promise<SkillCategory[]>  
  loadProjects(): Promise<Project[]>
  loadContactInfo(): Promise<ContactInfo>
}
```

### Content Rendering Contract
```typescript
interface ContentRenderer {
  renderHeroSection(profile: Profile): HTMLElement
  renderAboutSection(profile: Profile): HTMLElement
  renderSkillsSection(skills: SkillCategory[]): HTMLElement
  renderProjectsSection(projects: Project[]): HTMLElement
  renderContactSection(contact: ContactInfo): HTMLElement
}
```

## Input Contracts

### Profile Data Contract
```json
{
  "name": "string (required, 2-50 characters)",
  "title": "string (required, 5-100 characters)", 
  "specialization": "string (required, 10-200 characters)",
  "tagline": "string (required, 10-120 characters)",
  "professionalPhoto": {
    "src": "string (required, valid image path)",
    "alt": "string (required, descriptive text)"
  },
  "yearsOfExperience": "number (required, 0-50)",
  "location": "string (optional, 2-50 characters)"
}
```

### Skills Data Contract
```json
{
  "categories": [
    {
      "categoryName": "string (required, 3-30 characters)",
      "description": "string (optional, max 200 characters)",
      "displayOrder": "number (required, positive integer)",
      "iconClass": "string (required, valid CSS class)",
      "skills": [
        {
          "name": "string (required, 2-30 characters)",
          "proficiencyLevel": "enum (Expert|Advanced|Intermediate)",
          "yearsExperience": "number (optional, 0-20)",
          "iconUrl": "string (optional, valid image path)"
        }
      ]
    }
  ]
}
```

### Projects Data Contract  
```json
{
  "projects": [
    {
      "title": "string (required, 5-80 characters)",
      "shortDescription": "string (required, 10-150 characters)",
      "detailedDescription": "string (required, 50-500 characters)",
      "problemStatement": "string (required, 20-300 characters)",
      "solution": "string (required, 50-400 characters)",
      "keyChallengess": "array of strings (required, 1-5 items)",
      "technologies": "array of strings (required, 2-15 items)",
      "githubUrl": "string (optional, valid URL)",
      "liveUrl": "string (optional, valid URL)",
      "screenshots": "array of ImageAsset (optional, max 5)",
      "featured": "boolean (required)",
      "displayOrder": "number (required, positive integer)"
    }
  ]
}
```

## Output Contracts

### Hero Section HTML Contract
**Expected Structure**:
```html
<section class="hero-section" id="hero">
  <div class="hero-content">
    <img class="hero-photo" src="..." alt="..." />
    <h1 class="hero-name">...</h1>
    <h2 class="hero-title">...</h2>
    <p class="hero-tagline">...</p>
    <div class="hero-specialization">...</div>
  </div>
</section>
```

### Skills Section HTML Contract
**Expected Structure**:
```html
<section class="skills-section" id="skills">
  <h2>Technical Skills</h2>
  <div class="skills-categories">
    <div class="skill-category" data-category="...">
      <h3 class="category-title">
        <i class="category-icon ..."></i>
        <span>...</span>
      </h3>
      <div class="skills-grid">
        <div class="skill-item" data-skill="...">
          <img class="skill-icon" src="..." alt="..." />
          <span class="skill-name">...</span>
          <span class="skill-level">...</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Projects Section HTML Contract  
**Expected Structure**:
```html
<section class="projects-section" id="projects">
  <h2>Featured Projects</h2>
  <div class="projects-grid">
    <article class="project-card" data-project="...">
      <div class="project-header">
        <h3 class="project-title">...</h3>
        <p class="project-summary">...</p>
      </div>
      <div class="project-details" aria-expanded="false">
        <div class="project-problem">...</div>
        <div class="project-solution">...</div>
        <div class="project-technologies">...</div>
        <div class="project-links">...</div>
      </div>
      <button class="project-toggle" aria-controls="...">
        View Details
      </button>
    </article>
  </div>
</section>
```

## Behavior Contracts

### Content Loading Behavior
1. **Initial Load**: All critical above-the-fold content loads synchronously
2. **Progressive Loading**: Below-the-fold content loads asynchronously after initial render
3. **Error Handling**: Graceful fallback to static HTML content if JSON loading fails
4. **Loading States**: Show skeleton/loading indicators during content fetch

### Interaction Behavior Contract
1. **Project Expansion**: Click on project card toggles detailed view
2. **Smooth Scrolling**: Navigation links animate to target sections  
3. **Responsive Behavior**: Content reorganizes appropriately at different breakpoints
4. **Accessibility**: All interactive elements keyboard accessible with proper ARIA states

### Performance Behavior
1. **Image Lazy Loading**: Images below the fold load only when approaching viewport
2. **Animation Performance**: Animations use CSS transforms for 60fps performance
3. **Content Caching**: Loaded JSON content cached in sessionStorage to avoid re-fetching

## Error Handling Contract

### Content Loading Errors
```javascript
// Missing or malformed JSON
const fallbackToStaticContent = () => {
  // Display existing static HTML content
  // Log error for debugging
  // Show user-friendly message if needed
}

// Image Loading Errors  
const handleImageError = (img) => {
  img.src = '/assets/images/placeholder.png'
  img.alt = 'Image unavailable'
}
```

### Validation Errors
```javascript
// Invalid content data
const validateContent = (data, schema) => {
  // Return validation errors
  // Provide specific error messages
  // Suggest corrections where possible
}
```

## Testing Contract Requirements

### Content Loading Tests
- Verify JSON files load correctly
- Test error handling for missing/malformed data
- Validate content structure matches contracts

### Rendering Tests  
- Confirm HTML output matches expected structure
- Test responsive behavior at different breakpoints
- Verify accessibility attributes are correctly applied

### Interaction Tests
- Test project card expansion/collapse
- Verify smooth scrolling navigation
- Check keyboard navigation functionality

### Performance Tests
- Measure content loading times
- Verify lazy loading triggers correctly
- Test animation performance (60fps target)