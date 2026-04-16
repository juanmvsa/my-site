# Juan Vásquez - Personal Website

Personal academic website built with a monospace design aesthetic, featuring automatic deployment via GitHub Actions.

**Live Site:** https://juan-vasquez.com (also available at https://juanmvsa.github.io/my-site)

## Project Structure

This repository uses a content-first organization that separates editable source files from infrastructure and generated output:

```
my_site/
├── content/              # Primary workspace - edit these files
│   ├── index.html        # Main website content (HTML source)
│   └── translations.js   # i18n translations (EN/ES)
│
├── assets/              # Web infrastructure (rarely edited)
│   ├── styles/
│   │   ├── reset.css    # CSS reset
│   │   └── index.css    # Main styles
│   ├── scripts/
│   │   ├── index.js     # Main JavaScript
│   │   └── i18n.js      # Internationalization logic
│   ├── images/
│   │   └── castle.jpg   # Image assets
│   └── template.html    # Pandoc template (not currently used)
│
├── files/               # Static files (PDFs, certificates)
│   ├── academic_cv_march_2025.pdf
│   ├── cv_march_2025.pdf
│   ├── resume_en_friday_10_april_2026.pdf
│   ├── resume_es_friday_10_april_2026.pdf
│   ├── resume_sept_2025.pdf
│   └── certificates/
│
├── build/               # Generated output (excluded from git)
│   ├── index.html       # Built website
│   ├── styles/          # Copied CSS
│   ├── scripts/         # Copied JS
│   ├── images/          # Copied images
│   ├── files/           # Copied PDFs
│   └── CNAME            # GitHub Pages domain
│
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions CI/CD
│
├── Makefile             # Build configuration
└── flake.nix           # Nix development environment
```

## Quick Start

### Prerequisites

- **Nix** (recommended): For consistent build environment
  ```bash
  # Install Nix
  curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
  ```

- **Or manually install**:
  - Make (usually pre-installed on Unix systems)
  - Basic shell utilities (sed, cp)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/juanmvsa/my-site.git
   cd my-site
   ```

2. **Build the site**
   ```bash
   # Using Nix (recommended)
   nix develop --command make

   # Or directly with Make
   make
   ```

3. **Preview locally**
   ```bash
   # Open in browser
   open build/index.html

   # Or serve with local server
   make serve
   # Visit http://localhost:8000
   ```

4. **Clean build artifacts**
   ```bash
   make clean
   ```

## Editing Content

### Update Website Content

The main website content is in `content/index.html`. This is the source file that gets copied to `build/` during the build process.

1. **Edit the HTML**
   ```bash
   # Edit content directly
   vim content/index.html
   # Or use your preferred editor
   ```

2. **Preview changes**
   ```bash
   make clean && make
   open build/index.html
   ```

3. **Important**: Use root-relative paths in the HTML (e.g., `reset.css`, not `styles/reset.css`). The build process automatically updates these paths for the generated site.

### Update Translations

The site supports English and Spanish:
- **English content** is in `content/index.html` (source of truth)
- **Spanish translations** are in `content/translations.js`

To modify Spanish translations, edit `content/translations.js`:

```javascript
window.translations = {
  es: {
    title: "Juan Vásquez",
    intro: "intro",
    introText: "soy Juan Vásquez, estudiante de doctorado...",
    // ... more translations
  }
};
```

To modify English content, edit the HTML directly in `content/index.html`.

### Update PDFs/CVs

1. Add new PDFs to the `files/` directory
2. Update links in `content/index.html` as needed
3. Build and deploy

## Build Process

The Makefile orchestrates the build:

1. **Transforms `content/index.html`**: Updates asset paths from root-relative to build-relative
   - `reset.css` → `styles/reset.css`
   - `translations.js` → `scripts/translations.js`
   - etc.

2. **Copies all assets**:
   - CSS files → `build/styles/`
   - JavaScript files → `build/scripts/`
   - Images → `build/images/`
   - PDFs → `build/files/`
   - CNAME → `build/CNAME`

3. **Result**: Self-contained website in `build/` ready for deployment

## Deployment

### Automatic Deployment (Recommended)

The site automatically deploys to GitHub Pages when you push to `main`:

```bash
# Make your changes
vim content/index.html

# Build and test locally
make clean && make
open build/index.html

# Commit and push
git add content/index.html
git commit -m "Update content"
git push origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. Build the site using Make
2. Deploy to GitHub Pages
3. Update your live site at https://juan-vasquez.com

### Manual Deployment

If needed, you can build and deploy manually:

```bash
# Build locally
make clean && make

# The build/ directory contains the complete site
# Deploy build/ contents to your hosting service
```

## Development Workflow

### Making Content Changes

1. **Edit**: Modify `content/index.html`
2. **Test**: `make clean && make && open build/index.html`
3. **Commit**: `git add content/index.html && git commit -m "description"`
4. **Deploy**: `git push origin main`

### Updating Styles or Scripts

1. Edit files in `assets/styles/` or `assets/scripts/`
2. Test build: `make clean && make`
3. Commit and push

### Troubleshooting

**Build fails:**
```bash
# Check you're in the right directory
pwd  # Should be .../my_site

# Try clean build
make clean && make
```

**Site doesn't update after push:**
- Check GitHub Actions: https://github.com/juanmvsa/my-site/actions
- Verify Pages source is set to "GitHub Actions" in repository settings

**Assets not loading:**
- Ensure paths in `content/index.html` are root-relative (e.g., `reset.css` not `styles/reset.css`)
- The build process transforms these automatically

## GitHub Pages Configuration

**One-time setup:**

1. Go to repository Settings → Pages
2. Under "Build and deployment" → "Source"
3. Select **"GitHub Actions"**
4. Save

The workflow will now deploy automatically on every push to `main`.

## Technology Stack

- **HTML/CSS/JavaScript**: Core web technologies
- **Make**: Build automation
- **Nix**: Reproducible development environment
- **GitHub Actions**: CI/CD pipeline
- **GitHub Pages**: Static site hosting

## Design Philosophy

This site uses an all-monospace design aesthetic inspired by [The Monospace Web](https://owickstrom.github.io/the-monospace-web/) by Oskar Wickström.

### Key Features

- **Monospace typography**: All text uses monospace fonts for consistency
- **Minimalist design**: Focus on content over decoration
- **Bilingual support**: English/Spanish translations via JavaScript
- **Responsive**: Works on desktop and mobile
- **Fast**: Static HTML, minimal JavaScript, no external dependencies

## Repository Organization

This repository was reorganized in April 2026 to implement a content-first structure:

- **Before**: All files scattered in root directory, unclear what to edit
- **After**: Clear separation between content (what you edit), infrastructure (rarely touch), and build output (generated)

This makes it immediately obvious which files need editing to update the website.

## License

[MIT](LICENSE.md)

## Acknowledgments

- Design inspired by [The Monospace Web](https://github.com/owickstrom/the-monospace-web) by Oskar Wickström
- Icons and graphics from [U.S. Graphics Company](https://x.com/usgraphics)

---

**Maintained by**: Juan Vásquez
**Contact**: juanmvs[at]proton.me
**Last Updated**: April 2026
