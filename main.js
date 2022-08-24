const puppeteer = require('puppeteer');
const path = require('path');
const root = path.resolve('', './');
const mainConfig = __non_webpack_require__(`${root}/src/main.config.js`);
const fs = require('fs');

const saveLog = [];
const context = {
    page: null,
    log(msg) {
        if (!mainConfig.saveLog) return;
        saveLog.push(msg);
        fs.writeFile('log.json', saveLog, function (err) {
            if (err) console.log(err);
            else console.log('Write operation complete.');
        });
    },
    ready: false
};
module.exports = context;

(async () => {
    context.ready = false;
    console.log('\x1b[45m', '[Initialzation] Preparing', '\x1b[0m');
    context.log.push('Preparing...');
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
        context.log.push(`Running step ${step.title}.`);
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
            context.log.push(`Step ${step.title} success!`);
        } catch (e) {
            console.log('\x1b[41m', '[Error]', '\x1b[0m', step.title, '\x1b[31m', e, '\x1b[0m');
            context.log.push(`[Error] ${step.title} - ${e}`);
            if (retryCount < mainConfig.retry) {
                context.log.push(`Step ${step.title} retry.`);
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
                await runStep(step);
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
    context.ready = true;
    context.log.push(`Job end!`);
    console.log('\x1b[45m', '[End]', '\x1b[0m');
    browser.close();
})();
