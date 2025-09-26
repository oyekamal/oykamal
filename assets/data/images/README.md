# Project Screenshots Documentation

## Available Optimized Images

### Profile Images
- `face.webp` - Professional headshot (standard quality)
- `face@2x.webp` - Professional headshot (high-DPI/retina)

### Project Screenshots
All project images have been optimized and converted to WebP format with 2x versions for high-DPI displays:

1. **Lip-sync Animation Tool**
   - `lip-sync.webp` - Standard resolution
   - `lip-sync@2x.webp` - High-DPI resolution
   - Source: `assets/images/lip-sync.png`

2. **Django Paintings Gallery**
   - `paintings-gallery.webp` - Standard resolution
   - `paintings-gallery@2x.webp` - High-DPI resolution
   - Source: `assets/images/project-1.jpg`

3. **OwlSense Defense Analytics**
   - `owlsense.webp` - Standard resolution
   - `owlsense@2x.webp` - High-DPI resolution
   - Source: `assets/images/project-2.png`

4. **InstaMunch Restaurant API**
   - `instamunch.webp` - Standard resolution
   - `instamunch@2x.webp` - High-DPI resolution
   - Source: `assets/images/project-3.png`

5. **Additional Project Placeholder**
   - `project-4.webp` - Standard resolution
   - `project-4@2x.webp` - High-DPI resolution
   - Source: `assets/images/project-4.png`

## Image Optimization Details
- Format: WebP with fallback to original formats
- Standard quality: 80% (good balance of size/quality)
- High-DPI quality: 75% (optimized for larger files)
- All images auto-oriented and converted to RGB for WebP compatibility
- Responsive srcSet includes both standard and 2x versions

## Usage in JSON Data
All project screenshots in `projects.json` reference these optimized images with proper ImageAsset structure including:
- Primary src (original format)
- srcWebP (optimized WebP version)  
- srcSet (responsive image set)
- Proper alt text for accessibility
- Dimensions and lazy loading configuration