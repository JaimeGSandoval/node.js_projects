const http = require('http');
const fs = require('fs');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

const data = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
let dataObject = JSON.parse(data);

dataObject.forEach((data, i, arr) => {
  arr[i].slug = slugify(data.productName, { lower: true });
});

const slugs = dataObject.map((data) =>
  slugify(data.productName, { lower: true })
);

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // OVERVIEW PAGE
  if (pathname === '/' || pathname === '/overview') {
    const cardsHtml = dataObject
      .map((data) => replaceTemplate(templateCard, data))
      .join('');

    const output = templateOverview.replace(/{%PRODUCT_CARDS%}/, cardsHtml);
    res.writeHeader(200, { 'Content-Type': 'text/html' });
    res.end(output);

    // PRODUCT PAGE
  } else if (pathname.startsWith('/product')) {
    const product = dataObject.find(
      (data) => data.slug === pathname.split('/')[2]
    );
    const output = replaceTemplate(templateProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);

    // PAGE NOT FOUND
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('listening on port 8000');
});
