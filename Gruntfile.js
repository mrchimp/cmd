module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: [
          'src/js/Polyfills.js',
          'src/js/CmdStack.js',
          'src/js/Cmd.js',
        ],
        dest: 'dist/js/cmd.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: false
      },
      dist: {
        files: {
          'dist/js/cmd.min.js': ['dist/js/cmd.js']
        }
      }
    },
    less: {
      dist: {
        options: {
          paths: [
            'src/less'
          ],
          cleancss: true
        },
        files: {
          'dist/css/cmd.min.css': 'src/less/main.less'
        }
      }
    },
    focus: {
      all: {}
    },
    watch: {
      less: {
        files: ['src/less/**/*.less'],
        tasks: [
          'less:dist'
        ],
        options: {
          nospawn: true
        }
      },
      dist: {
         //All files that exist within src/ and end in .js
       files: ['src/**/*.js'],
        tasks: [
          'concat:dist',
          'uglify'
        ],
        options: {
          nospawn: true
        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, filter: 'isFile', src: ['dependencies/jquery/dist/**'], dest: 'dist/external/jquery/'},
          {expand: true, flatten: true, filter: 'isFile', src: ['dependencies/jquery.typer/jquery.typer.js'], dest: 'dist/external/'},
          {expand: true, src: ['example.html', 'commands.json', 'tabcomplete.json'], dest: 'dist/',
            rename: function(dest, src) {
              return dest + src.replace('example.html','index.html');
            }
          }
        ]
      }
    }
  });

  // Load grunt tasks from NPM packages
  require( "load-grunt-tasks" )( grunt );

  grunt.registerTask('default', [
    'concat',
    'uglify',
    'less:dist',
    'copy'
  ]);

  grunt.registerTask('watch-all', [
    'focus:all'
  ]);
};
