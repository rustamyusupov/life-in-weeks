'use strict';

import { httpRequest } from './load';
import { sortObject, getStorage, setStorage } from './utils'

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
 * @const
 * @type {string}
 */
const EXPIRES_DAYS = 30;

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parseData(data) {
  let countries = {};
  let text = data['parse']['text']['*'];

  // extract rows
  let trs = text.slice(text.indexOf('<table class="wikitable sortable">')).match(/<tr>([\s\S]*?)<\/tr>/g);

  trs.forEach(function(item) {
    // extract columns
    let tds = item.match(/<td>([\s\S]*?)<\/td>/g);

    if (tds) {
      countries[tds[1].match(/<a[^>]+>([\s\S]*?)<\/a>/)[1]] = {
        male: +tds[3].match(/<td>([\s\S]*?)<\/td>/)[1],
        female: +tds[4].match(/<td>([\s\S]*?)<\/td>/)[1]
      }
    }
  });

  return countries;
}

/**
 * callback-функция получает страны из запроса
 * @param {object} data
 */
function countryProcessing(data) {
  let countries = parseData(data);
  let sortedCountries = sortObject(countries);

  if (!sortedCountries) return;

  renderOptions(sortedCountries);
  saveCountries(sortedCountries);
}

/**
 * наполняет select странами
 * @param {object} countries страны
 */
function renderOptions(countries) {
  let select = document.getElementById('country');
  let optionsFragment = document.createDocumentFragment();
  let selectEvent = new CustomEvent('selectLoaded');

  // наполнение select
  for (let item in countries) {
    let option = document.createElement('option');

    option.value = countries[item]['male'] + ',' + countries[item]['female'];
    option.text = item;
    optionsFragment.appendChild(option);
  }

  select.appendChild(optionsFragment);

  document.dispatchEvent(selectEvent);
}

/**
 * сохраняет страны
 * @param {object} countries
 */
function saveCountries(countries) {
  let strCountries = JSON.stringify(countries);

  setStorage('countries', strCountries, EXPIRES_DAYS);
}

/**
 * извлекает страны
 * @returns {object} countries
 */
function getCountries() {
  let strCountries = getStorage('countries');

  return JSON.parse(strCountries);
}

function loadCountries() {
  let countries = getCountries();

  if (countries) {
    renderOptions(countries);
  } else {
    httpRequest(URL, QUERY, countryProcessing);
  }
}

export { loadCountries };
