module.exports = function(grunt) {

  var js_files = [
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
      light_dist: {
        options: {
          paths: [
            'src/less'
          ],
          cleancss: true
        },
        files: {
          'dist/cmd_light.min.css': 'src/less/main_light.less'
        }
      },
      dark_dist: {
        options: {
          paths: [
            'src/less'
          ],
          cleancss: true
        },
        files: {
          'dist/cmd_dark.min.css': 'src/less/main_dark.less'
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
          'less:light_dist',
          'less:dark_dist'
        ],
        options: {
          nospawn: true
        }
      },
      dist: {
        files: js_files,
        tasks: [
          'concat:dist'
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
    'less:light_dist',
    'less:dark_dist'
  ]);

  grunt.registerTask('watch-all', [
    'focus:all'
  ]);
};