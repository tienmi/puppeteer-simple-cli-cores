const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    console.log('[Initialzation]: Preparing');
    const root = path.resolve('', './');
    const mainConfig = __non_webpack_require__(`${root}/src/main.config.js`);
    const config = mainConfig.config || { headless: false, slowMo: 50 };
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();
    await page.goto(mainConfig.targetURL);
    // Catch log
    page.on('console', msg => console.log('[Log]: ', msg.text()));
    for (let step of mainConfig.step) {
        console.log(`[Step]: ${step.name} start.`);
        try {
            const runner = __non_webpack_require__(`${root}/src/step${step.path}`);
            await runner({ page });
            console.log(`[Step]: ${step.name} done.`);
        } catch (e) {
            console.log(`[Error]: ${step.name} - ${e}`);
        }
    }
    console.log('[End]');
})();
