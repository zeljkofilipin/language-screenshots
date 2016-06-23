var By = require( 'selenium-webdriver' ).By,
	until = require( 'selenium-webdriver' ).until,
	chrome = require( 'selenium-webdriver/chrome' ),
	test = require( 'selenium-webdriver/testing' ),
	fs = require( 'fs' ),
	Jimp = require( 'jimp' );

test.describe( 'Screenshot', function () {
	var driver;

	test.beforeEach( function () {
		driver = new chrome.Driver();
	} );

	test.afterEach( function () {
		driver.quit();
	} );

	test.it( 'should open visual editor without welcome dialogue', function () {
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?veaction=edit' );
		driver.manage().timeouts().setScriptTimeout( 10000 );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];
					mw.hook( 've.activationComplete' ).add( function () {
						ve.init.target.welcomeDialog.close().then( done );
					} );
				}
			).then( function () {
				driver.takeScreenshot().then( function ( image ) {
					fs.writeFile( 've-without-welcome-dialogue.png', image, 'base64' );
				} );
			} ), 10000
		);
	} );
	test.it( 'should open visual editor with welcome dialogue', function () {
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?veaction=edit' );
		driver.manage().timeouts().setScriptTimeout( 10000 );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];
					mw.hook( 've.activationComplete' ).add( function () {
						ve.init.target.surface.dialogs.opening.then( done );
					} );
				}
			).then( function () {
				driver.takeScreenshot().then( function ( image ) {
					fs.writeFile( 've-with-welcome-dialogue.png', image, 'base64' );
				} );
			} ), 10000
		);
	} );
	test.it( 'should open cite dialogue', function () {
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?vehidebetadialog=true&veaction=edit' );
		driver.manage().timeouts().setScriptTimeout( 10000 );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];
					mw.hook( 've.activationComplete' ).add( function () {
						ve.init.target.surface.view.focus();
						setTimeout( function () {
							ve.init.target.toolbar.tools.citefromid.onSelect();
							setTimeout( function () {
								var rect = ve.init.target.surface.context.inspectors.currentWindow.$element[ 0 ].getBoundingClientRect();
								done( rect );
							}, 500 );
						} );
					} );
				}
			).then( function ( rect ) {
				return driver.takeScreenshot().then( function ( image ) {
					fs.writeFileSync( 've-with-cite-dialogue-original.png', image, 'base64' );
					return Jimp.read( 've-with-cite-dialogue-original.png' ).then( function ( jimpImage ) {
						jimpImage
							.crop( rect.left, rect.top, rect.width, rect.height )
							.write( 've-with-cite-dialogue.png' );
					} );
				} );
			} ), 10000
		);
	} );
} );
