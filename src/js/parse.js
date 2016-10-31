'use strict';

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parse(data) {
  let countries = [];
  let text = data['parse']['text']['*'];

  // extract rows
  let trs = text.slice(text.indexOf('<table class="wikitable sortable">')).match(/<tr>([\s\S]*?)<\/tr>/g);

  trs.forEach(function(item) {
    // extract columns
    let tds = item.match(/<td>([\s\S]*?)<\/td>/g);

    if (tds) {
      countries.push({
        country: tds[1].match(/<a[^>]+>([\s\S]*?)<\/a>/)[1],
        male: +tds[3].match(/<td>([\s\S]*?)<\/td>/)[1],
        female: +tds[4].match(/<td>([\s\S]*?)<\/td>/)[1]
      });
    }
  });

  return countries;
}

export {parse};
