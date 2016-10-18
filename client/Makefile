#!/usr/bin/make -f

.PHONY: webpack
webpack:
	npm run webpack

.PHONY: ww webpack-w
ww: webpack-w
webpack-w:
	cygstart bash -c '"echo webpack -w --progress | bash -i ; cmd /c pause"'
