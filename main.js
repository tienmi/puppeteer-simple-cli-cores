const puppeteer = require('puppeteer');
const path = require('path');
const root = path.resolve('', './');

const context = {
    page: null
};
module.exports = context;

(async () => {
    console.log('\x1b[45m', '[Initialzation] Preparing', '\x1b[0m');
    let retryCount = 0;
    const mainConfig = __non_webpack_require__(`${root}/src/main.config.js`);
    const config = mainConfig.config || { headless: false, slowMo: 50 };
    const browser = await puppeteer.launch(config);
    let page = await browser.newPage();
    context.page = page;

    // Catch log
    if (mainConfig.getClientLog) {
        page.on('console', msg => console.log('[Log]: ', msg.text()));
    }

    const runStep = async step => {
        try {
            const runner = __non_webpack_require__(`${root}/src${step.path}`);
            await runner();
            console.log(
                '\x1b[42m',
                '[Step]',
                '\x1b[0m',
                step.title,
                '\x1b[32m',
                'done.',
                '\x1b[0m'
            );
        } catch (e) {
            console.log('\x1b[41m', '[Error]', '\x1b[0m', step.title, '\x1b[31m', e, '\x1b[0m');
            if (retryCount < mainConfig.retry) {
                console.log(
                    '\x1b[44m',
                    '[Step]',
                    '\x1b[0m',
                    step.title,
                    '\x1b[34m',
                    'retry.',
                    '\x1b[0m'
                );
                retryCount++;
                const navigationPromise = page.waitForNavigation();
                await page.goto(mainConfig.targetURL);
                await navigationPromise;
                await runPipelines();
            }
        }
    };

    const runPipelines = async () => {
        for (const step of mainConfig.pipelines) {
            console.log(
                '\x1b[44m',
                '[Step]',
                '\x1b[0m',
                step.title,
                '\x1b[34m',
                'start.',
                '\x1b[0m'
            );
            const navigationPromise = page.waitForNavigation();
            await page.goto(mainConfig.targetURL);
            await navigationPromise;
            await runStep(step);
        }
    };

    await runPipelines();

    console.log('\x1b[45m', '[End]', '\x1b[0m');
})();
