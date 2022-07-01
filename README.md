# Puppeteer-simple-cli-cores

## Status

Puppeteer-simple-cli is a really simple puppeteer tool for End to End test.

### Get Started

```
npm i puppeteer-simple-cli-cores
```

#### Basic usage

create src/main.config.js and addition config

```
module.exports = {
    targetURL: '', // It's your target URL
    pipelines: [
        {
            name: 'stepName',
            path: 'your script path',
            retry: 0, // number of retries
            reload: false // true is page reload
        }
    ],
    config: { headless: false, slowMo: 50, defaultViewport: null },
    retry: 1
};
```

## License

[MIT](https://github.com/tienmi/puppeteer-simple-cli-cores/blob/main/LICENSE)
