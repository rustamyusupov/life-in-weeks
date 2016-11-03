'use strict';

import { httpRequest } from './load';
import { sortArrayOfObjectsByKey } from './utils'

/**
 * @const
 * @type {string}
 */
const URL = 'https://en.wikipedia.org/w/api.php';

/**
 * @const
 * @type {string}
 */
const QUERY = {
  action: 'parse',
  page: 'List_of_countries_by_life_expectancy',
  section: 3,
  prop: 'text',
  origin: '*',
  format: 'json'
};

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parseData(data) {
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

/**
 * callback-функция получает страны из запроса
 * @param {object} data страны
 */
function renderOptions(data) {
  let select = document.getElementById('country');

  // парсинг
  let countries = parseData(data);

  // сортировка по стране
  let sortedCountries = sortArrayOfObjectsByKey(countries, 'country');

  // наполнение select
  sortedCountries.forEach(function(item) {
    let option = document.createElement('option');

    option.value = item['male'] + ',' + item['female'];
    option.text = item['country'];

    // вариант по умолчанию
    if (item['country'] === 'Russian Federation') option.selected = true;

    // TODO: можно ли оптимизировать и вставлять скопом?
    select.add(option);
  });
}

/**
 * получает среднюю продолжительность жизни
 */
function loadCountries() {
  httpRequest(URL, QUERY, renderOptions);
}

export { loadCountries };
