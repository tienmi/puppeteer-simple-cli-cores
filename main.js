const path = require("path");
const puppeteer = require("puppeteer");
const chalk = require("chalk");

(async () => {
    console.log(`${chalk.bgMagenta("[Initialzation] Preparing")}`);
    let first = true;
    let retryCount = 0;
    const root = path.resolve("", "./");
    const mainConfig = __non_webpack_require__(`${root}/src/main.config.js`);
    const config = mainConfig.config || { headless: false, slowMo: 50 };
    const browser = await puppeteer.launch(config);
    let page = await browser.newPage();
    await page.goto(mainConfig.targetURL);
    // Catch log
    page.on("console", (msg) => console.log("[Log]: ", msg.text()));
    const run = async (step) => {
        try {
            if (!first && step.reload) {
                await page.close();
                page = await browser.newPage();
                await page.goto(mainConfig.targetURL);
            }
            first = false;
            const runner = __non_webpack_require__(`${root}/src${step.path}`);
            await runner({ page });
            console.log(
                `${chalk.bgGreen("[Step]")} ${step.name} ${chalk.green(
                    "done."
                )}`
            );
        } catch (e) {
            console.log(
                `${chalk.bgRed("[Error]")} ${step.name} - ${chalk.red(e)}`
            );
            if (retryCount < mainConfig.retry) {
                console.log(
                    `${chalk.bgGreen("[Step]")} ${step.name} ${chalk.blue(
                        "retry."
                    )}`
                );
                retryCount++;
                await run(step);
            }
        }
    };
    for (const step of mainConfig.pipelines) {
        console.log(
            `${chalk.bgGreen("[Step]")} ${step.name} ${chalk.blue("start.")}`
        );
        await run(step);
    }
    console.log(chalk.bgMagenta("[End]"));
})();
