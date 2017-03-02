const {appendFile} = require('fs');
const _ = require('lodash');
const {StaticScraper} = require('scraperjs');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

scrapeForward();

function scrapeForward(date = new Date('2017-03-01')) {
  scrape(date)
  .then(entries => {
    const txt = entries.map(entry => JSON.stringify(entry) + '\n').join('');
    appendFile('/Users/lukas/Development/es-data/energy/data/weather.txt', txt, err => {
      const nextDate = new Date(date.getTime() + MS_PER_DAY);
      if (nextDate < Date.now()) scrapeForward(nextDate);
    });
  });
}

function scrape(date) {
  return StaticScraper.create(getUrl(date))
  .scrape($ => {
    const headers = $('#obsTable th').get()
    .map(th => $(th).text().trim())
    .map(_.snakeCase);

    return $('#obsTable tbody tr').get()
    .map(tr => {
      return $(tr).find('td').get()
      .map(td => $(td).text().trim());
    })
    .map(row => _.zipObject(headers, row))
    .map(entry => _.assign({date: getTimestamp(date, entry.time_mst)}, entry));
  });
}

function getUrl(date) {
  return `https://www.wunderground.com/history/airport/KIWA/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/DailyHistory.html`;
}

function getTimestamp(date, time) {
  return new Date(`${date.toISOString().substr(0, 10)} ${time}`);
}
