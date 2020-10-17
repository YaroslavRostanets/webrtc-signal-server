const webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

const firefox = require('selenium-webdriver/firefox');

var options = new firefox.Options();

const driver = new webdriver.Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(options)
  .build();

const script = async () => {
  try {
    driver.get('https://www.rtc-robot.ml/platform?id=1111');
  } catch (err) {
    console.error('ERR: ', err);
  }
}



//driver.quit();
