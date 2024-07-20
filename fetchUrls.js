const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

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

const baseUrl = 'https://usa.edu.pk/';
fetchUrls(baseUrl).then(urls => {
  urls.forEach(url => console.log(url));
});
