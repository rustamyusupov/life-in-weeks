'use strict';

import { httpRequest } from './load';
import { parse } from './parse';
import { sortArrayOfObjectsByKey } from './util'

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
 * callback-функция получает страны из запроса
 * @param {object} data страны
 */
function renderOptions(data) {
  let select = document.getElementById('country');

  // парсинг данных
  let countries = parse(data);

  // сортировка по стране
  let sortedCountries = sortArrayOfObjectsByKey(countries, 'country');

  // заполнение select
  sortedCountries.forEach(function(item) {
    let option = document.createElement('option');

    option.value = item['male'] + ',' + item['female'];
    option.text = item['country'];

    // вариант по умолчанию
    if (item['country'] === 'Russian Federation') option.selected = true;

    select.add(option);
  });
}

/**
 * отправляет запрос к wikipedia
 */
function loadSelect() {
  httpRequest(URL, QUERY, renderOptions);
}

export { loadSelect };
