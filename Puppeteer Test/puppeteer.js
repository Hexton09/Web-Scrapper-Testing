const puppeteer = require('puppeteer');
const now = require('performance-now');

// Function to scrape titles using Puppeteer
async function fetchTitles() {
    const start = now();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto('https://www.amazon.in/', { waitUntil: 'networkidle2' });
        const afterFetch = now();

        // Extract titles; adjust the selector as needed
        const titles = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('h2.a-color-base.headline'));
            return elements.map(element => element.textContent.trim());
        });
        const afterProcess = now();

        console.log(`Titles: ${titles.join(', ')}`);
        console.log(`Fetching HTML took ${(afterFetch - start).toFixed(2)} ms`);
        console.log(`Processing data took ${(afterProcess - afterFetch).toFixed(2)} ms`);
        console.log(`Total time taken ${(afterProcess - start).toFixed(2)} ms`);

        await browser.close();
        return titles;
    } catch (error) {
        console.error('Error during fetching:', error);
        await browser.close();
        throw error; // Re-throw to handle it in retry logic
    }
}

// Function to perform the scraping with retry logic
async function fetchTitlesWithRetry(attempt = 0) {
    let maxAttempts = 3;
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

// Function to test concurrency
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
