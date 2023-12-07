const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function launchBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=400,350'],
        defaultViewport: null, 
        protocolTimeout: 60000,
    });
    return browser;
}

async function runScraping(user, pass) {
    const browser = await launchBrowser();

    try {
        const links = [
            'http://daotaocobanunicity.com/pluginfile.php/39/mod_scorm/content/5/res/index.html',
            'http://daotaocobanunicity.com/pluginfile.php/41/mod_scorm/content/3/res/index.html',
            'http://daotaocobanunicity.com/pluginfile.php/43/mod_scorm/content/4/res/index.html',
            'http://daotaocobanunicity.com/pluginfile.php/45/mod_scorm/content/5/res/index.html',
            'http://daotaocobanunicity.com/pluginfile.php/47/mod_scorm/content/5/res/index.html'
        ];

        const page = await browser.newPage();

        await page.goto('http://daotaocobanunicity.com/login/');
        await page.waitForTimeout(1000);
        console.log(user, pass)
        await page.type('#username', user);
        await page.type('#password', pass);
        await page.waitForTimeout(1000);
        await page.click('#loginbtn');
        await page.waitForTimeout(1000);

        const page1 = await browser.newPage();
        await page1.goto(links[0]);
        const page2 = await browser.newPage();
        await page2.goto(links[1]);
        const page3 = await browser.newPage();
        await page3.goto(links[2]);
        const page4 = await browser.newPage();
        await page4.goto(links[3]);
        const page5 = await browser.newPage();
        await page5.goto(links[4]);
        // const page6 = await browser.newPage();
        // await page6.goto(links[0]);

        Promise.all([
                runScreenTab(page1),
                runScreenTab(page2),
                runScreenTab(page3),
                runScreenTab(page4),
                runScreenTab(page5),
                // runScreenTab(page6),
            ])

    } catch (error) {
        console.log(error.message);
    } finally {
        console.log('finally')
    }
}

async function runScreenTab(page) {
    try {
        await page.waitForSelector('.launch-screen-button__icon', 9999999);
        await page.waitForTimeout(8000);

        page.click('.launch-screen-button__icon');

        await page.waitForTimeout(500);

        setInterval(()=>{ checkAndClickMessageBox(page) }, 1500)
        for (let j = 0; j < 100; j++) {
            const progressbarLabelContent = await page.$eval('.progressbar__label_type_time', element => element.textContent);
            const time = formatTime(progressbarLabelContent);
            console.log(time);

            try {
                await new Promise(resolve => {
                    setTimeout(async () => {
                        console.log('click');
                        await page.waitForSelector('.universal-control-panel__button_next', 999999);
                        await page.click('.universal-control-panel__button_next');
                        resolve();
                    }, time );
                });
            } catch (error) {
                console.log(error)
                continue
            }
        }

        
    } catch (error) {
        console.log(error)
    }
}

async function checkAndClickMessageBox(page) {
    try {
         // const dialog = await page.$eval('.message-box', element => element !== null);
        const dialog = await page.querySelectorAll(".message-box");
        console.log('check')
        if (dialog) {
            const activeButton = await page.waitForSelector('.message-box-buttons-panel__window-button_active', { visible: true }).catch(() => null);

            if (activeButton) {
                // console.log('Tìm thấy phần tử có class là "message-box" và "message-box-buttons-panel__window-button_active". Thực hiện nhấp chuột.');
                await page.waitForTimeout(1000);
                await activeButton.click();
                console.log('click')

            } else {
                // console.log('Không tìm thấy phần tử con có class là "message-box-buttons-panel__window-button_active" trong "message-box"');
            }
        } else {
            // console.log('Không tìm thấy phần tử có class là "message-box" trên trang');
        }
    } catch (error) {
        return
    }
}

function formatTime(stringTime, delay = 8) {
    const timeParts = stringTime.split(" / ");
    const timeAfterSlash = timeParts[1];

    const [minutes, seconds] = timeAfterSlash.split(":");
    const totalSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10) + delay;

    // console.log("Thông tin phía sau:", timeAfterSlash);
    // console.log("Tổng số giây:", totalSeconds);
    return totalSeconds * 1000;
}


runScraping('461027284', '070305007545');
