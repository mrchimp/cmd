module.exports = function(grunt) {

  var js_files = [
    'bower_components/typewriter/jquery.typer.js',
    'src/js/Polyfills.js',
    'src/js/CmdStack.js',
    'src/js/Cmd.js',
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: js_files,
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
        files: js_files,
        tasks: [
          'concat:dist',
          'uglify'
        ],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-focus');

  grunt.registerTask('default', [
    'concat',
    'uglify',
    'less:dist'
  ]);

  grunt.registerTask('watch-all', [
    'focus:all'
  ]);
};
