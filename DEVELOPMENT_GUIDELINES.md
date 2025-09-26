# Development Guidelines

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Code editor (VS Code recommended)
- Git for version control
- Basic understanding of HTML5, CSS3, and JavaScript ES6+

### Development Environment Setup
1. Clone the repository
2. Open in your preferred code editor
3. Use a local development server (Live Server extension for VS Code)
4. Install browser extensions for development (dev tools, accessibility checkers)

## 📁 Project Structure

```
oykamal/
├── index.html              # Main HTML file
├── README.md              # Project documentation
├── GOVERNING_PRINCIPLES.md # Project principles
├── DEVELOPMENT_GUIDELINES.md # This file
├── CHANGELOG.md           # Version history
├── assets/
│   ├── css/
│   │   ├── style.css      # Custom styles
│   │   ├── bootstrap.min.css
│   │   ├── aos.css        # Animate on scroll
│   │   └── line-awesome.min.css
│   ├── js/
│   │   ├── main.js        # Custom JavaScript
│   │   ├── bootstrap.bundle.min.js
│   │   └── aos.js
│   ├── images/            # Optimized images
│   └── fonts/             # Web fonts
├── .gitignore            # Git ignore rules
├── .editorconfig         # Editor configuration
├── .prettierrc           # Code formatting rules
└── lighthouse-ci.json    # Performance monitoring
```

## 🎨 HTML Guidelines

### Structure & Semantics
```html
<!-- ✅ Good: Semantic HTML -->
<main>
  <section id="about">
    <h2>About Me</h2>
    <p>Professional summary...</p>
  </section>
</main>

<!-- ❌ Bad: Non-semantic HTML -->
<div class="main">
  <div class="about">
    <div class="title">About Me</div>
    <div class="text">Professional summary...</div>
  </div>
</div>
```

### Best Practices
- **Semantic Elements**: Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- **Heading Hierarchy**: Proper H1-H6 structure (only one H1 per page)
- **Alt Text**: Descriptive alt attributes for all images
- **Form Labels**: Proper labeling for form elements
- **ARIA**: Use ARIA attributes when semantic HTML isn't sufficient

### HTML Validation
- Validate HTML using W3C Markup Validator
- Ensure all tags are properly closed
- Use lowercase for element and attribute names
- Quote all attribute values

## 🎨 CSS Guidelines

### Organization & Structure
```css
/* File organization */
/* 1. CSS Variables */
:root {
  --color-primary: #EFD510;
  --color-secondary: #F2910A;
  --font-family: "Bai Jamjuree", sans-serif;
}

/* 2. Reset/Normalize */
/* 3. Base styles */
/* 4. Layout */
/* 5. Components */
/* 6. Utilities */
/* 7. Media queries */
```

### Naming Conventions
```css
/* ✅ Good: BEM methodology */
.card { }
.card__title { }
.card__content { }
.card--featured { }

/* ✅ Good: Semantic class names */
.navigation-menu { }
.hero-section { }
.project-grid { }

/* ❌ Bad: Non-descriptive names */
.red-text { }
.big-box { }
.thing { }
```

### Best Practices
- **Mobile First**: Write CSS for mobile, then add desktop styles
- **CSS Custom Properties**: Use CSS variables for consistency
- **Flexbox & Grid**: Modern layout techniques
- **Responsive Units**: Use rem, em, vh, vw appropriately
- **Performance**: Minimize reflows and repaints

### CSS Architecture
```css
/* Component-based approach */
.component {
  /* Layout properties */
  display: flex;
  flex-direction: column;
  
  /* Box model */
  padding: 1rem;
  margin: 0 auto;
  
  /* Visual properties */
  background: var(--color-base);
  border-radius: 0.5rem;
  
  /* Typography */
  font-family: var(--font-base);
  color: var(--color-text);
}
```

## 📜 JavaScript Guidelines

