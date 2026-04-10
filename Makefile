.PHONY: all clean serve

all: build/index.html build/styles build/scripts build/images build/files build/CNAME

clean:
	rm -rf build/

build/index.html: content/index.html Makefile
	@mkdir -p build
	sed 's|href="reset.css"|href="styles/reset.css"|g' content/index.html | \
	sed 's|href="index.css"|href="styles/index.css"|g' | \
	sed 's|src="translations.js"|src="scripts/translations.js"|g' | \
	sed 's|src="index.js"|src="scripts/index.js"|g' > build/index.html

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
