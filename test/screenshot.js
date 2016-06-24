var By = require( 'selenium-webdriver' ).By,
	until = require( 'selenium-webdriver' ).until,
	chrome = require( 'selenium-webdriver/chrome' ),
	test = require( 'selenium-webdriver/testing' ),
	fs = require( 'fs' ),
	Jimp = require( 'jimp' ),
	lang = 'en';

test.describe( 'Screenshot', function () {
	var driver;

	function runScreenshotTest( name, clientScript ) {
		var filename = name + '-' + lang + '.png';
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/PageDoesNotExist?veaction=edit&uselang=' + lang );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];
					// Suppress welcome dialog
					localStorage.setItem( 've-beta-welcome-dialog', 1 );
					// Suppress user education indicators
					localStorage.setItem( 've-hideusered', 1 );
					mw.hook( 've.activationComplete' ).add( function () {
						var target = ve.init.target,
							surfaceView = target.getSurface().getView();
						// Hide edit notices
						target.actionsToolbar.tools.notices.getPopup().toggle( false );
						// Give focus
						surfaceView.once( 'focus', done );
						surfaceView.focus();
					} );
				}
			).then( function () {
				return driver.executeAsyncScript( clientScript ).then( function ( rect ) {
					return driver.takeScreenshot().then( function ( image ) {
						if ( rect ) {
							return cropScreenshot( filename, image, rect );
						} else {
							fs.writeFile( filename, image, 'base64' );
						}
					} );
				} );
			} ),
			20000
		);
	}

	function cropScreenshot( filename, image, rect, padding ) {
		var temp = 'temp-' + Math.random() + '.tmp.png';

		if ( padding === undefined ) {
			padding = 5;
		}

		fs.writeFileSync( temp, image, 'base64' );

		return Jimp.read( temp ).then( function ( jimpImage ) {
			fs.unlinkSync( temp );
			jimpImage
				.crop(
					rect.left - padding,
					rect.top - padding,
					rect.width + ( padding * 2 ),
					rect.height + ( padding * 2 )
				)
				.write( filename );
		} );
	}

	test.beforeEach( function () {
		driver = new chrome.Driver();
		driver.manage().timeouts().setScriptTimeout( 20000 );
	} );

	test.afterEach( function () {
		driver.quit();
	} );

	test.it( 'Citoid inspector', function () {
		runScreenshotTest( 'VisualEditor_Citoid_Inspector',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ];
				ve.init.target.toolbar.tools.citefromid.onSelect();
				setTimeout( function () {
					var rect = ve.init.target.surface.context.inspectors.currentWindow.$element[ 0 ].getBoundingClientRect();
					done( {
						top: rect.top - 20,
						left: rect.left,
						width: rect.width,
						height: rect.height + 20
					} );
				}, 500 );
			}
		);
	} );
	test.it( 'Toolbar headings', function () {
		runScreenshotTest( 'VisualEditor_Toolbar_Headings',
			// This function is converted to a string and executed in the browser
			function () {
				var done = arguments[ arguments.length - 1 ];
				ve.init.target.toolbar.tools.paragraph.toolGroup.setActive( true );
				setTimeout( function () {
					var handle = ve.init.target.toolbar.tools.paragraph.toolGroup.$element[ 0 ].getBoundingClientRect(),
						group = ve.init.target.toolbar.tools.paragraph.toolGroup.$group[ 0 ].getBoundingClientRect();
					done( {
						top: handle.top,
						left: Math.min( handle.left, group.left ),
						width: Math.max( handle.right, group.right ) - Math.min( handle.left, group.left ),
						height: group.bottom - handle.top
					} );
				}, 500 );
			}
		);
	} );
} );
