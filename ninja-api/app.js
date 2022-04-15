const http = require('http');
const fs = require('fs');
// const url = require('url');

const jsonData = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const { data } = JSON.parse(jsonData);

const app = http.createServer((req, res) => {
  const baseURL = `http://${req.headers.host}/`;
  const url = new URL(req.url, baseURL);

  if (url.pathname === '/') {
    res.writeHead(200, 'bankai', { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } else if (url.pathname === '/ninjas') {
    const name = url.searchParams.get('name');
    const ninja = data.find((shinobi) => shinobi.name === name);
    res.writeHead(200, 'success', { 'Content-Type': 'text/html' });
    res.end(`<h1>${ninja.name}</h1>`);
  } else {
    res.writeHead(404, 'fail', { 'Content-Type': 'text/html' });
    res.end('<h1>Ninja not found</h1>');
  }
});

module.exports = app;

// ****** ANOTHER WAY TO USE new URL() to get the search params:
// const baseURL = `http://${req.headers.host}`;
// const requestURL = new URL(req.url, baseURL);

// requestURL variable contains the absolute URL.
// In this case it's http://localhost:8000/product?id=1
// Get the path name from URL: /product
// const pathname = requestURL.pathname;
// Get the query from the URL.
// const query = requestURL.searchParams.get('id');
// .searchParams returns this: URLSearchParams { 'id' => '1' }

// ****** ANOTHER WAY TO USE new URL() to get the search params:
// const { URL } = require('url');
// const { pathname, searchParams } = new URL(req.url, 'http://127.0.0.1/');
// After that I was able to use pathname for the url and searchParams to query for the users data like so searchParams.get('id').

// ****** ANOTHER WAY TO USE new URL() to get the search params:
// At the top  of your file, add this code:
// const querystring = require('querystring');

//Create the absolute URL. Combine baseurl with relative path(comes from req.url)
// const baseURL = `http://${req.headers.host}`;
// const requestURL = new URL(req.url, baseURL);
// Get's the relative path requested from the URL. In this case it's /product.
// const { pathname } = requestURL;
// Get's the query data from the URL. This is ?id=0 We store this in queryURL
// const queryURL = requestURL.search;
// Remove the ? from the ?id=0 before we make it into an object.
// const parseString = queryURL.substring(1);
// Parse the query into an object. Our object will be the query variable.
// const query = querystring.parse(parseString);

/* The query variable now holds this data(do a console.log to see):
[Object: null prototype] { id: '0' }
*/
