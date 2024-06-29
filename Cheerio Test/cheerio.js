const axios = require('axios');
const cheerio = require('cheerio');
const now = require('performance-now');

// URL of the page you want to scrape
const URL = 'https://www.amazon.in/';

async function fetchTitles() {
    let start = now();  // Start timing before the request
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        let afterFetch = now();  // Time after fetching HTML

        const $ = cheerio.load(data);
        let titles = [];
        $('h2.a-color-base.headline').each((index, element) => {
            titles.push($(element).text().trim());
        });

        let afterProcess = now();  // Time after processing data

        console.log(`Fetching HTML took ${(afterFetch - start).toFixed(2)} ms`);
        console.log(`Processing data took ${(afterProcess - afterFetch).toFixed(2)} ms`);
        console.log(`Total time taken ${(afterProcess - start).toFixed(2)} ms`);
        return titles;  // Return the titles for verification
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;  // Re-throw error to handle it in retry logic
    }
}

async function fetchTitlesWithRetry(attempt = 0) {
    let maxAttempts = 3;  // Maximum number of retry attempts
    try {
        return await fetchTitles();  // Attempt to fetch titles
    } catch (error) {
        if (attempt < maxAttempts) {
            console.log(`Retrying... Attempt ${attempt + 1}`);
            return await fetchTitlesWithRetry(attempt + 1);  // Recursive retry on failure
        } else {
            console.error('Max retry attempts reached, failing with error:', error);
            return [];  // Return empty array on failure after max attempts
        }
    }
}

async function performConcurrencyTestWithRetry() {
    let numberOfRequests = 5;  // Define the number of concurrent requests
    let promises = [];
    for (let i = 0; i < numberOfRequests; i++) {
        promises.push(fetchTitlesWithRetry());
    }

    let results = await Promise.all(promises);
    console.log(`Titles fetched in each request: ${results.map(titles => titles.length).join(', ')}`);
}

performConcurrencyTestWithRetry();
