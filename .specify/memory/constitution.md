<!-- 
Sync Impact Report:
Version change: None → 1.0.0
Modified principles: All principles added (initial constitution)
Added sections: Core Principles, Quality Standards, Development Workflow
Removed sections: None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (Constitution Check section updated)
- ✅ .specify/templates/spec-template.md (requirements alignment verified)  
- ✅ .specify/templates/tasks-template.md (task categorization verified)
Follow-up TODOs: None - all placeholders filled
-->

# Oykamal Portfolio Constitution

## Core Principles

### I. User-Centric Design (NON-NEGOTIABLE)
Accessibility First: All features must follow WCAG 2.1 AA standards; Mobile-First responsive design mandatory for all devices; Performance target: page load < 3 seconds on 3G; Intuitive navigation and clear information hierarchy required.

*Rationale: A portfolio website's primary purpose is to effectively communicate professional capabilities to potential employers and clients across all devices and accessibility needs.*

### II. Code Quality & Maintainability
Clean, self-documenting code with clear separation of concerns (HTML structure, CSS styling, JavaScript behavior); DRY principle enforcement with reusable components; Semantic HTML5 elements mandatory for SEO and accessibility.

*Rationale: Portfolio code often serves as a demonstration of coding skills and must exemplify professional development standards.*

### III. Performance & Optimization (NON-NEGOTIABLE)
Asset optimization: compress images, minify CSS/JS for production; Lazy loading for images and non-critical content; Efficient caching strategies; Maintain Lighthouse performance score > 90.

*Rationale: Performance directly impacts user experience and search engine rankings, crucial for a professional web presence.*

### IV. Security & Privacy
Minimal data collection with user privacy respect; Regular security audits of dependencies; Content Security Policy implementation; Safe external links with `rel="noopener noreferrer"`.

*Rationale: Professional websites must demonstrate security awareness and protect visitor privacy.*

### V. Cross-Browser Compatibility & Progressive Enhancement
Support evergreen browsers (Chrome, Firefox, Safari, Edge); Core functionality works without JavaScript; Graceful degradation for unsupported features; Regular cross-browser testing.

*Rationale: Professional accessibility requires broad device and browser support to reach maximum audience.*

## Quality Standards

**HTML Validation**: All HTML must pass W3C validation
**Performance Targets**: Lighthouse scores - Performance > 90, Accessibility > 95, Best Practices > 90, SEO > 90
**Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
**Browser Support**: 100% functionality across target browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Code Quality**: Modern CSS features, ES6+ JavaScript syntax, proper error handling

## Development Workflow

**Version Control**: Semantic versioning (MAJOR.MINOR.PATCH); Conventional commit messages; Comprehensive CHANGELOG maintenance
**Testing Gates**: HTML validation, CSS quality checks, Lighthouse audits, cross-browser functionality verification
**Review Process**: Code functionality, responsiveness, performance, accessibility, and maintainability evaluation
**Documentation**: Up-to-date README, inline code comments, and architectural decision records

## Governance

Constitution supersedes all other development practices and guidelines; All changes and pull requests must verify compliance with core principles; Performance optimizations and accessibility improvements are mandatory, not optional; Complexity in implementation must be justified against user benefit; Regular audits (monthly performance/accessibility, quarterly security, bi-annual technology stack review) ensure continued compliance.

**Amendment Process**: Constitution changes require documentation of impact, stakeholder approval, and migration plan for existing code; Version increment follows semantic versioning based on scope of changes.

**Version**: 1.0.0 | **Ratified**: 2025-09-26 | **Last Amended**: 2025-09-26