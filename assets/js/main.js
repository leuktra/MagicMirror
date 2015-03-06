;( function ( window ) {

	// Magic mirror
	function MagicMirror() {
		this.configMirror();
		this.init();
	}

	MagicMirror.prototype = {

		// Helpers
		updateWithText: function ( text, speed ) {

			var self = this;
			var innerHtml = text;
			var classname = 'fade-out';

			if ( this.innerHTML !== text ) {

				classie.add( this, classname );
				setTimeout( function () {
					classie.remove( this, classname );
				}, speed );
			}
		},
		// Config and such
		configMirror: function () {

			var self = this;

			// Object width config
			this.config = {};
			// Language setup
			// you can just change it to ex. 'en'
			this.config.lang = window.navigator.language;
			// Weather params for 
			// openweathermaps.org API
			this.config.weatherParams = {
				q: 'Katowice,Polska',
				units: 'metric',
				lang: self.lang
			};
			// Array of rss feeds to show
			this.config.feeds = [

			];
			// Object with welcome messages
			this.config.messages = {};
			// Morning welcome messages
			this.config.messages.morning = [
				'Dzień dobry, przystojniaku!',
				'Miłego dnia!',
				'Niewyspany? Napij się kawy...',
				'Jak się spało?',
				'Dzień dobry, kocham Cię!'
			];
			// Afternoon welcome messages
			this.config.messages.afternoon = [
				'Nieźle wyglądasz!',
				'Czemu nie ma cię w pracy?',
				'Do roboty leniu!',
				'Cześć, piękny!'
			];
			// Evening welcome messages
			this.config.messages.evening = [
				'Jak w pracy?',
				'Założyłbyś dres!',
				'Może szklaneczka whisky?',
				'Czas odpocząć, nie sądzisz?'
			];
			// Night welcome messages
			this.config.messages.night = [
				'Czemu jeszcze nie śpisz?',
				'Dobranoc!',
				'Rano będzie źle...'
			];
			// Timeouts for updating stuff
			this.config.timeouts = {};
			// Calendar update timeout
			this.config.timeouts.calendarParse = 2000;
			this.config.timeouts.calendarUpdate = 2000;
			this.config.timeouts.revision = 2000;

			console.log( this.config );
		},
		init: function () {

			this.updateRevisionHandler();
			this.momentLocalization();
			this.calendarParseHandler();
		},
		updateRevisionHandler: function () {

			console.log( 'update revision handler fn' );

			var self = this;
			var method = 'GET';
			var url = 'git_version.php';

			this.checkRevision = function () {

				console.log( 'check revision fn' );

				var request = new XMLHttpRequest();
				request.onreadystatechange = function () {

					if ( request.readyState === 4 && request.status === 200 ) {
						console.log( request.responseText );
					}
				};
				request.open( method, url, true );
				request.send();
			};

			setTimeout( function () {
				self.checkRevision();
			}, self.config.timeouts.revision );
		},
		momentLocalization: function () {

		},
		calendarParseHandler: function () {

			// Keep context
			var self = this;

			this.calendar = {};
			this.calendar.eventList = [];
			// Parsing calendar function
			self.parseCalendar = function ( cal ) {

				self.calendar.events = cal.getEvents();

				// Iterate through found events
				for ( var i in self.calendar.events ) {

					// Single event
					var calendarEvent = self.calendar.events[ i ];
					// console.log( calendarEvent );

					// Iterate through event properties
					// as key->value pairs
					for ( var key in calendarEvent ) {

						// If key has value - assign it to variable
						var value = calendarEvent[ key ];

						// Search for ';' in key - it is a separator
						// for 'date start' and 'date end' related keys
						var timestampSeparator = key.search( ';' );
						// If found, 
						if ( timestampSeparator >= 0 ) {
							var mainKey = key.substring( 0, timestampSeparator );
							var subKey = key.substring( timestampSeparator + 1 );
							var eventDate;

							// There might be other keys with ';' in name so
							// we need to check that we have those we need
							if ( mainKey === 'DTSTART' || mainKey === 'DTEND') {

								// Apple iCal lets you to set up "all day"
								// event and then its date has format like this:
								// 'DTSTART;VALUE=DATE', so we check if the part
								// after separator has that format
								if ( subKey === 'VALUE=DATE' ) {

									// If it is an 'all day' event, we get date;
									// Chars 1-4 	-> year,
									// Chars 5-6 	-> month
									// Chars 7-8 	-> day
									eventDate = new Date( value.substring( 0, 4 ), value.substring( 4, 6 ), value.substring( 6, 8 ) );
								}
								else {
									// If not, we get time of the event;
									// Chars 1-4 	-> year,
									// Chars 5-6 	-> month
									// Chars 7-8 	-> day,
									// Chars 9-10 	-> hours
									// Chars 11-12 	-> minutes
									// Chars 13-14 	-> seconds
									eventDate = new Date( value.substring( 0, 4 ), value.substring( 4, 6 ), value.substring( 6, 8 ), value.substring( 9, 11 ), value.substring( 11, 13 ), value.substring( 13, 15 ) );
								}

								// Check which key we interate on
								// and set proper date property
								if ( mainKey === 'DTSTART' ) {
									calendarEvent.dateStart = eventDate;
								}
								if ( mainKey === 'DTEND' ) {
									calendarEvent.dateEnd = eventDate;
								}
							}
						}
					}

					// Get only future events!
					// We check if the date is in future
					// or in the past with moment.js
					var normalEvent = {};

					// Fix for some older Gmail events
					if ( typeof calendarEvent.dateStart === 'undefined' ) {

						normalEvent.days = moment( calendarEvent.DTSTART ).diff( moment(), 'days' );
						normalEvent.seconds = moment( calendarEvent.DTSTART ).diff( moment(), 'seconds' );
						normalEvent.startDate = moment( calendarEvent.DTSTART );
					}
					else {

						normalEvent.days = moment( calendarEvent.dateStart ).diff( moment(), 'days' );
						normalEvent.seconds = moment( calendarEvent.dateStart ).diff( moment(), 'seconds' );
						normalEvent.startDate = moment( calendarEvent.dateStart );
					}

					// If seconds are higher than zero
					// it means that event is in the future
					// Unfoftunately it does not work with days
					if ( normalEvent.seconds >= 0 ) {

						console.log( normalEvent.seconds );
						// If it's less than 5 hours and higher
						// than 2 days we show time left
						if ( normalEvent.seconds <= 60 * 60 * 5 || normalEvent.seconds >= 60 * 60 * 24 * 2 ) {
							calendarEvent.timeString = moment( normalEvent.startDate ).fromNow();
						}
						// Else we show just normal day name widh hour
						else {
							calendarEvent.timeString = moment( normalEvent.startDate ).calendar();
						}

						if ( !calendarEvent.RRULE ) {

							var normalEventToPush = {
								'description': calendarEvent.SUMMARY,
								'seconds': normalEvent.seconds,
								'days': calendarEvent.timeString
							};
							self.calendar.eventList.push( normalEventToPush );
						}
					}

					// Special handling for rrule events
					// Pretty much the same
					if ( calendarEvent.RRULE ) {

						// Get rule as object
						var options = new RRule.parseString( calendarEvent.RRULE );
						// Set rule start date
						options.dtstart = calendarEvent.dateStart;
						// Create new rule with options
						var rule = new RRule( options );

						console.log( rule );

						var dates = rule.between( new Date(), new Date( 2016, 11, 31 ), true, function ( date, idx ) {
							return i < 10;
						});

						console.log( dates );

						for ( var date in dates ) {

							var rruleEvent = {};
							rruleEvent.date = new Date( dates[ date ] );
							rruleEvent.days = moment( rruleEvent.date ).diff( moment(), 'days' );
							rruleEvent.seconds = moment( rruleEvent.date ).diff( moment(), 'seconds' );
							rruleEvent.dateStart = moment( rruleEvent.date );

							if ( rruleEvent.seconds >= 0 ) {

								if ( rruleEvent.seconds <= 60 * 60 * 5 || rruleEvent.seconds >= 60 * 60 * 24 * 2 ) {
									calendarEvent.timeString = moment( rruleEvent.date ).fromNow();
								}
								else {
									calendarEvent.timeString = moment( rruleEvent.date ).calendar();
								}
								var rruleEventToPush = {
								'description': calendarEvent.SUMMARY,
								'seconds': rruleEvent.seconds,
								'days': calendarEvent.timeString
							};
								self.calendar.eventList.push( rruleEventToPush );
							}
						}
					}
				}

				// Sorting chronologicaly
				self.calendar.eventList.sort( function ( a, b ) {
					return a.seconds - b.seconds;
				});
				console.log( self.calendar.eventList );
			};

			// Actually parsing calendar with that
			// weird function above
			new ical_parser( 'calendar.php', self.parseCalendar );

			// Fire calendar update animation
			this.calendarUpdateHandler();

			// Update calendar info all the time
			setTimeout( function () {
				// self.calendarParseHandler();
			}, self.config.timeouts.calendarParse );
		},
		calendarUpdateHandler: function () {

			var self = this;

			this.calendar.table = document.getElementById( 'calendar-table' );

			for ( var i in self.calendar.eventList ) {
				console.log( self.calendar.eventList );
			}

			setTimeout( function () {
				// self.calendarUpdateHandler();
			}, self.config.timeouts.calendarUpdate );
		},
		complimentsUpdateHandler: function () {

		}
	};

	window.MagicMirror = new MagicMirror();

})( window );