### Modern JavaScript (ES6+)
```javascript
// ✅ Good: Modern syntax
const initializeApp = () => {
  const elements = document.querySelectorAll('.animate');
  elements.forEach(element => {
    element.addEventListener('click', handleClick);
  });
};

// ✅ Good: Arrow functions and destructuring
const { offsetTop, offsetHeight } = element;
const scrollToSection = (targetId) => {
  document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
};

// ❌ Bad: Old syntax
function initializeApp() {
  var elements = document.querySelectorAll('.animate');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', handleClick);
  }
}
```

### Best Practices
- **Strict Mode**: Always use `'use strict';`
- **Constants**: Use `const` by default, `let` when reassignment needed
- **Error Handling**: Proper try-catch blocks for potential failures
- **Event Delegation**: Use event delegation for dynamic content
- **Performance**: Debounce scroll/resize events

### Code Organization
```javascript
// main.js structure
(function() {
  'use strict';
  
  // Constants
  const ANIMATION_DURATION = 700;
  const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };
  
  // Utility functions
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Main functionality
  const initializeAnimations = () => {
    AOS.init({
      offset: 120,
      duration: ANIMATION_DURATION,
      easing: 'ease',
      once: false,
      mirror: false
    });
  };
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
  });
})();
```

## 🎯 Performance Guidelines

### Image Optimization
```html
<!-- ✅ Good: Optimized images with responsive loading -->
<img 
  src="assets/images/project-thumb.webp" 
  alt="Project thumbnail showing web application interface"
  loading="lazy"
  width="400" 
  height="300"
/>

<!-- ✅ Good: Responsive images -->
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp">
  <source media="(min-width: 768px)" srcset="hero-tablet.webp">
  <img src="hero-mobile.webp" alt="Hero image">
</picture>
```

### Asset Loading
- **Critical CSS**: Inline critical above-the-fold CSS
- **Preload**: Preload important resources
- **Lazy Loading**: Implement lazy loading for images
- **Compression**: Use WebP for images, minify CSS/JS for production

### Performance Budget
- **Total Page Size**: < 2MB
- **JavaScript Bundle**: < 500KB
- **Images**: Optimized and properly sized
- **Fonts**: Maximum 2 font families, 4 weights total

## ♿ Accessibility Guidelines

### Keyboard Navigation
```javascript
// ✅ Good: Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (e.target.classList.contains('clickable')) {
      e.target.click();
    }
  }
});
```

### ARIA Implementation
```html
<!-- ✅ Good: Proper ARIA usage -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="menuitem">
      <a href="#about" aria-describedby="nav-about-desc">About</a>
    </li>
  </ul>
</nav>

<section aria-labelledby="projects-heading">
  <h2 id="projects-heading">My Projects</h2>
  <!-- content -->
</section>
```

### Best Practices
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Screen Readers**: Test with screen reader software
- **Alternative Text**: Descriptive alt text for images
- **Form Accessibility**: Proper labels and error messages

## 🔧 Development Workflow

### Version Control (Git)

#### Commit Message Format
```
type(scope): description

body (optional)

footer (optional)
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Examples
```bash
git commit -m "feat(navigation): add smooth scrolling to navigation links"
git commit -m "fix(images): resolve mobile image display issue"
git commit -m "docs(readme): update installation instructions"
```

### Branch Strategy
- `main`: Production-ready code
- `develop`: Development integration
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### Code Review Checklist
- [ ] HTML validates without errors
- [ ] CSS follows naming conventions
- [ ] JavaScript follows ES6+ standards
- [ ] Images are optimized
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility tested
- [ ] Performance impact assessed
- [ ] Documentation updated

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] **Functionality**: All links and interactions work
- [ ] **Responsiveness**: Test on mobile, tablet, desktop
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge
- [ ] **Accessibility**: Keyboard navigation, screen reader
- [ ] **Performance**: Page load times under 3 seconds
- [ ] **SEO**: Meta tags, heading structure, alt text

### Tools & Resources
- **Lighthouse**: Performance and accessibility auditing
- **WAVE**: Web accessibility evaluation
- **BrowserStack**: Cross-browser testing
- **PageSpeed Insights**: Performance monitoring
- **W3C Validators**: HTML/CSS validation

### Performance Testing
```javascript
// Example: Measure performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP candidate:', entry.startTime, entry);
  }
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
```

## 📱 Responsive Design Guidelines

### Breakpoints
```css
:root {
  --breakpoint-sm: 576px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 992px;   /* Large devices */
  --breakpoint-xl: 1200px;  /* Extra large devices */
}

