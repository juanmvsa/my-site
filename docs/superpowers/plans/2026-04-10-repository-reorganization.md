# Repository Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize repository into content-first structure with automated GitHub Actions deployment

**Architecture:** Separate editable content (content/), web assets (assets/), and generated output (build/). Use GitHub Actions to build and deploy on push.

**Tech Stack:** Pandoc, Make, GitHub Actions, GitHub Pages

---

## File Structure

**Directories to create:**
- `content/` - Editable markdown and translations
- `assets/styles/` - CSS files
- `assets/scripts/` - JavaScript files
- `assets/images/` - Image assets
- `.github/workflows/` - GitHub Actions configuration

**Files to move (with git mv):**
- `index.md` → `content/index.md`
- `translations.js` → `content/translations.js`
- `reset.css` → `assets/styles/reset.css`
- `index.css` → `assets/styles/index.css`
- `index.js` → `assets/scripts/index.js`
- `i18n.js` → `assets/scripts/i18n.js`
- `template.html` → `assets/template.html`
- `castle.jpg` → `assets/images/castle.jpg`

**Files to modify:**
- `Makefile` - Update paths and add asset copying
- `assets/template.html` - Update CSS/JS paths (after moving)
- `.gitignore` - Add build/ exclusion

**Files to create:**
- `.github/workflows/deploy.yml` - GitHub Actions workflow

**Files to remove:**
- `index.html` - Now generated in build/

---

## Task 1: Create Directory Structure

**Files:**
- Create: `content/` (directory)
- Create: `assets/styles/` (directory)
- Create: `assets/scripts/` (directory)
- Create: `assets/images/` (directory)
- Create: `.github/workflows/` (directory)

- [ ] **Step 1: Create content directory**

```bash
mkdir -p content
```

Expected: Directory created, no output

- [ ] **Step 2: Create assets subdirectories**

```bash
mkdir -p assets/styles assets/scripts assets/images
```

Expected: Directories created, no output

- [ ] **Step 3: Create GitHub workflows directory**

```bash
mkdir -p .github/workflows
```

Expected: Directory created, no output

- [ ] **Step 4: Verify directory structure**

```bash
ls -la content/ assets/ .github/workflows/
```

Expected: All directories exist and are empty

- [ ] **Step 5: Commit directory structure**

```bash
git add content/ assets/ .github/
git commit -m "chore: create directory structure for reorganization"
```

Expected: Commit created successfully

---

## Task 2: Move Content Files

**Files:**
- Move: `index.md` → `content/index.md`
- Move: `translations.js` → `content/translations.js`

- [ ] **Step 1: Move index.md to content directory**

```bash
git mv index.md content/
```

Expected: File moved, git tracks the move

- [ ] **Step 2: Move translations.js to content directory**

```bash
git mv translations.js content/
```

Expected: File moved, git tracks the move

- [ ] **Step 3: Verify files moved correctly**

```bash
ls -la content/
```

Expected: Shows index.md and translations.js in content/

- [ ] **Step 4: Verify git status**

```bash
git status
```

Expected: Shows renamed files (index.md → content/index.md, etc.)

- [ ] **Step 5: Commit content file moves**

```bash
git commit -m "refactor: move content files to content/ directory"
```

Expected: Commit created successfully

---

## Task 3: Move Style Files

**Files:**
- Move: `reset.css` → `assets/styles/reset.css`
- Move: `index.css` → `assets/styles/index.css`

- [ ] **Step 1: Move reset.css to assets/styles**

```bash
git mv reset.css assets/styles/
```

Expected: File moved, git tracks the move

- [ ] **Step 2: Move index.css to assets/styles**

```bash
git mv index.css assets/styles/
```

Expected: File moved, git tracks the move

- [ ] **Step 3: Verify files moved correctly**

```bash
ls -la assets/styles/
```

Expected: Shows reset.css and index.css in assets/styles/

- [ ] **Step 4: Commit style file moves**

```bash
git commit -m "refactor: move CSS files to assets/styles/ directory"
```

Expected: Commit created successfully

---

## Task 4: Move Script Files

**Files:**
- Move: `index.js` → `assets/scripts/index.js`
- Move: `i18n.js` → `assets/scripts/i18n.js`

- [ ] **Step 1: Move index.js to assets/scripts**

```bash
git mv index.js assets/scripts/
```

Expected: File moved, git tracks the move

- [ ] **Step 2: Move i18n.js to assets/scripts**

```bash
git mv i18n.js assets/scripts/
```

Expected: File moved, git tracks the move

- [ ] **Step 3: Verify files moved correctly**

```bash
ls -la assets/scripts/
```

Expected: Shows index.js and i18n.js in assets/scripts/

- [ ] **Step 4: Commit script file moves**

```bash
git commit -m "refactor: move JavaScript files to assets/scripts/ directory"
```

