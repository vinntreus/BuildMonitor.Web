module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    mochaTest : {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true
        },
        src: ['test/**/*.js']
      },
    },
    jshint: {
        all: ['Gruntfile.js', './*.js', 'test/**/*.js', 'lib/**/*.js', 'routes/**/*.js']
      }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'mochaTest']);

};