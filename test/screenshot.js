var By = require( 'selenium-webdriver' ).By,
	until = require( 'selenium-webdriver' ).until,
	chrome = require( 'selenium-webdriver/chrome' ),
	test = require( 'selenium-webdriver/testing' ),
	fs = require( 'fs' ),
	Jimp = require( 'jimp' );

function cropScreenshot( filename, image, rect, padding ) {
	var temp = 'temp-' + Math.random() + '.tmp.png';

	if ( padding === undefined ) {
		padding = 10;
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
						ve.init.target.actionsToolbar.tools.notices.getPopup().toggle( false );
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
						ve.init.target.actionsToolbar.tools.notices.getPopup().toggle( false );
						setTimeout( done, 500 );
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
						ve.init.target.actionsToolbar.tools.notices.getPopup().toggle( false );
						ve.init.target.surface.view.focus();
						setTimeout( function () {
							ve.init.target.toolbar.tools.citefromid.onSelect();
							setTimeout( function () {
								done( ve.init.target.surface.context.inspectors.currentWindow.$element[ 0 ].getBoundingClientRect() );
							}, 500 );
						} );
					} );
				}
			).then( function ( rect ) {
				return driver.takeScreenshot().then( function ( image ) {
					return cropScreenshot( 've-cite-dialogue.png', image, rect );
				} );
			} ), 10000
		);
	} );
	test.it( 'should open format menu', function () {
		driver.get( 'http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?vehidebetadialog=true&veaction=edit' );
		driver.manage().timeouts().setScriptTimeout( 10000 );
		driver.wait(
			driver.executeAsyncScript(
				// This function is converted to a string and executed in the browser
				function () {
					var done = arguments[ arguments.length - 1 ];
					mw.hook( 've.activationComplete' ).add( function () {
						ve.init.target.actionsToolbar.tools.notices.getPopup().toggle( false );
						ve.init.target.surface.view.focus();
						setTimeout( function () {
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
						} );
					} );
				}
			).then( function ( rect ) {
				return driver.takeScreenshot().then( function ( image ) {
					return cropScreenshot( 've-format-menu.png', image, rect );
				} );
			} ), 10000
		);
	} );
} );
