const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');
const path = require('path');

async function fetchUrls(baseUrl) {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    const links = new Set();

    $('a').each((i, element) => {
      let href = $(element).attr('href');
      if (href) {
        href = url.resolve(baseUrl, href);
        if (href.startsWith(baseUrl)) {
          links.add(href);
        }
      }
    });

    return Array.from(links);
  } catch (error) {
    console.error(`Error fetching ${baseUrl}:`, error);
    return [];
  }
}

async function checkAltTags(pageUrl, results) {
  try {
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);
    const missingAltTags = [];

    $('img').each((i, element) => {
      const alt = $(element).attr('alt');
      if (!alt) {
        missingAltTags.push($(element).attr('src'));
      }
    });

    if (missingAltTags.length > 0) {
      missingAltTags.forEach(src => {
        results.push({ pageUrl, src });
      });
    }
  } catch (error) {
    console.error(`Error fetching ${pageUrl}:`, error);
  }
}

async function saveResultsToCSV(results) {
  const filePath = path.join(__dirname, 'missing_alt_tags.csv');
  const headers = 'Page URL,Image Src\n';
  const csvContent = results.map(result => `${result.pageUrl},${result.src}`).join('\n');

  fs.writeFileSync(filePath, headers + csvContent, 'utf8');
  console.log(`Results saved to ${filePath}`);
}

const baseUrl = 'https://usa.edu.pk/';

(async () => {
  const urls = await fetchUrls(baseUrl);
  const results = [];

  for (const pageUrl of urls) {
    await checkAltTags(pageUrl, results);
  }

  await saveResultsToCSV(results);
})();
