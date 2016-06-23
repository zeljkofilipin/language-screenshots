var By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    chrome = require('selenium-webdriver/chrome'),
    test = require('selenium-webdriver/testing');

test.describe('Screenshot', function() {
  var driver;

  test.before(function() {
    driver = new chrome.Driver();
  });

  test.after(function() {
    driver.quit();
  });

  test.it('should open visual editor', function() {
    driver.get('http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?vehidebetadialog=true&veaction=edit');
    driver.manage().timeouts().setScriptTimeout(10000);
    driver.wait(
      driver.executeAsyncScript(
        // This function is converted to a string and executed in the browser
        function () {
          mw.hook( 've.activationComplete' ).add( arguments[arguments.length-1]);
        }
      ).then(function() {
        driver.takeScreenshot().then((image) => {
          require('fs').writeFile('screenshot.png', image, 'base64');
        })
      }), 10000
    );
  });
});
