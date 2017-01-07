module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks 
  grunt.initConfig({
      babel: {
          options: {
              sourceMap: true,
              presets: ['babel-preset-react']
          },
          dist: {
              files: {
                  'five-in-line/dist/app.js': 'five-in-line/js/app.jsx'
              },
              // files: [
              //   {
              //     expand: true,
              //     cwd: 'public/js',
              //     src: [ '**/*.jsx' ],
              //     dest: 'public/js',
              //     ext: '.js'
              //   }
              // ]
          }
      }
  });
   
  grunt.registerTask('default', ['babel']);
}