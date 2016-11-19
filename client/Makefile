#!/usr/bin/make -f

WEBPACK = node node_modules/webpack/bin/webpack.js

.PHONY: webpack
webpack:
	npm run webpack

.PHONY: ww webpack-w
ww: webpack-w
webpack-w:
	cygstart bash -c '"echo $(WEBPACK) -w --progress | bash -i ; cmd /c pause"'
