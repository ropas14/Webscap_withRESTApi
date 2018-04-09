 let request = require('request');
 let cheerio = require('cheerio');
 let URL = require('url-parse');
 let saveToMongo = require('./saveCleansers')
 let EventEmitter = require('events');
 let start_url = "https://www.ewg.org/skindeep/browse.php?atatime=50&category=facial_cleanser&&showmore=products&atatime=50#";
 let pagesVisited = {};
 let promises = [];
 let pagesUrls = [];
 let numPagesVisited = 0;
 let pagesToVisit = [];
 let allinformation = [];
 let orgUrl = new URL(start_url);
 let baseUrl = orgUrl.protocol + "//" + orgUrl.hostname + "/";
 let MongoClient = require('mongodb').MongoClient
 const mongourl = "mongodb://localhost:27017/Sites"
 const emitter = new EventEmitter()
 emitter.setMaxListeners(100)
 pagesToVisit.push(start_url);
 crawl();

 function crawl() {
    if (pagesToVisit.length <= 0) {
       console.log("all pages have been visited");
       Promise.all(promises).then(function(values) {
             displayInformation();
             saveToMongo.closeConnection();
          })
          .catch(error => {
             console.log(error, +'Promise error');
          });
       return;
    }
    let nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
       // We've already visited this page, so repeat the crawl
       crawl();
    }
    else {
       // New page we haven't visited	
       visitPage(nextPage, crawl);
    }
 }
 async function visitPage(url, callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;
    // Make the request
    console.log("Visiting page " + url);
    let pageReq = pageRequest(url, callback);
    promises.push(pageReq);
    await pageReq.then(function(body) {
          let $ = cheerio.load(body);
          searchForContents($, url)
          collectLinks($);
          callback();
       }, function(err) {
          console.log(err);
          callback();
       })
       .catch(error => {
          console.log(error, +'Promise error');
       });
 }

 function pageRequest(url, callback) {
    return new Promise(function(resolve, reject) {
       // Asynchronous request and callback
       request.get(url, function(err, response, body) {
          if (err) {
             reject(err);
             callback();
          }
          else {
             resolve(body);
          }
       }).on('error', function(e) {
          console.log(e);
       }).end();
    });
 }

 function collectLinks($) {
    let nextPages = $('div#click_next_number>a')
    let tableLinks = $("table#table-browse > tbody > tr > td.product_name_list").find('a');
    if (nextPages != "") {
       nextPages.each(function() {
          let page_link = $(this).attr('href');
          if (page_link == null) {
             return;
          }
          if (page_link.startsWith("/")) {
             var address = baseUrl + page_link
             if (address in pagesVisited) {}
             else {
                pagesToVisit.push(address);
             }
          }
       });
    }
    if (tableLinks != "") {
       tableLinks.each(function() {
          let facial_link = $(this).attr('href');
          if (facial_link == null) {
             return;
          }
          if (facial_link.startsWith("/")) {
             var link = baseUrl + facial_link
             if (link in pagesVisited) {}
             else {
                pagesToVisit.push(link);
             }
          }
       });
    }
 }

 function searchForContents($, url) {
    let contentsHere = $('div#jumptohere.prodwrapperrightcol2012');
    if (contentsHere != "") {
       let brandName = contentsHere.find('div#righttoptitleandcats>h1').text();
       let ingreD = [];
       let worries = [];
       contentsHere.each(function() {
          let divTable = $('div.rightside_content2012>div#Ingredients>table.product_tables>tbody>tr');
          divTable.each(function() {
             let ingred = $(this).find('td.firstcol>a').text();
             ingreD.push(ingred);
             let worri = $(this).find('td:nth-child(2)').text();
             worries.push(worri);
          });
       });
       var Items = {
          url: url,
          brand: brandName,
          category: "Facial Cleanser",
          ingredients: ingreD,
          corcerns: worries,
       };
       saveToMongo.saveData(Items);
       allinformation.push(Items);
    }
 }

 function displayInformation($) {
    console.log(allinformation);
 }