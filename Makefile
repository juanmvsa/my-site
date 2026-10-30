.PHONY: all clean serve deploy check-analytics

all: build/index.html build/404.html build/styles build/scripts build/images build/files

clean:
	rm -rf build/

build/index.html: content/index.html Makefile
	@mkdir -p build
	sed 's|href="reset.css"|href="styles/reset.css"|g' content/index.html | \
	sed 's|href="index.css"|href="styles/index.css"|g' | \
	sed 's|src="translations.js"|src="scripts/translations.js"|g' | \
	sed 's|src="analytics.js"|src="scripts/analytics.js"|g' | \
	sed 's|src="index.js"|src="scripts/index.js"|g' > build/index.html

# cloudflare pages serves this with a real 404 status for unmatched paths.
# without it, pages falls back to index.html with a 200 (a soft 404).
build/404.html: content/404.html Makefile
	@mkdir -p build
	sed 's|href="reset.css"|href="styles/reset.css"|g' content/404.html | \
	sed 's|href="index.css"|href="styles/index.css"|g' | \
	sed 's|src="analytics.js"|src="/scripts/analytics.js"|g' > build/404.html

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

serve: all
	@echo "Serving site at http://127.0.0.1:8000"
	@cd build && uv run python -m http.server -b 127.0.0.1 8000

# manual deploy — never run from CI. see README "Deployment".
deploy: all check-analytics
	wrangler pages deploy

# refuses to ship analytics.js with the placeholder posthog key.
check-analytics: build/scripts
	@if grep -q '^const POSTHOG_KEY = "phc_REPLACE_ME";' build/scripts/analytics.js; then \
		echo "error: set POSTHOG_KEY in assets/scripts/analytics.js before deploying"; exit 1; \
	fi
