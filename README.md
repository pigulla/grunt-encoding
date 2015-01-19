# grunt-encoding

> Check character encoding of files using your local installation of `iconv`.

This plugin may or may not work under Windows (with Cygwin) or Mac OS, feedback is appreciated.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-encoding --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-encoding');
```

## The "encoding" task

### Overview
In your project's Gruntfile, add a section named `encoding` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  encoding: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.encoding
Type: `String`
Default value: `"UTF8"`

The encoding against which the files will be validated. Keep in mind that this value must be understood by iconv and is case sensitive. To get a list of all available encodings use `iconv --list`.

#### options.iconv
Type: `String`
Default value: `null`

If provided, use this iconv executable rather than whatever `which iconv` returns.

### Usage Examples

```js
grunt.initConfig({
  encoding: {
    options: {
      encoding: 'UTF8'
    },
    files: {
      src: ['src/**/*'],
    },
  },
})
```


## Release History
0.3.0 (2015/01/19) Made encoding support detection more robust and updated dependencies  
0.2.0 (2014/12/28) Fix issues with Windows line feeds and iconv version detection  
0.1.0 (2013/09/13) Initial release
