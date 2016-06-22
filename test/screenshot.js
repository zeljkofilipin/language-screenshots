 var By = require('selenium-webdriver').By,
     until = require('selenium-webdriver').until,
     chrome = require('selenium-webdriver/chrome'),
     test = require('selenium-webdriver/testing');

test.describe('Google Search', function() {
  var driver;

  test.before(function() {
    driver = new chrome.Driver();
  });

  test.after(function() {
    driver.quit();
  });

  test.it('should open visual editor', function() {
    driver.get('http://en.wikipedia.beta.wmflabs.org/wiki/Special:Random?veaction=edit');
    driver.wait(until.elementLocated(By.css('html.ve-active.ve-activated')), 10000);
    driver.takeScreenshot().then((image) => {
      require('fs').writeFile('screenshot.png', image, 'base64');
    });
  });
});