Expected: Commit created successfully

---

## Task 5: Move Template and Images

**Files:**
- Move: `template.html` → `assets/template.html`
- Move: `castle.jpg` → `assets/images/castle.jpg`

- [ ] **Step 1: Move template.html to assets**

```bash
git mv template.html assets/
```

Expected: File moved, git tracks the move

- [ ] **Step 2: Move castle.jpg to assets/images**

```bash
git mv castle.jpg assets/images/
```

Expected: File moved, git tracks the move

- [ ] **Step 3: Verify files moved correctly**

```bash
ls -la assets/ assets/images/
```

Expected: Shows template.html in assets/ and castle.jpg in assets/images/

- [ ] **Step 4: Commit template and image moves**

```bash
git commit -m "refactor: move template and images to assets/ directory"
```

Expected: Commit created successfully

---

## Task 6: Update Template Paths

**Files:**
- Modify: `assets/template.html`

- [ ] **Step 1: Read current template**

```bash
head -20 assets/template.html
```

Expected: See current CSS and script references

- [ ] **Step 2: Update CSS path references in template**

Update the template's CSS link tags from:
```html
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="index.css" />
```

to:
```html
<link rel="stylesheet" href="styles/reset.css" />
<link rel="stylesheet" href="styles/index.css" />
```

- [ ] **Step 3: Update script path references in template**

Update the script tag from:
```html
<script src="translations.js"></script>
```

to:
```html
<script src="scripts/translations.js"></script>
```

And update:
```html
<script src="index.js"></script>
```

to:
```html
<script src="scripts/index.js"></script>
```

- [ ] **Step 4: Verify template changes**

```bash
grep -n "href=\|src=" assets/template.html | head -10
```

Expected: See updated paths with styles/ and scripts/ prefixes

- [ ] **Step 5: Commit template updates**

```bash
git add assets/template.html
git commit -m "fix: update CSS and script paths in template"
```

Expected: Commit created successfully

---

## Task 7: Update Makefile

**Files:**
- Modify: `Makefile`

- [ ] **Step 1: Read current Makefile**

```bash
cat Makefile
```

Expected: See current build configuration

- [ ] **Step 2: Replace Makefile with updated version**

Replace entire Makefile content with:

```makefile
.PHONY: all clean serve

all: build/index.html build/styles build/scripts build/images build/files build/CNAME

clean:
	rm -rf build/

build/index.html: content/index.md assets/template.html Makefile
	@mkdir -p build
	pandoc --toc -s \
		--css styles/reset.css \
		--css styles/index.css \
		-i content/index.md \
		-o build/index.html \
		--template=assets/template.html

build/styles: assets/styles/*.css
	@mkdir -p build/styles
	cp assets/styles/*.css build/styles/

build/scripts: assets/scripts/*.js content/translations.js
	@mkdir -p build/scripts
	cp assets/scripts/*.js build/scripts/
	cp content/translations.js build/scripts/

build/images: assets/images/*
	@mkdir -p build/images
	cp assets/images/* build/images/

build/files: files/*
	@mkdir -p build
	cp -r files build/

build/CNAME: CNAME
	@mkdir -p build
	cp CNAME build/

serve: all
	@echo "Serving site at http://localhost:8000"
	@cd build && python3 -m http.server 8000
```

- [ ] **Step 3: Verify Makefile syntax**

```bash
cat Makefile
```

Expected: New Makefile with updated paths and targets

- [ ] **Step 4: Commit Makefile updates**

```bash
git add Makefile
git commit -m "refactor: update Makefile for new directory structure"
```

Expected: Commit created successfully

---

## Task 8: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Read current .gitignore**

```bash
cat .gitignore
```

Expected: See current gitignore rules

- [ ] **Step 2: Add build/ to .gitignore**

```bash
echo "build/" >> .gitignore
```

Expected: build/ added to .gitignore

- [ ] **Step 3: Verify .gitignore update**

```bash
cat .gitignore
```

Expected: See build/ in the file

- [ ] **Step 4: Commit .gitignore update**

```bash
git add .gitignore
git commit -m "chore: exclude build/ directory from git"
```

Expected: Commit created successfully

---

## Task 9: Remove Old Generated File

**Files:**
- Remove: `index.html`

- [ ] **Step 1: Check if index.html exists**

```bash
ls -la index.html
```

Expected: File exists in root

- [ ] **Step 2: Remove index.html from git**

```bash
git rm index.html
```

Expected: File staged for removal

- [ ] **Step 3: Verify removal**

```bash
git status
```

Expected: Shows index.html as deleted

- [ ] **Step 4: Commit removal**

```bash
git commit -m "chore: remove generated index.html from repository"
```

Expected: Commit created successfully

---

## Task 10: Test Local Build

