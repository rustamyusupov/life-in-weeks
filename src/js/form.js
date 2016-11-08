'use strict';

import { httpRequest } from './load';
import { isDate, getWeeksFromDate } from './utils';
import { clearCells, renderCells } from './table';
import { loadCountries } from './select';

/**
 * @const
 * @type {number}
 */
const MAX_AGE = 122;

/**
 * @const
 * @type {number}
 */
const WEEKS_IN_YEAR = 52;

/**
 * @const
 * @type {string}
 */
const DEFAULT_COUNTRY = 'Russian Federation';

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
  page: 'List_of_the_verified_oldest_people',
  section: 1,
  prop: 'text',
  origin: '*',
  format: 'json'
};

let date = document.getElementById('date');

/**
 * получает пол
 * @returns {string}
 */
function getSex() {
  let sex = document.querySelector('input[name="sex"]:checked');

  return sex ? sex.value : '';
}

/**
 * получает дату рождения
 * @returns {date}
 */
function getBirthday() {
  let dateField = isDate(date.value) ? date.value.split('.') : '';

  return dateField ? new Date(dateField[2], dateField[1] - 1, dateField[0]) : '';
}

/**
 * получает страну
 * @returns {string}
 */
function getCountry() {
  let country = document.getElementById('country');
  let countryValue = country.options[country.selectedIndex].text;

  return country && country.selectedIndex ? countryValue : '';
}

/**
 * проверяет возраст
 * @returns {boolean}
 */
function isValidAge() {
  let today = new Date();
  let birthday = getBirthday();
  let minYear = today.getFullYear() - (parseInt( localStorage.getItem('maxAge') ) || MAX_AGE);

  return birthday ? birthday < today && minYear < birthday.getFullYear() : false;
}

/**
 * проверяет дату рождения
 * @returns {boolean}
 */
function isValidBirthday() {
  date.setCustomValidity('');

  let isValid = date.checkValidity() && isValidAge();
  date.setCustomValidity(isValid ? '' : 'Invalid');

  return isValid;
}

/**
 * устанавливает страну
 */
function setCountry(value) {
  let country = document.getElementById('country');

  for(let option of country.options) {
    if (option.text === value) {
      option.selected = true;
      break;
    }
  }
}

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parseData(data) {
  let ages = [];
  let text = data['parse']['text']['*'];

  // extract rows
  let trs = text.slice(text.indexOf('<table class="wikitable sortable">')).match(/<tr>([\s\S]*?)<\/tr>/g);

  // извлекает возраст
  function getAge(rows) {
    let age = 0;

    rows.forEach(function(item) {
      if (~item.indexOf('year'))
        age = parseInt((item.match(/<td>([\s\S]*?)<\/td>/)[1]).split(' ')[0]);
    });

    return age;
  }

  trs.forEach(function(item) {
    let tds = item.match(/<td>([\s\S]*?)<\/td>/g);
    if (tds) ages.push( getAge(tds) );
  });

  return Math.max(...ages);
}

/**
 * получает продолжительность жизни
 * @returns {number}
 */
function getLifeExpectancy() {
  let country = document.getElementById('country');
  let sex = getSex();

  if (!sex) return;

  return parseInt(sex === 'Male' ? country.value.split(',')[0] :
    country.value.split(',')[1]);
}

/**
 * сохраняет максимальную продолжительность жизни
 */
function saveMaxAge(data) {
  let age = parseData(data);

  if (age) localStorage.setItem('maxAge', age);
}

/**
 * обновляет возраст в заголовке
 */
function updateTitleYears() {
  let titleYears = document.querySelector('.main__years');
  let lifeExpectancy = getLifeExpectancy();

  if (!lifeExpectancy) return;

  titleYears.innerHTML = Math.floor(lifeExpectancy);
}

/**
 * загружает данные
 */
function loadData() {
  let sexValue = localStorage.getItem('sex');
  let birthday = localStorage.getItem('birthday');
  let country = localStorage.getItem('country') || DEFAULT_COUNTRY;
  let maxAge = localStorage.getItem('maxAge');

  if (sexValue) document.getElementById(sexValue.toLowerCase()).checked = true;
  if (birthday) date.value = birthday;
  if (!maxAge) httpRequest(URL, QUERY, saveMaxAge);

  setCountry(country);

  updateData(); // TODO: подумать!
}

/**
 * сохраняет введенные данные
 */
function saveData() {
  let sex = getSex();
  let country = getCountry();

  if (sex) localStorage.setItem('sex', sex);
  if ( isValidBirthday() ) localStorage.setItem('birthday', date.value);
  if (country) localStorage.setItem('country', country);
}

/**
 * обновляет таблицу
 */
function updateTable() {
  let isValidFields = Boolean( getSex() ) && isValidBirthday() && Boolean( getCountry() );
  let elapsedWeeks = isValidFields ? getWeeksFromDate( getBirthday() ) : 0;
  let lifeExpectancy = getLifeExpectancy();

  // прожитые недели
  renderCells(true, elapsedWeeks);

  // средняя продолжительность
  renderCells(false, Math.floor(lifeExpectancy * WEEKS_IN_YEAR) );
}

/**
 * обновляет данные
 */
function updateData() {
  updateTable();
  updateTitleYears();
  saveData();
}

/**
 * назначает обработчики элементам
 */
function load() {
  let sex = document.querySelectorAll('input[name="sex"]');
  let country = document.getElementById('country');

  Array.prototype.forEach.call(sex, function(item) {
    item.addEventListener('change', updateData);
  });
  date.addEventListener('input', updateData);
  country.addEventListener('change', updateData);
  document.addEventListener('selectLoaded', loadData);

  loadCountries();
}

export { load as loadForm };
