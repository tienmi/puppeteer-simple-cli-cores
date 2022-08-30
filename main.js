const puppeteer = require('puppeteer');
const mainConfig = __non_webpack_require__(`../../src/main.config.js`);
const version = require('./dist/package.json').version;
const context = {
    page: null
};
module.exports = context;

(async () => {
    console.log(`e2e version: ${mainConfig.version} | cores version: ${version}`);
    console.log('Preparing...');
    let retryCount = 0;
    const config = mainConfig.config || { headless: false, slowMo: 50 };
    const browser = await puppeteer.launch(config);
    let page = await browser.newPage();
    context.page = page;

    // Catch log
    if (mainConfig.getClientLog) {
        page.on('console', msg => console.log('[Log]: ', msg.text()));
    }

    const runStep = async step => {
        console.log(`Running step ${step.title}.`);
        try {
            const runner = __non_webpack_require__(`../../src${step.path}`);
            await runner();
            console.log(`Step ${step.title} success!`);
        } catch (e) {
            console.log(`[Error] ${step.title} - ${e}`);
            if (retryCount < mainConfig.retry) {
                console.log(`Step ${step.title} retry.`);
                retryCount++;
                const navigationPromise = page.waitForNavigation();
                await page.goto(mainConfig.targetURL);
                await navigationPromise;
                await runStep(step);
            }
        }
    };

    const runPipelines = async () => {
        for (const step of mainConfig.pipelines) {
            const navigationPromise = page.waitForNavigation();
            await page.goto(mainConfig.targetURL);
            await navigationPromise;
            await runStep(step);
        }
    };

    await runPipelines();
    console.log(`Job end!`);
    browser.close();
})();
