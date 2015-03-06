module.exports = function ( grunt ) {

	grunt.initConfig({

		less: {
			development: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					"assets/css/style.min.css": "assets/less/style.less"
				}
			}
		},
		autoprefixer: {
			no_dest: {
				src: 'assets/css/style.min.css'
			}
		},
		watch: {
			styles: {
				files: [ 'assets/less/**/*.less' ],
				tasks: [ 'less', 'autoprefixer' ],
				options: {
					nospawn: true
				}
			},
			javascript: {
				files: [ 'assets/js/**/*.js', '!assets/js/**/*.min.js' ],
				tasks: [ 'jshint', 'uglify' ],
				options: {
					nospawn: true
				}
			}
		},
		jshint: {
			files: {
				src: [ 'assets/js/main.js' ]
			},
			options: {
				curly: true,
			    eqeqeq: true,
			    eqnull: true,
			    browser: true
			}
		},
		uglify: {
			target: {
				files: {
					'assets/js/main.min.js': 'assets/js/main.js'
				}
			},
			options: {
				mangle: true
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						flatten: true,
						src: [
							
						],
						dest: 'assets/css/'
					},
					{
						expand: true,
						flatten: true,
						src: [
							'vendor/classie/classie.js',
							'vendor/momentjs/moment.js',
							'vendor/JavaScript-Ical-Parser/ical_parser.js',
							'vendor/rrule/lib/rrule.js'
						],
						dest: 'assets/js/'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-less' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-autoprefixer' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	grunt.registerTask( 'default', [ 'copy', 'less', 'autoprefixer', 'jshint', 'uglify', 'watch' ] );
	grunt.registerTask( 'build', [ 'copy', 'jshint', 'uglify' ] );
}