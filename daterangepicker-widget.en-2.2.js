/**
 * --------------------------------------------------------------------
 * "daterangepicker-widget.en.js"
 * DEPENCIES: 
 *		jQuery 1.7+
 *		jQuery UI 1.8+
 *		date.js
 * CHANGES:
 *  19.5.2011 Whole code refactored to widget (JS)
 *  30.5.2011 Fixed bunch of bugs
 *  27.4.2012 bugfixes & refactoring for timepicker
 *  6.7.2012  Fixed timestepping bugs & code cleaned
 *  10.9.2012 Changed field formating to support from/to timestamps
 * --------------------------------------------------------------------
 */
( function( $ ) {
	$.widget( "ui.daterangepicker", {
		version: "1.3",
		options: {
			presetRanges: [
				{ text: "Last 24 hours", dateStart: "Today-1", dateEnd: "Today-1" },
				{ text: "Last 7 days", dateStart: "Today-7", dateEnd: "Today-1" },
				{ text: "Last month", dateStart: "-1 month", dateEnd: "Today-1" },
				{ text: "Full period", dateStart: "-1 year", dateEnd: "Today-1" }
			],
			presets: {
				specificDate: "Specific Time",
				dateRange: "Date Range"
			},
			earliestDate: Date.parse( '2010-06-01' ),
			latestDate: Date.parse( 'Today-1' ),
			startTime: null,
			EndTime: null,
			rangeSplitter: '-',
			dateFormat: 'yy-mm-dd',
			arrows: true,
			appendTo: 'body',
			open: null,
			close: null,
			change: null,
			datepickerOptions: null,
			debug: false
		},
		_create: function() {
			var daterangepickerId = 'ui-daterangepicker-' + Math.random().toString( 16 ).slice( 2, 10 );
			this.ids = { 
				id: daterangepickerId,
				wrapper: daterangepickerId + '-wrapper',
				prevButton: daterangepickerId + '-prev-button',
				nextButton: daterangepickerId + '-next-button',
				doneButton: daterangepickerId + '-done-button',
				ranges: daterangepickerId + '-ranges',
				presets: daterangepickerId + '-presets',
				container: daterangepickerId + '-container'
			};
			this._buildInput();
			this._drawPickers();
			this._addHovers();
			this._addClicks();
			var self = this;
			var timepick;
			var rp = this.drpWrapper;
			var startInput = this.element;
			var endInput = this.toInput;
			var datepickerOptions = {
				onSelect: function() {
					var rangeStart = Date.parse( self._fDate( rp.find( '.range-start' ).datepicker( 'getDate' ) ) );
					var	rangeEnd = Date.parse( self._fDate( rp.find( '.range-end' ).datepicker( 'getDate' ) ) );
					if( rangeStart.isAfter( rangeEnd ) ) {
						var temp = rangeStart;
						rangeStart = rangeEnd;
						rangeEnd = temp;
						self._debug("[datepicker.onSelect() switch times] startTime " + rangeStart.toString("yyyy-MM-dd HH:mm") + " endTime " + rangeEnd.toString("yyyy-MM-dd HH:mm") );
					}
					if( rp.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
						rangeEnd.set( { hour: parseInt( rp.find( 'select[name=endhour]' ).val(), 10 ), minute: parseInt( rp.find( 'select[name=endmin]' ).val(), 10 ) } );
						rangeStart.set( { hour: parseInt( rp.find( 'select[name=starthour]' ).val(), 10 ), minute: parseInt( rp.find( 'select[name=startmin]' ).val(), 10 ) } );
					} else {
						rangeStart.set( { hour: 0, minute: 0 } );
						rangeEnd.set( { hour: 23, minute: 50 } );
					}
					if( rangeStart.isAfter( rangeEnd ) ) {
						var tempt = rangeStart;
						rangeStart = rangeEnd;
						rangeEnd = tempt;
						self._debug("[datepicker.onSelect() switch times 2] startTime " + rangeStart.toString("yyyy-MM-dd HH:mm") + " endTime " + rangeEnd.toString("yyyy-MM-dd HH:mm") );
					}
					rp.find( '.range-start' ).data( 'tsStart', rangeStart );
					rp.find( '.range-end' ).data( 'tsEnd', rangeEnd );
					startInput.val( rangeStart.toString( "yyyy-MM-dd HH:mm" ) );
					endInput.val( rangeEnd.toString( "yyyy-MM-dd HH:mm" ) );
					self._debug("[datepicker.onSelect()] startTime " + rangeStart.toString("yyyy-MM-dd HH:mm") + " endTime " + rangeEnd.toString("yyyy-MM-dd HH:mm") );
				},
				hideIfNoPrevNext: true,
				firstDay: 1,
				dateFormat: self.options.dateFormat,
				minDate: self.options.earliestDate,
				maxDate: self.options.latestDate
			};
			this.options.datepickerOptions = datepickerOptions;
			var temppi = (typeof this.options.latestDate == 'string') ? Date.parse(this.options.latestDate) : this.options.latestDate;
			var inputDateA = (typeof this.options.startTime == 'string') ? Date.parse(this.options.startTime) : this.options.startTime;
			var inputDateB = (typeof this.options.endTime == 'string') ? Date.parse(this.options.endTime) : this.options.endTime;
			inputDateA.set( { hour: 0, minute: 0 } );
			inputDateB.set( { hour: 23, minute: 50 } );
			this.drpWrapper.find( '.range-start, .range-end' ).datepicker( this.options.datepickerOptions );
			this.drpWrapper.find( '.range-start' ).datepicker( 'setDate', inputDateA );
			this.drpWrapper.find( '.range-end' ).datepicker( 'setDate', inputDateB );
			this.drpWrapper.find( '.ui-datepicker-current-day' ).trigger( 'click' );
			this.drpWrapper.find( '.range-start' ).data( 'tsStart', inputDateA );
			this.drpWrapper.find( '.range-end' ).data( 'tsEnd', inputDateB );
			this.drpWrapper.hide().find( '.range-start, .range-end, .btnDone' ).hide();
			this.drpRanges.find( '.ui-datepicker' ).css( "display", "block" );
			this.drpWrapper.find('select[name=starthour]').val(inputDateA.getHours());
			this.drpWrapper.find('select[name=startmin]').val(inputDateA.getMinutes());
			this.drpWrapper.find('select[name=endhour]').val(inputDateB.getHours());
			this.drpWrapper.find('select[name=endmin]').val(inputDateB.getMinutes());
			return this;
		},
		_fDate: function( date ){
			if( typeof date == 'string' ) {
				date = Date.parseExact( date, "yyyy-MM-dd" );
			}	
			if( !date.getDate() ) { return ""; }
			var day = date.getDate();
			var month = date.getMonth();
			var year = date.getFullYear();
			month++;
			var dateFormat = this.options.dateFormat;
			return $.datepicker.formatDate( dateFormat, date );
		},
		_buildInput: function() {
			this.drpInput = $( '<div />', {
				'class': 'ui-daterangepicker-arrows ui-widget ui-widget-header ui-helper-clearfix ui-corner-all',
				id: this.ids.id
			});
			this.prevButton = $( '<a />', {
				'class': 'ui-daterangepicker-prev ui-corner-all',
				href: '#nogo',
				id: this.ids.prevButton,
				'title': 'Previous'
			});
			this.nextButton = $( '<a />', {
				'class': 'ui-daterangepicker-next ui-corner-all',
				href: '#nogo',
				id: this.ids.nextButton,
				'title': 'Next'
			});
			this.prevButtonIcon = $( '<span />', {
				'class': 'ui-icon ui-icon-circle-triangle-w'
			});
			this.nextButtonIcon = $( '<span />', {
				'class': 'ui-icon ui-icon-circle-triangle-e'
			});
			this.toInput = $('<input />', {
				'class': 'ui-rangepicker-times ui-widget-content',
				id: this.ids.id + '-times',
				'type': 'text',
				'readonly': 'readonly'
			});
			$( this.element ).addClass( 'ui-rangepicker-input ui-widget-content' );
			this.element.attr( 'readonly', 'readonly' );
			this.element.wrap( this.drpInput );
			var prev = this.prevButton.prepend( this.prevButtonIcon );
			var next = this.nextButton.prepend( this.nextButtonIcon );
			$( this.element ).after( this.toInput ).before( prev ).before( next );
		},
		_drawPickers: function() {
			var self = this;
			this.drpContainer = $( '<div />', {
				'class': 'ui-daterangepickercontain daterangepickercontain-' + this.ids.id,
				id: this.ids.container
			});
			this.drpWrapper = $( '<div />', {
				'class': 'ui-daterangepicker ui-widget ui-helper-clearfix ui-widget-content ui-corner-all',
				id: this.ids.wrapper
			});
			this.drpRanges = $( '<div />', {
				'class': 'ranges ui-widget-header ui-corner-all ui-helper-clearfix',
				id: this.ids.ranges
			}).css( 'display', 'none' );
			this.rangestart = $( '<div />', {
				'class': 'range-start',
				id: 'range-start-' + this.ids.id
			}).prepend( $( '<span />', {
				'class': 'title-start',
				id: 'title-start-' + this.ids.id,
				text: 'Range Start'
			}));
			this.rangeend = $( '<div />', {
				'class': 'range-end',
				id: 'range-end-' + this.ids.id
			}).prepend( $( '<span />', {
				'class': 'title-end',
				id: 'title-end-' + this.ids.id,
				text: 'Range End'
			}));
			this.timepick = $( '<div />', {
				'class': 'time-picker',
				id: 'time-picker-' + this.ids.id
			}).prepend( $( '<span />', {
				'class': 'title-times',
				id: 'time-picker-title-' + this.ids.id,
				text: 'Time Picker'
			})).append( $( '<div />', {
				'class': 'picker-wrap ui-widget-content ui-corner-all ui-helper-clearfix',
				id: 'picker-wrap-' + this.ids.id
			}));
			this.doneButton = $( '<button />', {
				'class': 'btnDone ui-state-default ui-corner-all',
				text: 'Done',
				id: this.ids.doneButton
			});
			this.drpPresets = $( '<ul />', {
				'class': 'ui-widget-content',
				id: this.ids.presets
			});
			this.timepick.find( '.picker-wrap' )
			.append( $( '<span />', {
				'class': 'title-times ui-widget-header ui-corner-all',
				text: 'Starting time'
			})).append( $( '<select />', {
				id: 'hour-start-' + this.ids.id,
				'class': 'start-hour time-picker-input',
				'name': 'starthour'
			}).change( function() {
				var sh = self.drpRanges.find('select[name=starthour]').val();
				var sm = self.drpRanges.find('select[name=startmin]').val();
				var eh = self.drpRanges.find('select[name=endhour]').val();
				var em = self.drpRanges.find('select[name=endmin]').val();
				var sd = self.element.val().split(" ", 10)[0];
				var ed = self.toInput.val().split(" ", 10)[0];
				self.element.val( sd + ' ' + sh + ':' + sm );
				self.toInput.val( ed + ' ' + eh + ':' + em );
			})).append( $( '<select />', {
				id: 'min-start-' + this.ids.id,
				'class': 'start-min time-picker-input',
				'name': 'startmin'
			}).change( function() {
				var sh = self.drpRanges.find('select[name=starthour]').val();
				var sm = self.drpRanges.find('select[name=startmin]').val();
				var eh = self.drpRanges.find('select[name=endhour]').val();
				var em = self.drpRanges.find('select[name=endmin]').val();
				var sd = self.element.val().split(" ", 10)[0];
				var ed = self.toInput.val().split(" ", 10)[0];
				self.element.val( sd + ' ' + sh + ':' + sm );
				self.toInput.val( ed + ' ' + eh + ':' + em );
			})).append( $( '<span />', {
				'class': 'title-times ui-widget-header ui-corner-all',
				text: 'Ending time'
			})).append( $( '<select />', {
				id: 'hour-end-' + this.ids.id,
				'class': 'end-hour time-picker-input',
				'name': 'endhour'
			}).change( function() {
				var sh = self.drpRanges.find('select[name=starthour]').val();
				var sm = self.drpRanges.find('select[name=startmin]').val();
				var eh = self.drpRanges.find('select[name=endhour]').val();
				var em = self.drpRanges.find('select[name=endmin]').val();
				var sd = self.element.val().split(" ", 10)[0];
				var ed = self.toInput.val().split(" ", 10)[0];
				self.element.val( sd + ' ' + sh + ':' + sm );
				self.toInput.val( ed + ' ' + eh + ':' + em );
			})).append( $( '<select />', {
				id: 'min-end-' + this.ids.id,
				'class': 'end-min time-picker-input',
				'name': 'endmin'
			}).change( function() {
				var sh = self.drpRanges.find('select[name=starthour]').val();
				var sm = self.drpRanges.find('select[name=startmin]').val();
				var eh = self.drpRanges.find('select[name=endhour]').val();
				var em = self.drpRanges.find('select[name=endmin]').val();
				var sd = self.element.val().split(" ", 10)[0];
				var ed = self.toInput.val().split(" ", 10)[0];
				self.element.val( sd + ' ' + sh + ':' + sm );
				self.toInput.val( ed + ' ' + eh + ':' + em );
			}));
			for( var i = 0 ; i < 24 ; i++ ) {
				if( i < 10 ) {
					this.timepick.find('.start-hour').append( $('<option />', { value: i, text: '0' + i}));
					this.timepick.find('.end-hour').append( $('<option />', { value: i, text: '0' + i}));
				} else {
					this.timepick.find('.start-hour').append( $('<option />', { value: i, text: i}));
					this.timepick.find('.end-hour').append( $('<option />', { value: i, text: i}));
				}
			}
			for( var j = 0 ; j <= 50 ; j = (j+10) ) {
				if(j == 0) {
					this.timepick.find('.start-min').append( $('<option />', { value: 0, text: '00'}));
					this.timepick.find('.end-min').append( $('<option />', { value: 0, text: '00'}));
				} else {
					this.timepick.find('.start-min').append( $('<option />', { value: j, text: j}));
					this.timepick.find('.end-min').append( $('<option />', { value: j, text: j}));
				}
			}
			this.drpPresets.children().remove();
			var ranges = this.drpRanges.append( this.rangestart ).append( this.rangeend ).append( this.timepick ).append( this.doneButton );
			var wrapper = this.drpWrapper.append( this.drpPresets ).append( ranges );
			$.each( this.options.presetRanges, function() {
				var dStart = ( typeof this.dateStart == 'string' ) ? Date.parse( this.dateStart ) : this.dateStart;
				dStart.set( { hour: 0, minute: 0 } );
				var dEnd = ( typeof this.dateEnd == 'string' ) ? Date.parse( this.dateEnd ) : this.dateEnd;
				dEnd.set( { hour: 23, minute: 50 } );
				var li = $( '<li class="ui-daterangepicker-' + this.text.replace( / /g, '' ) + ' ui-corner-all"><a href="#nogo">' + this.text + '</a></li>' )
				.data( 'dateStart', dStart )
				.data( 'dateEnd', dEnd )
				.appendTo( self.drpPresets );
			});
			var x=0;
			$.each( this.options.presets, function( key, value ) {
				$( '<li class="ui-daterangepicker-' + key + ' preset_' + x + ' ui-helper-clearfix ui-corner-all"><span class="ui-icon ui-icon-triangle-1-e"></span><a href="#nogo">' + value + '</a></li>' )
				.appendTo( self.drpPresets );
				x++;
			});
			this.drpPresets.find( 'li' ).click( function() {
				self.drpPresets.find( '.ui-state-active' ).removeClass( 'ui-state-active' );
				$( this ).addClass( 'ui-state-active' );
				self.clickActions( $( this ), self.drpWrapper, self.drpRanges, self.doneButton, self );
				return false;
			});
			var temp = this.drpContainer.append( wrapper );
			temp.appendTo( this.options.appendTo );
		},
		_addHovers: function () {
			this.prevButton.hover( function() {
				$( this ).toggleClass( 'ui-state-hover' );
			});
			this.nextButton.hover( function() {
				$( this ).toggleClass( 'ui-state-hover' );
			});
			this.doneButton.hover( function() {
				$( this ).toggleClass( 'ui-state-hover' );
			});
			$.each(this.drpPresets.find( 'li' ), function() {
				$( this ).hover( function() {
					$( this ).toggleClass( 'ui-state-hover' );
				});
			});
		},
		_addClicks: function() {
			var self = this;
			$( document ).click( function() { if ( self.isOpen ) { self.close(); } } );
			this.drpWrapper.click( function( event ) {
				event.preventDefault();
				return false;
			});
			this.doneButton.click( function() {
				if( self.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					var rangeStart = Date.parse( self._fDate( self.drpRanges.find( '.range-start' ).datepicker( 'getDate' ) ) );
					var	rangeEnd = Date.parse( self._fDate( self.drpRanges.find( '.range-end' ).datepicker( 'getDate' ) ) );
					if( !Date.equals( rangeStart, rangeEnd ) ) {
						rangeEnd = rangeStart.clone();
						self.drpRanges.find( '.range-end' ).datepicker( 'setDate', rangeEnd );
					}
					rangeStart.set( {hour: parseInt( self.drpRanges.find( 'select[name=starthour]' ).val(), 10 ), minute: parseInt( self.drpRanges.find( 'select[name=startmin]' ).val(), 10 ) } );
					rangeEnd.set( {hour: parseInt( self.drpRanges.find( 'select[name=endhour]' ).val(), 10 ), minute: parseInt( self.drpRanges.find( 'select[name=endmin]' ).val(), 10 ) } );
					if( rangeStart.isAfter( rangeEnd ) ) {
						var tempDate = rangeStart;
						rangeStart = rangeEnd;
						rangeEnd = tempDate;
						self._debug("[doneButton.click() switch times] startTime " + rangeStart.toString("yyyy-MM-dd HH:mm") + " endTime " + rangeEnd.toString("yyyy-MM-dd HH:mm") );
					}
					
					self.drpRanges.find( '.range-start' ).data( 'tsStart', rangeStart );
					self.drpRanges.find( '.range-end' ).data( 'tsEnd', rangeEnd );
					self.element.val( rangeStart.toString( "yyyy-MM-dd HH:mm" ) );
					self.timepick.val( rangeEnd.toString( "yyyy-MM-dd HH:mm" ) );
				}
				
				self._debug("[doneButton.click() trigger click to datepicker]");
				self.drpWrapper.find( '.ui-datepicker-current-day' ).trigger( 'click' );
				self.close();
			});
			this.element.click( function( event ) {
				self._toggle();
				event.preventDefault();
				return false;
			});
			this.toInput.click( function( event ) {
				self._toggle();
				event.preventDefault();
				return false;
			});
			this.prevButton.click( function( event ) {
				var diff;
				var dateA = self.drpRanges.find( '.range-start' ).data( 'tsStart' );
				var dateB = self.drpRanges.find( '.range-end' ).data( 'tsEnd' );
				self._debug("[this.prevButton.click() initTimes] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
				var minDate = Date.parse( self._fDate( self.drpRanges.find( '.range-start' ).datepicker( "option", "minDate" ) ) );
				minDate.set( { hour: 0, minute: 0 } );
				if( dateA.isAfter( dateB ) ) {
					var ha = dateA.getHours();
					var ma = dateA.getMinutes();
					var hb = dateB.getHours();
					var mb = dateB.getMinutes();
					var tempDate = dateA;
					dateA = dateB;
					dateB = tempDate;
					dateA.set( { hour: ha, minute: ma } );
					dateB.set( { hour: hb, minute: mb } );
				}
				if( self.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					dateA.set( {hour: parseInt( self.drpRanges.find('select[name=starthour]').val(), 10 ), minute: parseInt( self.drpRanges.find('select[name=startmin]').val(), 10 ) } );
					dateB.set( {hour: parseInt( self.drpRanges.find('select[name=endhour]').val(), 10 ), minute: parseInt( self.drpRanges.find('select[name=endmin]').val(), 10 ) } );
					self._debug("[this.prevButton.click() specificDate (sethours)] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
					diff = self._calcDiff( dateA, dateB, false );
					diff = -diff;
					dateA = self._moveStartTime( dateA, diff, 'neg' );
					dateB = self._moveEndTime( dateB, diff, 'neg' );
					self._debug("[this.prevButton.click() specificDate (move times)] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
					if( Date.compare( minDate, dateA ) != -1 ) {
						dateA = minDate.clone();
						dateB = dateA.clone();
						dateB.add( { milliseconds: -diff } );
						self.drpRanges.find("select[name=starthour]").val(dateA.getHours());
						self.drpRanges.find("select[name=startmin]").val(dateA.getMinutes());
						self.drpRanges.find("select[name=endhour]").val(dateB.getHours());
						self.drpRanges.find("select[name=endmin]").val(dateB.getMinutes());
					}
				} else {
					dateA.set( { hour: 0, minute: 0 } );
					dateB.set( { hour: 23, minute: 50 } );
					diff = self._calcDiff( dateA, dateB, true );
					diff = -diff;
					dateA = self._moveStartTime( dateA, diff, 'neg' );
					dateB = self._moveEndTime( dateB, diff, 'neg' );
					self.drpRanges.find('select[name=starthour]').val(dateA.getHours());
					self.drpRanges.find('select[name=startmin]').val(dateA.getMinutes());
					self.drpRanges.find('select[name=endhour]').val(dateB.getHours());
					self.drpRanges.find('select[name=endmin]').val(dateB.getMinutes());
				}
				if( Date.compare( minDate , dateA ) != -1 ) {
					var diff2 = self._calcDiff( dateA, dateB, false );
					dateA = minDate.clone();
					dateB = dateA.clone();
					dateB.add( { milliseconds: diff2 } );
					self.drpRanges.find("select[name=starthour]").val(dateA.getHours());
					self.drpRanges.find("select[name=startmin]").val(dateA.getMinutes());
					self.drpRanges.find("select[name=endhour]").val(dateB.getHours());
					self.drpRanges.find("select[name=endmin]").val(dateB.getMinutes());
				}
				self.drpRanges.find( '.range-start' ).datepicker( "setDate", dateA ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				self.drpRanges.find( '.range-end' ).datepicker( "setDate", dateB ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				self.drpRanges.find( '.range-start' ).data( 'tsStart', dateA );
				self.drpRanges.find( '.range-end' ).data( 'tsEnd', dateB );
				self.element.val( dateA.toString( "yyyy-MM-dd HH:mm" ) );
				self.timepick.val( dateB.toString( "yyyy-MM-dd HH:mm" ) );
				self._debug("[this.prevButton.click() exit after write] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
				self.close();
				return false;
			});
			this.nextButton.click( function( event ) {
				var diff;
				var dateA = self.drpRanges.find( '.range-start' ).data( 'tsStart' );
				var dateB = self.drpRanges.find( '.range-end' ).data( 'tsEnd' );
				self._debug("[this.nextButton.click() initTimes] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
				var maxDate = Date.parse( self._fDate( self.drpRanges.find( '.range-start' ).datepicker( "option", "maxDate" ) ) );
				maxDate.set( { hour: 23, minute: 50 } );
				if( dateA.isAfter( dateB ) ) {
					var ha = dateA.getHours();
					var ma = dateA.getMinutes();
					var hb = dateB.getHours();
					var mb = dateB.getMinutes();
					var tempDate = dateA;
					dateA = dateB;
					dateB = tempDate;
					dateA.set( { hour: ha, minute: ma } );
					dateB.set( { hour: hb, minute: mb } );
				}
				if( self.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					dateA.set( {hour: parseInt( self.drpRanges.find('select[name=starthour]').val(), 10 ), minute: parseInt( self.drpRanges.find('select[name=startmin]').val(), 10 ) } );
					dateB.set( {hour: parseInt( self.drpRanges.find('select[name=endhour]').val(), 10 ), minute: parseInt( self.drpRanges.find('select[name=endmin]').val(), 10 ) } );
					self._debug("[this.nextButton.click() specificDate (sethours)] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
					diff = self._calcDiff( dateA, dateB, false );
					dateA = self._moveStartTime( dateA, diff, 'pos' );
					dateB = self._moveEndTime( dateB, diff, 'pos' );
					self._debug("[this.nextButton.click() specificDate (move times)] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
					if(Date.compare(maxDate,dateB) != 1){
						dateB = maxDate.clone();
						dateA = dateB.clone();
						dateA.add( { milliseconds: -diff } );
						self.drpRanges.find("select[name=starthour]").val(dateA.getHours());
						self.drpRanges.find("select[name=startmin]").val(dateA.getMinutes());
						self.drpRanges.find("select[name=endhour]").val(dateB.getHours());
						self.drpRanges.find("select[name=endmin]").val(dateB.getMinutes());
					}
				} else {
					dateA.set( { hour: 0, minute: 0 } );
					dateB.set( { hour: 23, minute: 50 } );
					self.drpRanges.find('select[name=starthour]').val(dateA.getHours());
					self.drpRanges.find('select[name=startmin]').val(dateA.getMinutes());
					self.drpRanges.find('select[name=endhour]').val(dateB.getHours());
					self.drpRanges.find('select[name=endmin]').val(dateB.getMinutes());
					diff = self._calcDiff( dateA, dateB, true );
					dateA = self._moveStartTime( dateA, diff, 'pos' );
					dateB = self._moveEndTime( dateB, diff, 'pos' );
				}
				if(Date.compare(maxDate,dateB) != 1){
					var diff2 = self._calcDiff( dateA, dateB, false );
					dateB = maxDate.clone();
					dateA = dateB.clone();
					dateA.add( { milliseconds: -diff2 } );
					self.drpRanges.find("select[name=starthour]").val(dateA.getHours());
					self.drpRanges.find("select[name=startmin]").val(dateA.getMinutes());
					self.drpRanges.find("select[name=endhour]").val(dateB.getHours());
					self.drpRanges.find("select[name=endmin]").val(dateB.getMinutes());
				}
				self.drpRanges.find( '.range-start' ).datepicker( "setDate", dateA ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				self.drpRanges.find( '.range-end' ).datepicker( "setDate", dateB ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				self.drpRanges.find( '.range-start' ).data( 'tsStart', dateA );
				self.drpRanges.find( '.range-end' ).data( 'tsEnd', dateB );
				self.element.val( dateA.toString( "yyyy-MM-dd HH:mm" ) );
				self.timepick.val( dateB.toString( "yyyy-MM-dd HH:mm" ) );
				self._debug("[this.nextButton.click() exit after write] startTime " + dateA.toString("yyyy-MM-dd HH:mm") + " endTime " + dateB.toString("yyyy-MM-dd HH:mm") );
				self.close();
				return false;
			});
		},
		clickActions: function( ele, rp, rpPickers, doneBtn, that ) {
			if( ele.is( '.ui-daterangepicker-specificDate' ) ) {
				doneBtn.hide();
				rpPickers.show();
				rp.find( '.title-start' ).text( 'Specific Time' );
				$( '.range-start' ).css( 'opacity', 1 ).show( 400 );
				$( '.time-picker' ).css( 'opacity', 1 ).show( 400 );
				$( '.range-end' ).css( 'opacity', 0 ).hide( 400 );
				setTimeout( function() { doneBtn.fadeIn(); }, 400 );
			} else if( ele.is( '.ui-daterangepicker-dateRange' ) ) {
				doneBtn.hide();
				rpPickers.show();
				rp.find( '.title-start' ).text( 'Range start' );
				rp.find( '.title-end' ).text( 'Range End' );
				$( '.range-start' ).css( 'opacity', 1 ).show( 400 );
				$( '.range-end' ).css( 'opacity', 1 ).show( 400 );
				$( '.time-picker' ).css( 'opacity', 0 ).hide( 400 );
				setTimeout( function() { doneBtn.fadeIn(); }, 400 );
				// set time
				rp.find('select[name=starthour]').val(0);
				rp.find('select[name=startmin]').val(0);
				rp.find('select[name=endhour]').val(23);
				rp.find('select[name=endmin]').val(50);
			} else {
				doneBtn.hide();
				rp.find( '.range-start, .range-end, .time-picker' ).css( 'opacity', 0 ).hide( 400, function() {
					rpPickers.hide();
				});
				var dateStart = ( typeof ele.data( 'dateStart' ) == 'string' ) ? Date.parse( ele.data( 'dateStart' ) ) : ele.data( 'dateStart' );
				var dateEnd = ( typeof ele.data( 'dateEnd' ) == 'string' ) ? Date.parse( ele.data( 'dateEnd' ) ) : ele.data( 'dateEnd' );
				this._debug("[clickActions()] startTime " + dateStart.toString("yyyy-MM-dd HH:mm") );
				this._debug("[clickActions()] endTime " + dateEnd.toString("yyyy-MM-dd HH:mm") );
				rp.find( '.range-start' ).data( 'tsStart', dateStart );
				rp.find( '.range-end' ).data( 'tsEnd', dateEnd );
				rp.find( '.range-start' ).datepicker( 'setDate', dateStart ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				rp.find( '.range-end' ).datepicker( 'setDate', dateEnd ).find( '.ui-datepicker-current-day' ).trigger( 'click' );
				// set time
				rp.find('select[name=starthour]').val(0);
				rp.find('select[name=startmin]').val(0);
				rp.find('select[name=endhour]').val(23);
				rp.find('select[name=endmin]').val(50);
				that.close();
			}
			return false;
		},
		_calcDiff: function( start, end, addDay ) {
			var diff = 0;
			if(addDay == true) {
				diff = Math.abs( new TimeSpan( start - end ).getTotalMilliseconds() );
				diff = diff + 600000;
			} else {
				diff = Math.abs( new TimeSpan( start - end ).getTotalMilliseconds() );
			}
			return diff;
		},
		_moveStartTime: function( startDate, difference, dir ) {
			if(difference == 0 ) {
				if(dir == 'pos') {
					startDate.add( { milliseconds: 600000 } );
				} else {
					startDate.add( { milliseconds: -600000 } );
				}
				if( this.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					this.drpRanges.find("select[name=starthour]").val(startDate.getHours());
					this.drpRanges.find("select[name=startmin]").val(startDate.getMinutes());
					this._debug("[_moveStartTime() 1] startTime changed to " + startDate.toString("yyyy-MM-dd HH:mm") );
				}
			} else {
				startDate.add( { milliseconds: difference } );
				if( this.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					this.drpRanges.find("select[name=starthour]").val(startDate.getHours());
					this.drpRanges.find("select[name=startmin]").val(startDate.getMinutes());
					this._debug("[_moveStartTime() 2] startTime changed to " + startDate.toString("yyyy-MM-dd HH:mm") );
				}
			}
			return startDate;
		},
		_moveEndTime: function( endDate, difference, dir ) {
			if(difference == 0) {
				if(dir == 'pos') {
					endDate.add( { milliseconds: 600000 } );
				} else {
					endDate.add( { milliseconds: -600000 } );
				}
				if( this.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					this.drpRanges.find("select[name=endhour]").val(endDate.getHours());
					this.drpRanges.find("select[name=endmin]").val(endDate.getMinutes());
					this._debug("[_moveEndTime() 1] endTime changed to " + endDate.toString("yyyy-MM-dd HH:mm") );
				}
			} else {
				endDate.add( { milliseconds: difference } );
				if( this.drpWrapper.find( '.ui-daterangepicker-specificDate' ).is( '.ui-state-active' ) ) {
					this.drpRanges.find("select[name=endhour]").val(endDate.getHours());
					this.drpRanges.find("select[name=endmin]").val(endDate.getMinutes());
					this._debug("[_moveEndTime() 2] endTime changed to " + endDate.toString("yyyy-MM-dd HH:mm") );
				}
			}
			return endDate;
		},
		_refresh: function() {
			var relEl = $( '.ui-rangepicker-input' ).parent();
			var riOffset = relEl.offset(),
			side = 'left',
			val = riOffset.left,
			offRight = $( window ).width() - val - relEl.outerWidth();
			if( val > offRight ){
				side = 'right';
				val =  offRight;
			}				
			$( '.ui-daterangepickercontain' ).css( side, val ).css( 'top', riOffset.top + relEl.outerHeight() );
		},
		open: function( event ) {
			if ( !this.options.disabled ) {
				this.isOpen = true;
				this.drpWrapper.fadeIn( 300 );
				this._refresh();
				this._trigger( "open", event );
			}
		},
		close: function() {
			if ( this.isOpen ) { this.isOpen = false; }
			this.drpWrapper.fadeOut( 300 );
			
			// debug
			this._debug( "Start:    " + this.drpWrapper.find( '.range-start' ).data( 'tsStart' ).toString("yyyy-MM-dd HH:mm") + "\nEnd:      " + this.drpWrapper.find( '.range-end' ).data( 'tsEnd' ).toString("yyyy-MM-dd HH:mm") );
			var span = new TimeSpan( this.drpWrapper.find( '.range-end' ).data( 'tsEnd' ) - this.drpWrapper.find( '.range-start' ).data( 'tsStart' ) );
			this._debug( "TimeSpan: " + span.getDays()+'days '+ span.getHours()+'hours '+span.getMinutes()+'minutes');
			
			this.element.trigger("change");
			return false;
		},
		_toggle: function() {
			if( this.isOpen ) { 
				this.close();
			} else {
				this.open();
			}
		},
		_debug: function( msg ) {
			if( this.options.debug === true) {
				console.log( msg );
			}
		},
		_setOption: function( key, value ) {
			this.options[ key ] = value;
			$.Widget.prototype._setOption.apply( this, arguments );
		},
		destroy: function() {
			this.element.unbind( "click" );
			this.element.unwrap().removeAttr( "class" ).removeAttr( "style" );  
			this.element.prev( ".ui-daterangepicker-next" ).remove();
			this.element.prev( ".ui-daterangepicker-prev" ).remove();
			$( ".ui-daterangepickercontain" ).find( ".range-start" ).datepicker( "destroy" );
			$( ".ui-daterangepickercontain" ).find( ".range-end" ).datepicker( "destroy" );
			$( ".ui-daterangepickercontain" ).remove();
			$( ".ui-rangepicker-times" ).remove();
			$( "#ui-datepicker-div" ).remove();
			$.Widget.prototype.destroy.call( this );
		}
	});
}( jQuery ));