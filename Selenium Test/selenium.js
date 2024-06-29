const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const now = require('performance-now');

async function fetchTitles() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
    let start = now();
    
    try {
        await driver.get('https://www.amazon.in/');
        let afterFetch = now();

        // Extracting titles; adjust the selector as needed
        let elements = await driver.findElements(By.css('h2.a-color-base.headline'));
        let titles = [];

        for (let element of elements) {
            let title = await element.getText();
            titles.push(title.trim());
        }

        let afterProcess = now();

        console.log(`Titles: ${titles.join(', ')}`);
        console.log(`Fetching HTML took ${(afterFetch - start).toFixed(2)} ms`);
        console.log(`Processing data took ${(afterProcess - afterFetch).toFixed(2)} ms`);
        console.log(`Total time taken ${(afterProcess - start).toFixed(2)} ms`);

        return titles;
    } catch (error) {
        console.error('Error during fetching:', error);
    } finally {
        await driver.quit();
    }
}

async function fetchTitlesWithRetry(attempt = 0) {
    const maxAttempts = 3;
    try {
        return await fetchTitles();
    } catch (error) {
        if (attempt < maxAttempts) {
            console.log(`Retrying... Attempt ${attempt + 1}`);
            return await fetchTitlesWithRetry(attempt + 1);
        } else {
            console.error('Max retry attempts reached, failing with error:', error);
            return [];
        }
    }
}

async function performConcurrencyTest() {
    const numberOfRequests = 5; // Number of concurrent tests
    const promises = [];
    for (let i = 0; i < numberOfRequests; i++) {
        promises.push(fetchTitlesWithRetry());
    }

    const results = await Promise.all(promises);
    console.log(`Number of titles fetched in each request: ${results.map(t => t.length).join(', ')}`);
}

performConcurrencyTest();
