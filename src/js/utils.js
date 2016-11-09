'use strict';

// IE polyfill CustomEvent
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/**
 * @const
 * @type {number}
 */
const MILLISECONDS_IN_WEEKS = 1000 * 60 * 60 * 24 * 7;

/**
 * @const
 * @type {number}
 */
const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

/**
 * @const
 * @type {number}
 */
const WEEKS_IN_YEAR = 52;

/**
 * проверяет дату по шаблону dd.mm.yyyy
 * @param {date} date дата
 * @returns {boolean}
 */
function isDate(date) {
  let today = new Date();
  let value = date.split('.');

  let day = Boolean(value[0]) && value[0].length === 2 ? +value[0] : 0;
  let month = Boolean(value[1]) && value[1].length === 2 ? +value[1] - 1 : 0;
  let year = Boolean(value[2]) && value[2].length === 4 ? +value[2] : 0;

  if ( !(day && month && year) ) return false;

  let birthday = new Date(year, month, day);

  let result = birthday.getFullYear() === year &&
               birthday.getMonth() === month &&
               +birthday.getDate() === day;

  return result;
}

/**
 * сортирует массив объектов по текстовому ключу
 * @param {array} array массив объектов
 * @param {string} key ключ сортировки
 * @returns {array}
 */
function sortArrayOfObjects(array, key) {
  return array.sort(function(a, b) {
    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
  });
}

/**
 * сортирует объект по ключу
 * @param {object} obj объект
 * @returns {object}
 */
function sortObject(obj) {
  return Object.keys(obj).sort().reduce(function(result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}

/**
 * вычисляет количество прошедших недель с заданной даты
 * допущение: кол-во недель в году ровно 52,
 * т.к. таблица для красоты имеет 52 ячейки в каждой строке
 * @param {date} date дата отсчета
 * @returns {number}
 */
function getWeeksFromDate(date) {
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

/**
 * удаляет запись из localStorage
 * @param {string} key ключ
 */
function removeStorage(key) {
  localStorage.removeItem(key);
  localStorage.removeItem(key + '_expires');
}

/**
 * получает значение из localStorage
 * @param {string} key ключ
 * @returns {string}
 */
function getStorage(key) {
  let now = Date.now();
  let expires = localStorage.getItem(key + '_expires');

  if (!expires || expires > now) return localStorage.getItem(key);

  removeStorage(key);
  return null;
}

/**
 * записывает значение в localStorage
 * @param {string} key ключ
 * @param {string} value значение
 * @param {number} expires кол-во дней хранения
 */
function setStorage(key, value, expires) {
  let now = Date.now();
  let duration = now + expires * MILLISECONDS_IN_DAY;

  localStorage.setItem(key, value);
  if (expires) localStorage.setItem(key + '_expires', duration);
}

export { sortObject, isDate, getWeeksFromDate, getStorage, setStorage };
