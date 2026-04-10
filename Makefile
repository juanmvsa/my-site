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