**Files:**
- Test: Generated `build/` directory and contents

- [ ] **Step 1: Clean any existing build artifacts**

```bash
make clean
```

Expected: build/ directory removed if it exists

- [ ] **Step 2: Run make to build the site**

```bash
make
```

Expected: Build completes without errors, creates build/ directory

- [ ] **Step 3: Verify build/index.html exists**

```bash
ls -la build/index.html
```

Expected: File exists and has content

- [ ] **Step 4: Verify assets copied correctly**

```bash
ls -la build/styles/ build/scripts/ build/images/ build/files/
```

Expected: All directories exist with copied files

- [ ] **Step 5: Verify CNAME copied**

```bash
ls -la build/CNAME
```

Expected: CNAME file exists in build/

- [ ] **Step 6: Check build/index.html content**

```bash
head -30 build/index.html
```

Expected: HTML with correct CSS/JS references (styles/*, scripts/*)

- [ ] **Step 7: Open in browser for visual verification**

```bash
open build/index.html
```

Expected: Site loads with styles, scripts work, images display

(Note: If not on macOS, use `xdg-open` on Linux or manually open the file)

---

## Task 11: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy.yml workflow file**

Create `.github/workflows/deploy.yml` with this content:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install Nix
        uses: cachix/install-nix-action@v25
        with:
          nix_path: nixpkgs=channel:nixos-unstable

      - name: Build site with Make
        run: |
          nix develop --command make

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./build

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify workflow file**

```bash
cat .github/workflows/deploy.yml
```

Expected: Complete workflow configuration

- [ ] **Step 3: Commit workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for automated deployment"
```

Expected: Commit created successfully

---

## Task 12: Final Verification and Documentation

**Files:**
- Verify: All changes committed and working
- Update: `README.md` (optional)

- [ ] **Step 1: Check git status**

```bash
git status
```

Expected: Working tree clean (all changes committed)

- [ ] **Step 2: Review commit history**

```bash
git log --oneline -15
```

Expected: See all reorganization commits

- [ ] **Step 3: Verify root directory is clean**

```bash
ls -la
```

Expected: Only config files, directories, no scattered content/asset files

- [ ] **Step 4: Test build one more time**

```bash
make clean && make
```

Expected: Clean build succeeds

- [ ] **Step 5: Check that build/ is ignored**

```bash
git status
```

Expected: build/ directory not shown in untracked files

- [ ] **Step 6: Review file organization**

```bash
tree -L 2 -I 'node_modules|.git|build'
```

Expected: Clean directory structure matching design

(If tree is not available, use `ls -R` instead)

---

## Task 13: Push and Deploy

**Files:**
- Push: All commits to GitHub
- Verify: GitHub Actions runs successfully

- [ ] **Step 1: Push all commits to GitHub**

```bash
git push origin main
```

Expected: All commits pushed successfully

- [ ] **Step 2: Check GitHub Actions workflow**

Visit: `https://github.com/<username>/<repo>/actions`

Expected: Workflow triggered and running

- [ ] **Step 3: Monitor workflow completion**

Wait for workflow to complete (typically 2-5 minutes)

Expected: Both build and deploy jobs succeed with green checkmarks

- [ ] **Step 4: Verify deployment to GitHub Pages**

Visit your GitHub Pages URL (check repository settings for URL)

Expected: Site loads correctly with all styles, scripts, and content

- [ ] **Step 5: Check browser console for errors**

Open browser developer tools → Console tab

Expected: No 404 errors or broken resource links

- [ ] **Step 6: Test all functionality**

- Click navigation links
- Test language toggle (EN/ES)
- Click PDF links
- Verify images load
- Check responsive behavior

Expected: Everything works as before reorganization

---

## Post-Implementation Verification

After all tasks complete, verify:

**Content Editing Workflow:**
1. Edit `content/index.md` with a small test change
2. Commit: `git add content/index.md && git commit -m "test: verify workflow"`
3. Push: `git push`
4. Verify GitHub Actions builds and deploys automatically
5. Check updated content appears on live site
6. Revert test change if desired

**Local Development:**
1. Make local changes to `content/index.md`
2. Run `make` to preview
3. Open `build/index.html` in browser
4. Verify changes render correctly
5. `build/` directory not tracked by git

**File Organization:**
- Primary edits happen in `content/` only
- Infrastructure in `assets/` rarely touched
- Root level has only config files
- No generated files in git

---

## Rollback Instructions

If anything goes wrong:

```bash
# Find the commit before reorganization started
git log --oneline

# Revert to that commit (replace <commit-hash>)
git revert <commit-hash>..HEAD

# Or reset (WARNING: loses uncommitted work)
git reset --hard <commit-hash>

# Force push if already pushed
git push --force origin main
```

Better approach: Fix forward by addressing specific issues rather than reverting entirely.