/* Mobile first approach */
.component {
  padding: 1rem;
}

@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}

@media (min-width: 1200px) {
  .component {
    padding: 3rem;
  }
}
```

### Design Principles
- **Mobile First**: Design for small screens first
- **Touch Targets**: Minimum 44px touch targets
- **Readable Text**: Minimum 16px font size on mobile
- **Flexible Layouts**: Use relative units and flexbox/grid
- **Content Priority**: Most important content first

## 🔍 SEO Guidelines

### Meta Tags
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kamal - Python Backend Developer | Portfolio</title>
  <meta name="description" content="Experienced Python Backend Developer specializing in Django, REST APIs, and AWS deployment. View my portfolio and projects.">
  <meta name="keywords" content="Python Developer, Django, Backend, REST API, AWS">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Kamal - Python Backend Developer">
  <meta property="og:description" content="Professional portfolio showcasing Python and Django projects">
  <meta property="og:image" content="./assets/images/og-image.jpg">
  <meta property="og:url" content="https://oyekamal.github.io">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Kamal - Python Backend Developer">
  <meta name="twitter:description" content="Professional portfolio showcasing Python and Django projects">
</head>
```

### Content Guidelines
- **Unique Titles**: Each page should have a unique, descriptive title
- **Heading Structure**: Proper H1-H6 hierarchy
- **Internal Linking**: Link to related sections
- **Image Alt Text**: Descriptive alternative text
- **Schema Markup**: Structured data for better understanding

## 🚀 Deployment Guidelines

### Pre-deployment Checklist
- [ ] All code validated and tested
- [ ] Images optimized for web
- [ ] CSS and JavaScript minified
- [ ] Meta tags and SEO elements in place
- [ ] Cross-browser testing completed
- [ ] Accessibility testing passed
- [ ] Performance audit completed
- [ ] All external links tested

### Production Optimization
```bash
# Example build process
# 1. Optimize images
imagemin assets/images/*.jpg --out-dir=dist/assets/images/

# 2. Minify CSS
cleancss -o dist/assets/css/style.min.css assets/css/style.css

# 3. Minify JavaScript
terser assets/js/main.js -o dist/assets/js/main.min.js
```

## 🛠️ Tools & Extensions

### Recommended VS Code Extensions
- **Live Server**: Local development server
- **Prettier**: Code formatting
- **ESLint**: JavaScript linting
- **HTML CSS Support**: Enhanced CSS support
- **Auto Rename Tag**: Automatically rename paired HTML tags
- **Bracket Pair Colorizer**: Color-coded brackets
- **GitLens**: Enhanced Git capabilities
- **axe DevTools**: Accessibility testing

### Browser Developer Tools
- **Chrome DevTools**: Debugging and performance
- **Firefox Developer Tools**: CSS Grid and Flexbox inspector
- **Lighthouse**: Performance and accessibility auditing
- **WAVE**: Accessibility evaluation

### Online Tools
- **Can I Use**: Browser compatibility checking
- **WebPageTest**: Performance testing
- **GTmetrix**: Page speed insights
- **Color Contrast Analyzer**: Accessibility color checking

## 📚 Learning Resources

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/)
- [W3C Standards](https://www.w3.org/standards/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

### Best Practices
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals)
- [A11y Project](https://www.a11yproject.com/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript Info](https://javascript.info/)

---

*These guidelines should be followed by all contributors and reviewed regularly to ensure they remain current with best practices and web standards.*