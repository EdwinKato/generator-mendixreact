> [Yeoman](http://yeoman.io) generator for Mendix widgets using react, typescript and webpack.

## About

This generator uses the Yeoman scaffolding tool to let you quickly create a [Mendix widget] that uses react, typescript and webpack

## Prerequisites _(you only have to do this once)_

First, you need to have [Node.js](https://nodejs.org/en/) installed. After that, you need to install Yeoman .

Open a command-line window (Press Win+R and type ``cmd`` or use Powershell)

```bash
  npm install -g yo grunt-cli generator-mendixreact
```

Scaffold a widget

### 1. Start the generator in the folder you want to create a widget

```bash
yo mendixreact
```

### 2. Provide the following information about your widget:

The following information needs to be provided about your widget:

* name
* description
* copyright
* license
* version
* author
* Github username (optional)

You can press \<Enter\> if you want to use the default values.

### 3. Use these commands to build the widget from the console
```bash
webpack
grunt build
```
