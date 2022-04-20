const fs = require('fs');
const readline = require('readline')
const puppeteer = require('puppeteer-core');


function show_title() {
  const version = "0.1.2"
  const cui_line    = '*******************************************'
  const cui_mid     = '*                                         *'
  const cui_title   = '*        CheckIn/Out Automator            *'
  const cui_author  = '*                  by mikoiwate           *'
  const cui_version = '*                            version' +  version + ' *'

  console.log(cui_line);
  console.log(cui_mid);
  console.log(cui_title);
  console.log(cui_author);
  console.log(cui_mid);
  console.log(cui_version);
  console.log(cui_line);
}

function finalize_with_key_input() {
  const readInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readInterface.question('please push Enter and close window ', () => {
    readInterface.close();
  })
}

function get_argument_param() {
  let params = {
    mode: 'in',
    headless: false
  }

  switch (process.argv[2]) {
    case 'checkin':
      params.mode = 'in';
      break;
    case 'checkout':
      params.mode = 'out';
      break;
    default:
      console.log("Invalid argument, please input 'checkin' or 'checkout");
      process.exit(-1);
  }
  
  if (process.argv[3] == 'headless') {
    params.headless = true;
  }

  return params;
}

async function chckIO_automator(chck_mode, isHeadless){
  const browser = await puppeteer.launch({
    headless: isHeadless,
	  executablePath: ''
  });

  process.stdout.write('puppeteer setup.');
  process.stdout.write('.');
  const page = await browser.newPage();
  process.stdout.write('.');
  await page.setViewport({width: 1280, height: 1024})
  console.log('Success');

  try {
    // IPA を開く
    process.stdout.write('open IPA page...');
    await page.goto('', {'waitUntil': 'networkidle0'});
    console.log('Success');

    // インフォメーションを閉じる
    // ※インフォメーションが表示される前提で書いているので要対応
    process.stdout.write('close informatoin modal');
    process.stdout.write('.');
    await page.waitForSelector('.close-btn', {visible: true});
    await page.keyboard.press("Escape");
    process.stdout.write('.');
    await page.waitForTimeout(1000);
    process.stdout.write('.');
    console.log('Success');

    // チェックイン/アウトボタンの表示待ち
    process.stdout.write('open check-' + chck_mode + ' window');
    process.stdout.write('.');
    await page.waitForSelector('.checkio-btn.check-' + chck_mode, {visible: true});
    // チェックイン/アウトボタン押下
    process.stdout.write('.');
    await page.click('.checkio-btn.check-'+ chck_mode);
    // チェックイン/アウトウィンドウの表示待ち
    process.stdout.write('.');
    await page.waitForTimeout(2000);
    console.log('Success');

    // チェックイン/アウト実施
    process.stdout.write('check' + chck_mode);
    process.stdout.write('.');
    // Save&Notifyボタン表示待ち
    await page.waitForSelector('.modal-check' + chck_mode + ' .btn-checkin-and-notify', {visible: true});
    process.stdout.write('.');
    // Save&Notifyボタン押下
    await page.click('.modal-check' + chck_mode + ' .btn-checkin-and-notify');
    // await page.click('.modal-check' + chck_mode + ' .btn-cancel');
    // Save&Notify実施待ち
    process.stdout.write('.');
    await page.waitForTimeout(2000);
    console.log('Success');

  } catch(e){
    await page.screenshot({path: 'error.png', fullPage: true});
    throw e;
  } finally {
    await browser.close();
  }
}

async function main(){
  // let params = get_argument_param();
  const mode = 'in';
  // const mode = 'out';
  const headless = true;
  show_title();
  // console.log("start mode is check'" + params.mode + "'");
  console.log("start mode is check'" + mode + "'");

  try {
    await chckIO_automator(mode, headless);  
    console.log('all steps are completed');
  } catch(e) {
    console.log('******* Error Occured! **********');
    console.log(e);
    fs.writeFileSync("error.dump", JSON.stringify(e.stack));
  } finally {
    finalize_with_key_input();
  }
}

main();
