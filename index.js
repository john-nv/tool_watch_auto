const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer.launch({ headless: false }).then(async browser => {
    const links = [
        'http://daotaocobanunicity.com/pluginfile.php/39/mod_scorm/content/5/res/index.html',
        'http://daotaocobanunicity.com/pluginfile.php/41/mod_scorm/content/3/res/index.html',
        'http://daotaocobanunicity.com/pluginfile.php/43/mod_scorm/content/4/res/index.html',
        'http://daotaocobanunicity.com/pluginfile.php/45/mod_scorm/content/5/res/index.html',
        'http://daotaocobanunicity.com/pluginfile.php/47/mod_scorm/content/5/res/index.html'
    ];
// ======================================================= PAGE 1
    const page = await browser.newPage();
    // await page.setViewport({ width: 500, height: 500 })

    await page.goto('http://daotaocobanunicity.com/login/');
    await page.waitForTimeout(1000);

    await page.type('#username', '458943284');
    await page.type('#word', '070086000459');
    await page.waitForTimeout(1000);
    await page.click('#loginbtn');
    await page.waitForTimeout(2000);

    try {
        const page = await browser.newPage();
        await page.goto(links[0]);

        const title = await page.title();
        console.log(`title: ${title}`);
        await page.waitForSelector('body');

        await page.waitForTimeout(3000);

        page.click('.launch-screen-button__play-icon');

        await page.waitForTimeout(2000);

        for (let j = 0; j < 100; j++) {
            const progressbarLabelContent = await page.$eval('.progressbar__label_type_time', element => element.textContent);
            const time = formatTime(progressbarLabelContent);
            console.log(time);

            await new Promise(resolve => {
                setTimeout(async () => {
                    console.log('click');
                    await page.click('.universal-control-panel__button_next');
                    resolve();
                }, time + 2000);
            });
        }

    } catch (error) {
        console.log(error);
    }

   
});


function formatTime(stringTime, delay = 1.5){
    const timeParts = stringTime.split(" / ");
    const timeAfterSlash = timeParts[1];

    const [minutes, seconds] = timeAfterSlash.split(":");
    const totalSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10) + delay;

    console.log("Thông tin phía sau:", timeAfterSlash);
    console.log("Tổng số giây:", totalSeconds);
    return totalSeconds * 1000
}



// 461056984
// 014068005399
// Sơn
// 461054984
// 079093024269
// Sơn
// 461053284
// 045182000553
// Sơn
// 461027684
// 015300005089
// Sơn


// 461027284
// 070305007545
// Sơn

// 461010784 
// 038082024389
// Sơn
// 460993184
// 036188024491