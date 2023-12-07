const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function launchBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=400,450'],
        defaultViewport: null, 
        protocolTimeout: 60000,
    });
    return browser;
}

async function runScraping(user, pass) {
    const browser = await launchBrowser();

    try {
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
        await page1.goto('http://daotaocobanunicity.com/mod/scorm/view.php?id=20'); // ke hoach tra thuong
        runScreenTab(page1)

        const page2 = await browser.newPage();
        await page2.goto('http://daotaocobanunicity.com/mod/scorm/view.php?id=18'); // quy tac hoat dong
        runScreenTab(page2)

        const page3 = await browser.newPage(); 
        await page3.goto('http://daotaocobanunicity.com/mod/scorm/view.php?id=12'); // Pháp luật về bán hàng đa cấp
        runScreenTab(page3)

        const page4 = await browser.newPage();
        await page4.goto('http://daotaocobanunicity.com/mod/scorm/view.php?id=14'); // Chuẩn mực đạo đức trong hoạt động bán hàng đa cấp
        runScreenTab(page4)

        const page5 = await browser.newPage();
        await page5.goto('http://daotaocobanunicity.com/mod/scorm/view.php?id=16'); // Hợp đồng tham gia bán hàng đa cấp
        runScreenTab(page5)

    } catch (error) {
        console.log(error.message);
    } finally {
        console.log('finally')
    }
}

async function runScreenTab(page) {
    try {
        const iframeSelector = '#scorm_object';
        await page.waitForSelector(iframeSelector);
        const frame = await page.$(iframeSelector);
        const frameContent = await frame.contentFrame();
        
        await page.waitForTimeout(100);

        // page.click('.launch-screen-button__icon');

        for (let j = 0; j < 10000; j++) {

            const nextButtonSelector = '.universal-control-panel__button_next';
            const dialog = '.message-box__content';
            const btnDialog = '.message-box-buttons-panel__window-button';

            let timeLabelContent 
            timeLabelContent = await frameContent.$eval('.progressbar__label_type_time', element => element.textContent);
            timeLabelContent = await formatTime(timeLabelContent)
            timeLabelContent = timeLabelContent.afterTotalSeconds - timeLabelContent.beforeTotalSeconds
            console.log('time => ', timeLabelContent)

            if(isNaN(timeLabelContent)) {
                timeLabelContent = await frameContent.$eval('.progressbar__label_type_time', element => element.textContent);
                timeLabelContent = await formatTime(timeLabelContent)
                timeLabelContent = timeLabelContent.afterTotalSeconds - timeLabelContent.beforeTotalSeconds
                console.log('time (again) => ', timeLabelContent)
            }

            try {
                if(typeof(timeLabelContent) === 'number'){
                    await new Promise(resolve => {
                        setTimeout(async () => { // video ngan qua thi khong doi 3s
                            await frameContent.waitForSelector(nextButtonSelector).catch(() => {});

                            if(timeLabelContent > 7000){ 
                                await page.waitForTimeout(3000)
                                await frameContent.click(nextButtonSelector);
                                console.log('click');
                                resolve();
                            } else{
                                await frameContent.click(nextButtonSelector);
                                console.log('click');
                                await frameContent.waitForSelector(dialog).catch(() => {});
                                await frameContent.waitForSelector(btnDialog).catch(() => {});
                                await frameContent.click(btnDialog);
                                resolve();
                            }
                            
                        }, timeLabelContent );
                    });
                }else{
                    console.log('cancel')
                }
            } catch (error) {
                console.log(error)
                continue;
            }
        }

        
    } catch (error) {
        console.log(error)
    }
}

async function formatTime(stringTime, delay = 1) {
    const timeParts = stringTime.split(" / ");
    const timeBeforeSlash = timeParts[0];
    const timeAfterSlash = timeParts[1];

    const [beforeMinutes, beforeSeconds] = timeBeforeSlash.split(":");
    const beforeTotalSeconds = await parseInt(beforeMinutes, 10) * 60 + parseInt(beforeSeconds, 10) + delay;

    const [afterMinutes, afterSeconds] = timeAfterSlash.split(":");
    const afterTotalSeconds = await parseInt(afterMinutes, 10) * 60 + parseInt(afterSeconds, 10) + delay;

    return {
        beforeTotalSeconds : beforeTotalSeconds * 1000,
        afterTotalSeconds : afterTotalSeconds * 1000
    };
}


// runScraping('461010784', '038082024389');
runScraping('461027684', '015300005089');
