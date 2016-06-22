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

  test.it('should append query to title', function() {
    driver.get('http://www.google.com/ncr');
    driver.findElement(By.name('q')).sendKeys('webdriver');
    driver.findElement(By.name('btnG')).click();
    driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  });
});
