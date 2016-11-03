'use strict';

import { httpRequest } from './load';

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

/**
 * получает максимальную продолжительность жизни
 */
function getMaxAge() {
  httpRequest(URL, QUERY, saveMaxAge);
}

/**
 * сохраняет максимальную продолжительность жизни
 */
function saveMaxAge(data) {
  console.log( parseData(data) ); // TODO: сохранить в куки
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
      if (~item.indexOf('year')) age = parseInt((item.match(/<td>([\s\S]*?)<\/td>/)[1]).split(' ')[0]);
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
 * проверяет дату по шаблону dd/mm/yyyy
 * @param {date} date дата
 * @returns {boolean}
 */
function isValidDate(date) {
  const MAX_AGE = 122; // TODO: взять из кук
  // максимальная продолжительность жизни
  //getMaxAge();

  let today = new Date();
  let val = date.split('.');
  let curDate = new Date(val[2], val[1] - 1, val[0]);
  let maxAge = today.getFullYear() - 122;

  // проверка на дату по шаблону
  let isDate = curDate.getFullYear() === +val[2] &&
               curDate.getMonth() === +val[1] - 1 &&
               +curDate.getDate() === +val[0];

  // проверка возраста
  let isValidAge = curDate < today && maxAge < curDate.getFullYear();

  return isDate && isValidAge;
}

/**
 * сортирует массив объектов по текстовому ключу
 * @param {array} array массив объектов
 * @param {string} key ключ сортировки
 * @returns {array}
 */
function sortArrayOfObjectsByKey(array, key) {
  return array.sort(function(a, b) {
    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
  });
}

/**
 * вычисляет количество прошедших недель с заданной даты
 * допущение: кол-во недель в году ровно 52,
 * т.к. таблица для красоты имеет 52 ячейки в каждой строке
 * @param {date} date дата отсчета
 * @returns {number}
 */
function getWeeksFromDate(date) {
  const MILLISECONDS_IN_WEEKS = 1000 * 60 * 60 * 24 * 7;
  const WEEKS_IN_YEAR = 52;

  let today = new Date();

  // дата в текущем году
  let dateInThisYear = new Date( date.getTime() );
  dateInThisYear.setFullYear( today.getFullYear() );

  // прошла ли дата в текущем году?
  let isDateInFuture = dateInThisYear < today;

  // прожито полных лет в неделях
  let yearsInWeeks = ( today.getFullYear() - date.getFullYear() ) * WEEKS_IN_YEAR;

  // прожито недель в этом году (до или после даты)
  let diff = isDateInFuture ? today - dateInThisYear : dateInThisYear - today;
  let weeks = Math.floor(diff / MILLISECONDS_IN_WEEKS);

  return isDateInFuture ? yearsInWeeks + weeks : yearsInWeeks - weeks;
}

export {sortArrayOfObjectsByKey, isValidDate, getWeeksFromDate};
