# Juan Vásquez - Personal Website

Personal academic website built with a monospace design aesthetic, deployed by hand to Cloudflare Pages.

**Live Site:** https://juan-vasquez.com (also at https://www.juan-vasquez.com)

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
│   └── files/           # Copied PDFs
│
├── Makefile             # Build configuration
├── wrangler.toml        # Cloudflare Pages project + output dir
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

3. **Result**: Self-contained website in `build/` ready for deployment

## Deployment

The site is hosted on **Cloudflare Pages** (project `my-site`) and every deploy
is run **by hand from a local checkout**. There is no CI: pushing to `main`
publishes nothing, so a commit that is not followed by a deploy leaves the live
site stale.

```bash
# make your changes
vim content/index.html

# build and check locally
make clean && make
make serve            # http://127.0.0.1:8000

# publish (build/ is rebuilt first)
make deploy

# then commit — the repo is the source of truth, not the trigger
git add content/index.html
git commit -m "Update content"
git push origin main
```

`make deploy` runs `wrangler pages deploy`, which reads `wrangler.toml` for the
project name and output directory. Routine deploys need no API token — the
`wrangler login` OAuth session on the machine already carries `pages:write`.

**Do not add a GitHub Actions workflow that deploys.** A workflow may build,
lint, or test, but the deploy stays manual and the deploy credentials stay on
the local machine rather than in repository secrets.

### Verifying a deploy

```bash
# should be 200, and Last-Modified should match the deploy you just ran
curl -sI "https://juan-vasquez.com/?cb=$(date +%s)" | head -1

# list recent deployments
wrangler pages deployment list --project-name=my-site
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
- Pushing does not deploy. Run `make deploy` — see [Deployment](#deployment).
- Confirm the upload landed: `wrangler pages deployment list --project-name=my-site`

**Assets not loading:**
- Ensure paths in `content/index.html` are root-relative (e.g., `reset.css` not `styles/reset.css`)
- The build process transforms these automatically

## Domain and TLS

`juan-vasquez.com` lives in the `juan-vasquez.com` zone on Cloudflare and is
served by the Pages project. Both hostnames are **proxied** (orange cloud), and
both are attached to the project as custom domains:

| Type  | Name  | Content                 | Proxy    |
| ----- | ----- | ----------------------- | -------- |
| CNAME | `@`   | `my-site-3rd.pages.dev` | Proxied  |
| CNAME | `www` | `my-site-3rd.pages.dev` | Proxied  |

The `pages.dev` hostname is `my-site-3rd`, not `my-site` — the shorter
subdomain was already taken globally when the project was created. It is only
the internal origin; visitors never see it.

Because the origin is Cloudflare itself, there is no origin certificate to
provision and nothing for the zone's **Full (strict)** SSL mode to reject. Keep
the records proxied: it is what keeps the apex in the zone's analytics, and it
coexists with `demos.juan-vasquez.com` (a *different* proxied record pointing
at Fly) without either interfering with the other.

**Do not point this domain back at GitHub Pages.** That was the previous setup
and it broke: GitHub issues its custom-domain certificate over an HTTP-01
challenge that Cloudflare's proxy intercepts, so no certificate was ever
issued, the origin presented only its `*.github.io` wildcard, and Full (strict)
answered every HTTPS request with **526 (invalid SSL certificate)** while plain
HTTP kept working — an outage that reads like a build failure but isn't.

**Diagnosing a TLS or routing error:**

```bash
# should be 200, served by cloudflare, with no x-github-* headers
curl -sSI https://juan-vasquez.com/ | head -1
curl -sSI https://juan-vasquez.com/ | grep -iE '^(server|x-github)'

# should be CN=juan-vasquez.com — a *.github.io subject means the DNS regressed
echo | openssl s_client -connect juan-vasquez.com:443 \
  -servername juan-vasquez.com 2>/dev/null | openssl x509 -noout -subject

# both hostnames should resolve to Cloudflare IPs (104.21.x / 172.67.x)
dig +short juan-vasquez.com A
dig +short www.juan-vasquez.com A
```

## Technology Stack

- **HTML/CSS/JavaScript**: Core web technologies
- **Make**: Build automation
- **Nix**: Reproducible development environment
- **Cloudflare Pages**: Static site hosting, deployed manually with `wrangler`

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
