/*jshint -W108,-W069 */
'use strict';

var pkg = require(__dirname + '/../../package.json');
var fs = require('fs');
var extfs = require('extfs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var yeoman = require('yeoman-generator');

var promptTexts = require('./lib/prompttexts.js');
var text = require('./lib/text.js');

var emptyBoilerPlatePath = 'EmptyWidgetBoilerplate/',
    progressBarBoilerplatePath = 'ProgressBarBoilerplate/';

var banner = text.getBanner(pkg);

module.exports = yeoman.Base.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);
        var done = this.async();
        this.isNew = true;

        this.FINISHED = false;

        this.folders = extfs.getDirsSync(this.destinationRoot());
        this.current = {};
        this.current.version = '1.0.0';
        this.current.name = 'CurrentWidget';

        if (this.folders.indexOf('src') !== -1) {
            var srcFolderContent = extfs.getDirsSync(this.destinationPath('src'));
            if (srcFolderContent.length === 1) {
                this.current.name = srcFolderContent[0];
            }
            if (!extfs.isEmptySync(this.destinationPath('package.json'))) {
                try {
                    var destPkg = JSON.parse(fs.readFileSync(this.destinationPath('package.json')).toString());
                    this.current.description = destPkg.description;
                    this.current.author = destPkg.author;
                    this.current.copyright = destPkg.copyright;
                    this.current.license = destPkg.license;
                    this.current.builder = typeof destPkg.devDependencies.grunt !== 'undefined' ? 'grunt' : 'gulp';
                } catch (e) {
                    console.error(text.PACKAGE_READ_ERROR + e.toString());
                    this.FINISHED = true;
                    done();
                    return;
                }
            }
            if (!extfs.isEmptySync(this.destinationPath('src/package.xml'))) {
                this.isNew = false;
                var pkgXml = fs.readFileSync(this.destinationPath('src/package.xml')).toString();
                parser.parseString(pkgXml, function(err, result) {
                    if (err) {
                        this.log('Error: ' + err);
                        this.FINISHED = true;
                        done();
                        return;
                    }
                    if (result.package.clientModule[0].$.version) {
                        var version = result.package.clientModule[0].$.version;
                        if (version.split('.').length === 2) {
                            version += '.0';
                        }
                        this.current.version = version;
                    }
                    done();
                }.bind(this));
            } else {
                this.isNew = false;
                done();
            }
        } else if (!extfs.isEmptySync(this.destinationRoot())) {
            this.log(banner);
            this.log(text.DIR_NOT_EMPTY_ERROR);
            this.FINISHED = true;
            done();
        } else {
            done();
        }
    },
    prompting: function() {
        var done = this.async();

        if (this.FINISHED) {
            done();
            return;
        }

        // Have Yeoman greet the user.
        this.log(banner);

        if (this.isNew) {
            this
                .prompt(promptTexts.promptsNew())
                .then(function(props) {
                    this.props = props;
                    done();
                }.bind(this));
        } else {
            this
                .prompt(promptTexts.promptsUpgrade(this.current))
                .then(function(props) {
                    this.props = props;
                    if (!props.upgrade) {
                        process.exit(0);
                    } else {
                        done();
                    }
                }.bind(this));
        }
    },

    writing: {
        app: function() {
            if (this.FINISHED) {
                return;
            }
            // Define widget variables
            this.widget = {};
            this.widget.widgetName = this.props.widgetName;
            this.widget.packageName = this.props.widgetName;
            this.widget.description = this.props.description || this.current.description;
            this.widget.version = this.props.version;
            this.widget.author = this.props.author || this.current.author;
            this.widget.date = (new Date()).toLocaleDateString();
            this.widget.copyright = this.props.copyright || this.current.copyright;
            this.widget.license = this.props.license || this.current.license;
            this.widget.generatorVersion = pkg.version;

            this.widget.builder = this.props.builder;

            if (this.isNew) {
                var source = this.props.boilerplate === 'progressbarboilerplate' ? progressBarBoilerplatePath : emptyBoilerPlatePath;
                this.props.widgetOptionsObj = {};
                if (this.props.boilerplate === 'empty') {
                    for (var i = 0; i < this.props.widgetoptions.length; i++) {
                        this.props.widgetOptionsObj[this.props.widgetoptions[i]] = true;
                    }
                }

                // Copy generic files
                this.fs.copy(this.templatePath('icon.png'), this.destinationPath('icon.png'));
                this.fs.copy(this.templatePath(emptyBoilerPlatePath + 'README.md'), this.destinationPath('README.md'));
                this.fs.copy(this.templatePath(source + 'MxTestProject/Test.mpr'), this.destinationPath('dist/MxTestProject/Test.mpr'));
                this.fs.copy(this.templatePath(emptyBoilerPlatePath + 'tests/'), this.destinationPath('tests/'));
                this.fs.copy(this.templatePath(emptyBoilerPlatePath + 'typings/'), this.destinationPath('typings/'));
                this.fs.copy(this.templatePath(emptyBoilerPlatePath + 'xsd/widget.xsd'), this.destinationPath('xsd/widget.xsd'));

                // Copy files based on WidgetName

                this.fs.copy(
                    this.templatePath(source + 'src/WidgetName/widget/components/WidgetName.ts.ejs'),
                    this.destinationPath('src/' + this.widget.widgetName + '/widget/components/' + this.widget.widgetName + '.ts'), {
                        process: function(file) {
                            var fileText = file.toString();
                            fileText = fileText
                                .replace(/WidgetName/g, this.widget.widgetName);
                            return fileText;
                        }.bind(this)
                    }
                );

                this.fs.copy(
                    this.templatePath(source + 'src/WidgetName/widget/components/__tests__/WidgetName.spec.ts'),
                    this.destinationPath('src/' + this.widget.widgetName + '/widget/components/__tests__/' + this.widget.widgetName + '.spec.ts'), {
                        process: function(file) {
                            var fileText = file.toString();
                            fileText = fileText
                                .replace(/WidgetName/g, this.widget.widgetName);
                            return fileText;
                        }.bind(this)
                    }
                );

                this.fs.copy(
                    this.templatePath(source + 'src/WidgetName/widget/ui/WidgetName.css'),
                    this.destinationPath('src/' + this.widget.widgetName + '/widget/ui/' + this.widget.widgetName + '.css')
                );

                // Rename references in widget main ts
                this.fs.copy(
                    this.templatePath(source + 'src/WidgetName/widget/WidgetName.ts.ejs'),
                    this.destinationPath('src/' + this.widget.widgetName + '/widget/' + this.widget.widgetName + '.ts'), {
                        process: function(file) {
                            var fileText = file.toString();
                            fileText = fileText
                                .replace(/WidgetName\.widget\.WidgetName/g, this.widget.packageName + '.widget.' + this.widget.widgetName)
                                .replace(/WidgetName\/widget\/WidgetName/g, this.widget.packageName + '/widget/' + this.widget.widgetName)
                                .replace(/WidgetName/g, this.widget.widgetName)
                                .replace(/\{\{version\}\}/g, this.widget.version)
                                .replace(/\{\{date\}\}/g, this.widget.date)
                                .replace(/\{\{copyright\}\}/g, this.widget.copyright)
                                .replace(/\{\{license\}\}/g, this.widget.license)
                                .replace(/\{\{author\}\}/g, this.widget.author);
                            return fileText;
                        }.bind(this)
                    }
                );

                // Rename references package.xml
                this.fs.copy(
                    this.templatePath(source + 'src/package.xml'),
                    this.destinationPath('src/package.xml'), {
                        process: function(file) {
                            var fileText = file.toString();
                            fileText = fileText
                                .replace(/WidgetName/g, this.widget.widgetName)
                                .replace(/\{\{version\}\}/g, this.widget.version);
                            return fileText;
                        }.bind(this)
                    }
                );

                // Rename references WidgetName
                this.fs.copy(
                    this.templatePath(source + 'src/WidgetName/WidgetName.xml'),
                    this.destinationPath('src/' + this.widget.widgetName + '/' + this.widget.widgetName + '.xml'), {
                        process: function(file) {
                            var fileText = file.toString();
                            fileText = fileText
                                .replace(/WidgetName\.widget\.WidgetName/g, this.widget.packageName + '.widget.' + this.widget.widgetName)
                                .replace(/WidgetName/g, this.widget.widgetName);
                            return fileText;
                        }.bind(this)
                    }
                );
            }

            // Gitignore
            this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('.gitignore'));

            // jshint
            this.fs.copy(this.templatePath('_jshintrc'), this.destinationPath('.jshintrc'));

            // tslint
            this.fs.copy(this.templatePath('tslint.json'), this.destinationPath('tslint.json'));

            // karma
            this.fs.copy(this.templatePath('karma.conf.js'), this.destinationPath('karma.conf.js'));

            // tsconfig
            this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));

            // webpack
            this.fs.copy(
                this.templatePath('webpack.config.js'),
                this.destinationPath('webpack.config.js'), {
                    process: function(file) {
                        var fileText = file.toString();
                        fileText = fileText
                            .replace(/WidgetName/g, this.widget.widgetName);
                        return fileText;
                    }.bind(this)
                }
            );

            // Package.JSON
            try {
                extfs.removeSync(this.destinationPath('package.json'));
            } catch (e) {}
            this.template('_package.json', 'package.json', this.widget, {});

            // Add Gulp/Grunt/tsconfig/tslint/webpack/karma
            this.pkg = pkg;

            try {
                extfs.removeSync(this.destinationPath('Gruntfile.js'));
            } catch (e) {}
            try {
                extfs.removeSync(this.destinationPath('Gulpfile.js'));
            } catch (e) {}
            try {
                extfs.removeSync(this.destinationPath('tsconfig.json'));
            } catch (e) {}
            try {
                extfs.removeSync(this.destinationPath('tslint.json'));
            } catch (e) {}
            try {
                extfs.removeSync(this.destinationPath('karma.conf.js'));
            } catch (e) {}
            try {
                extfs.removeSync(this.destinationPath('webpack.config.js'));
            } catch (e) {}

            this.template('Gruntfile.js', 'Gruntfile.js', this, {});
        },

        projectfiles: function() {
            if (this.FINISHED) {
                return;
            }
            this.fs.copy(
                this.templatePath('editorconfig'),
                this.destinationPath('.editorconfig')
            );
        }
    },

    install: function() {
        if (this.FINISHED) {
            return;
        }
        this.log(text.INSTALL_FINISH_MSG);
        this.npmInstall();
    },

    end: function() {
        if (this.FINISHED) {
            return;
        }
        if (extfs.isEmptySync(this.destinationPath('node_modules'))) {
            this.log(text.END_NPM_NEED_INSTALL_MSG);
        } else {
            this.log(text.END_RUN_BUILD_MSG);
            this.spawnCommand('grunt');
        }
    }
});