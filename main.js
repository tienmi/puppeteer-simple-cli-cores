const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
    console.log("\x1b[45m", "[Initialzation] Preparing", "\x1b[0m");
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
                "\x1b[42m",
                "[Step]",
                "\x1b[0m",
                step.name,
                "\x1b[32m",
                "done.",
                "\x1b[0m"
            );
        } catch (e) {
            console.log(
                "\x1b[41m",
                "[Error]",
                "\x1b[0m",
                step.name,
                "\x1b[31m",
                e,
                "\x1b[0m"
            );
            if (retryCount < mainConfig.retry) {
                console.log(
                    "\x1b[44m",
                    "[Step]",
                    "\x1b[0m",
                    step.name,
                    "\x1b[34m",
                    "retry.",
                    "\x1b[0m"
                );
                retryCount++;
                await run(step);
            }
        }
    };
    for (const step of mainConfig.pipelines) {
        console.log(
            "\x1b[44m",
            "[Step]",
            "\x1b[0m",
            step.name,
            "\x1b[34m",
            "start.",
            "\x1b[0m"
        );
        await run(step);
    }
    console.log("\x1b[45m", "[End]", "\x1b[0m");
})();
