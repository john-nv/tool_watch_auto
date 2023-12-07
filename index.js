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
        const links = [
            {
                link: 'http://daotaocobanunicity.com/mod/scorm/view.php?id=20',
                name: 'ke hoach tra thuong'
            },{
                link: 'http://daotaocobanunicity.com/mod/scorm/view.php?id=18',
                name: 'quy tac hoat dong'
            },{
                link: 'http://daotaocobanunicity.com/mod/scorm/view.php?id=12',
                name: 'Pháp luật về bán hàng đa cấp'
            },{
                link: 'http://daotaocobanunicity.com/mod/scorm/view.php?id=14',
                name: ' Chuẩn mực đạo đức trong hoạt động bán hàng đa cấp'
            },{
                link: 'http://daotaocobanunicity.com/mod/scorm/view.php?id=16',
                name: 'Hợp đồng tham gia bán hàng đa cấp'
            },
        ]
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
        await page1.goto(links[0].link);
        runScreenTab(page1, links[0].name)

        const page2 = await browser.newPage();
        await page2.goto(links[1].link);
        runScreenTab(page2, links[1].name)

        const page3 = await browser.newPage(); 
        await page3.goto(links[2].link);
        runScreenTab(page3, links[2].name)

        const page4 = await browser.newPage();
        await page4.goto(links[3].link);
        runScreenTab(page4, links[3].name)

        const page5 = await browser.newPage();
        await page5.goto(links[4].link);
        runScreenTab(page5, links[4].name)

    } catch (error) {
        console.log(error.message);
    } finally {
        console.log('finally')
    }
}

async function runScreenTab(page, namePage) {
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

                            if(timeLabelContent == 0){
                                try {
                                    console.log('click');
                                    await frameContent.waitForSelector(dialog).catch(() => {});
                                    await frameContent.waitForSelector(btnDialog).catch(() => {});
                                    await frameContent.click(btnDialog);
                                    await frameContent.click(btnDialog);
                                    await frameContent.click(nextButtonSelector);
                                } catch (error) {
                                    console.log('trang =>', namePage)
                                    resolve();
                                }
                                resolve();
                            }

                            if(timeLabelContent > 7000){ 
                                await page.waitForTimeout(3000)
                                await frameContent.click(nextButtonSelector);
                                console.log('click');
                                resolve();
                            } else{
                                await frameContent.click(nextButtonSelector);
                                console.log('click');
                                try {
                                    await frameContent.waitForSelector(dialog).catch(() => {});
                                    await frameContent.waitForSelector(btnDialog).catch(() => {});
                                    await frameContent.click(btnDialog);
                                } catch (error) {
                                    console.log('trang =>', namePage)
                                    resolve();
                                }
                                resolve();
                            }
                            
                        }, timeLabelContent );
                    });
                }else{
                    console.log('cancel')
                }
            } catch (error) {
                console.log('trang =>', namePage)
                console.log(error.message)
                continue;
            }
        }

        
    } catch (error) {
        console.log('trang =>', namePage)
        console.log(error.message)
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









runScraping('', '');
