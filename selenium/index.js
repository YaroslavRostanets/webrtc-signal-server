const webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

const firefox = require('selenium-webdriver/firefox');

var options = new firefox.Options();
options.setPreference("permissions.default.microphone", 1);
options.setPreference("permissions.default.camera", 1);
options.setPreference("network.websocket.allowInsecureFromHTTPS", 1);


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

script();



//driver.quit();
