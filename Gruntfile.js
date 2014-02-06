module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    mochaTest : {
      test: {
        options: {
          reporter: 'nyan',
          clearRequireCache: true
        },
        src: ['test/**/*.js']
      },
    },
    jshint: {
      all: ['Gruntfile.js', './*.js', 'test/**/*.js', 'lib/**/*.js', 'routes/**/*.js']
    },
    watch: {
       js: {
         options: {
           spawn: false,
         },
         files: '**/*.js',
         tasks: ['default']
       }
     }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'mochaTest']);

};