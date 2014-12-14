/* jshint node: true */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        bump: {
            options: {
              files: ['package.json'],
              updateConfigs: ['pkg'],
              commit: false,
              createTag: false,
              push: false,
              globalReplace: false
            }
        },    
        pkg: grunt.file.readJSON('package.json'),
        options: {
            firefox: {
                build: 'build/Firefox/content',
                id: 'remotelivereload@gmail.com',
                minVersion: '29.0',
                maxVersion: '36.0'
            },
            chrome: {
                build: 'build/Chrome/LiveReload',
                key: 'keys/chrome.pem'
            },
            safari: {
                build: 'build/LiveReload.safariextension',
                id: 'com.livereload.extensions.SafariLiveReload', // something
                update: 'http://download.livereload.com/LiveReload-Safari-update.plist' // different here?
            }
        },

        copy: {
            options: {
                process: function(content, path) {
                    return grunt.template.process(content);
                },
                noProcess: '**/*.png'
            },
            common: {
                src: 'template/VERSION',
                dest: 'build/VERSION'
            },
            chrome: {
                files: [
                  { 
                    expand: true,
                    flatten: true,
                    src:'template/Chrome/*', 
                    dest:'<%= options.chrome.build %>' 
                  },
                  { 
                    expand: true,
                    flatten: true,
                    src:'template/Shared/*', 
                    dest:'<%= options.chrome.build %>' 
                  },
                ]
            },
            firefox: {
                files: [
                  { 
                    expand: true,
                    cwd: 'template',
                    src: 'Firefox/**',
                    dest: 'build'
                  },
                  { 
                    expand: true,
                    flatten: true,
                    cwd: 'template',
                    src: 'Shared/*',
                    dest: 'build/Firefox/content'
                  },
                ]
            },
            safari: {
                files: [
                  { 
                    expand: true,
                    flatten: true,
                    src: 'template/Safari/*',
                    dest: '<%= options.safari.build %>'
                  },
                  { 
                    expand: true,
                    flatten: true,
                    src: 'template/Shared/*',
                    dest: '<%= options.safari.build %>'
                  },
                ]
            }
        },

        coffee: {
            options: {
                bare: true
            },
            firefox: {
                files: {
                    '<%= options.firefox.build %>/firefox.js': 'src/firefox.coffee',
                    '<%= options.firefox.build %>/global.js': 'src/global.coffee',
                    '<%= options.firefox.build %>/injected.js': ['build/VERSION',
                                                                 'src/injected.coffee']
                }
            },
            chrome: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src',
                        src: ['global-chrome.coffee', 'devtools.coffee',
                              'devtools-chrome.coffee'],
                        dest: '<%= options.chrome.build %>',
                        ext: '.js'
                    }, {
                        src: ['build/VERSION', 'src/injected.coffee',
                              'src/injected-chrome.coffee'],
                        dest: '<%= options.chrome.build %>/injected.js'
                    }
                ]
            },
            safari: {
                files: {
                    '<%= options.safari.build %>/global-safari.js': 'src/global-safari.coffee',
                    '<%= options.safari.build %>/injected.js': ['build/VERSION',
                                                                'src/injected.coffee',
                                                                'src/injected-safari.coffee']
                }
            }
        },

        browserify: {
            options: {
                transform: ['coffeeify']
            },
            firefox: {
                src: 'src/global.coffee',
                dest: '<%= options.firefox.build %>/global.js'
            },
            chrome: {
                src: 'src/global.coffee',
                dest: '<%= options.chrome.build %>/global.js'
            },
            safari: {
                src: 'src/global.coffee',
                dest: '<%= options.safari.build %>/global.js'
            }
        },

        compress: {
            firefox: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.xpi',
                    mode: 'zip'
                },
                expand: true,
                cwd: 'build/Firefox/',
                src: '**',
                dest: '.'
            },
            chrome: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip',
                    mode: 'zip'
                },
                expand: true,
                cwd: 'build/Chrome/',
                src: '**',
                dest: '.'
            }
        },

        crx: {
            chrome: {
                src: '<%= options.chrome.build %>',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.crx',
                privateKey: '<%= options.chrome.key %>'
            }
        },

        clean: {
            build: 'build',
            all: ['<%= clean.build %>', 'dist']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('packageChrome', 'Either package as crx or zip', function() {
        if (grunt.file.exists('<%= options.chrome.key %>')) {
            grunt.task.run('crx:chrome');
        } else {
            grunt.task.run('compress:chrome');
        }
    });

    grunt.registerTask('firefox', ['clean:build', 'copy:common',
                                   'copy:firefox', 'coffee:firefox',
                                   'compress:firefox']);
    grunt.registerTask('chrome', ['clean:build', 'copy:common', 'copy:chrome',
                                  'coffee:chrome', 'browserify:chrome', 'packageChrome']);
    grunt.registerTask('default', ['clean:build', 'copy', 'coffee', 'browserify', 
                                   'compress', 'packageChrome']);
};