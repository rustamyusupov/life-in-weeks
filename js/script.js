(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadForm = undefined;

var _load = require('./load');

var _utils = require('./utils');

var _table = require('./table');

var _select = require('./select');

/**
 * @const
 * @type {number}
 */
var MAX_AGE = 122;

/**
 * @const
 * @type {number}
 */
var WEEKS_IN_YEAR = 52;

/**
 * @const
 * @type {string}
 */
var DEFAULT_COUNTRY = 'Russian Federation';

/**
 * @const
 * @type {string}
 */
var URL = 'https://en.wikipedia.org/w/api.php';

/**
 * @const
 * @type {string}
 */
var QUERY = {
  action: 'parse',
  page: 'List_of_the_verified_oldest_people',
  section: 1,
  prop: 'text',
  origin: '*',
  format: 'json'
};

/**
 * @const
 * @type {string}
 */
var EXPIRES_DAYS = 30;

var date = document.getElementById('date');

/**
 * получает пол
 * @returns {string}
 */
function getSex() {
  var sex = document.querySelector('input[name="sex"]:checked');

  return sex ? sex.value : '';
}

/**
 * получает дату рождения
 * @returns {date}
 */
function getBirthday() {
  var dateField = (0, _utils.isDate)(date.value) ? date.value.split('.') : '';

  return dateField ? new Date(dateField[2], dateField[1] - 1, dateField[0]) : '';
}

/**
 * получает страну
 * @returns {string}
 */
function getCountry() {
  var country = document.getElementById('country');
  var countryValue = country.options[country.selectedIndex].text;

  return country && country.selectedIndex ? countryValue : '';
}

/**
 * проверяет возраст
 * @returns {boolean}
 */
function isValidAge() {
  var today = new Date();
  var birthday = getBirthday();
  var minYear = today.getFullYear() - (parseInt((0, _utils.getStorage)('maxAge')) || MAX_AGE);

  return birthday ? birthday < today && minYear < birthday.getFullYear() : false;
}

/**
 * проверяет дату рождения
 * @returns {boolean}
 */
function isValidBirthday() {
  date.setCustomValidity('');

  var isValid = date.checkValidity() && isValidAge();
  date.setCustomValidity(isValid ? '' : 'Invalid');

  return isValid;
}

/**
 * устанавливает страну
 */
function setCountry(value) {
  var country = document.getElementById('country');

  Array.prototype.forEach.call(country.options, function (item) {
    if (item.text === value) item.selected = true;
  });
}

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parseData(data) {
  var ages = [];
  var text = data['parse']['text']['*'];

  // extract rows
  var trs = text.slice(text.indexOf('<table class="wikitable sortable">')).match(/<tr>([\s\S]*?)<\/tr>/g);

  // извлекает возраст
  function getAge(rows) {
    var age = 0;

    rows.forEach(function (item) {
      if (~item.indexOf('year')) age = parseInt(item.match(/<td>([\s\S]*?)<\/td>/)[1].split(' ')[0]);
    });

    return age;
  }

  trs.forEach(function (item) {
    var tds = item.match(/<td>([\s\S]*?)<\/td>/g);
    if (tds) ages.push(getAge(tds));
  });

  return Math.max.apply(Math, ages);
}

/**
 * получает продолжительность жизни
 * @returns {number}
 */
function getLifeExpectancy() {
  var country = document.getElementById('country');
  var sex = getSex();

  if (!sex) return;

  return parseInt(sex === 'Male' ? country.value.split(',')[0] : country.value.split(',')[1]);
}

/**
 * сохраняет максимальную продолжительность жизни
 */
function saveMaxAge(data) {
  var age = parseData(data);

  if (age) (0, _utils.setStorage)('maxAge', age, EXPIRES_DAYS);
}

/**
 * обновляет возраст в заголовке
 */
function updateTitleYears() {
  var titleYears = document.querySelector('.main__years');
  var lifeExpectancy = getLifeExpectancy();

  if (!lifeExpectancy) return;

  titleYears.innerHTML = Math.floor(lifeExpectancy);
}

/**
 * загружает данные
 */
function loadData() {
  var sexValue = (0, _utils.getStorage)('sex');
  var birthday = (0, _utils.getStorage)('birthday');
  var country = (0, _utils.getStorage)('country') || DEFAULT_COUNTRY;
  var maxAge = (0, _utils.getStorage)('maxAge');

  if (sexValue) document.getElementById(sexValue.toLowerCase()).checked = true;
  if (birthday) date.value = birthday;
  if (!maxAge) (0, _load.httpRequest)(URL, QUERY, saveMaxAge);

  setCountry(country);

  updateData(); // TODO: подумать!
}

/**
 * сохраняет введенные данные
 */
function saveData() {
  var sex = getSex();
  var country = getCountry();

  if (sex) (0, _utils.setStorage)('sex', sex);
  if (isValidBirthday()) (0, _utils.setStorage)('birthday', date.value);
  if (country) (0, _utils.setStorage)('country', country);
}

/**
 * обновляет таблицу
 */
function updateTable() {
  var isValidFields = Boolean(getSex()) && isValidBirthday();
  var elapsedWeeks = isValidFields ? (0, _utils.getWeeksFromDate)(getBirthday()) : 0;
  var lifeExpectancy = getLifeExpectancy();

  // прожитые недели
  (0, _table.renderCells)(true, elapsedWeeks);

  // средняя продолжительность
  (0, _table.renderCells)(false, Math.floor(lifeExpectancy * WEEKS_IN_YEAR));
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
  var sex = document.querySelectorAll('input[name="sex"]');
  var country = document.getElementById('country');

  Array.prototype.forEach.call(sex, function (item) {
    item.addEventListener('change', updateData);
  });
  date.addEventListener('input', updateData);
  country.addEventListener('change', updateData);
  document.addEventListener('selectLoaded', loadData);

  (0, _select.loadCountries)();
  loadData();
}

exports.loadForm = load;

},{"./load":2,"./select":4,"./table":5,"./utils":6}],2:[function(require,module,exports){
'use strict';

/**
 * callback получает данные из json запроса
 * @callback getData
 * @param {object} data набор данных
 */

/**
 * выполняет XMLHttpRequest запрос
 * @param {string} url адрес
 * @param {object} query объект с параметрами запроса
 * @param {getData} cb данные из запроса
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
function httpRequest(url, query, cb) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function (evt) {
    try {
      var loadedData = JSON.parse(evt.target.response);
      cb(loadedData);
    } catch (err) {
      console.log(err.message); // TODO: переделать
    }
  };

  var filter = Object.keys(query).map(function (key) {
    return key + '=' + query[key];
  });

  url += '?' + filter.join('&');

  xhr.open('GET', url);
  xhr.send();
}

exports.httpRequest = httpRequest;

},{}],3:[function(require,module,exports){
'use strict';

var _form = require('./form');

// загрузка формы
(0, _form.loadForm)();

},{"./form":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCountries = undefined;

var _load = require('./load');

var _utils = require('./utils');

/**
 * @const
 * @type {string}
 */
var URL = 'https://en.wikipedia.org/w/api.php';

/**
 * @const
 * @type {string}
 */
var QUERY = {
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
var EXPIRES_DAYS = 30;

/**
 * парсит данные
 * @param {object} data набор данных
 * @returns {array}
 */
function parseData(data) {
  var countries = {};
  var text = data['parse']['text']['*'];

  // extract rows
  var trs = text.slice(text.indexOf('<table class="wikitable sortable">')).match(/<tr>([\s\S]*?)<\/tr>/g);

  trs.forEach(function (item) {
    // extract columns
    var tds = item.match(/<td>([\s\S]*?)<\/td>/g);

    if (tds) {
      countries[tds[1].match(/<a[^>]+>([\s\S]*?)<\/a>/)[1]] = {
        male: +tds[3].match(/<td>([\s\S]*?)<\/td>/)[1],
        female: +tds[4].match(/<td>([\s\S]*?)<\/td>/)[1]
      };
    }
  });

  return countries;
}

/**
 * callback-функция получает страны из запроса
 * @param {object} data
 */
function countryProcessing(data) {
  var countries = parseData(data);
  var sortedCountries = (0, _utils.sortObject)(countries);

  if (!sortedCountries) return;

  renderOptions(sortedCountries);
  saveCountries(sortedCountries);
}

/**
 * наполняет select странами
 * @param {object} countries страны
 */
function renderOptions(countries) {
  var select = document.getElementById('country');
  var optionsFragment = document.createDocumentFragment();
  var selectEvent = new CustomEvent('selectLoaded');

  // наполнение select
  for (var item in countries) {
    var option = document.createElement('option');

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
  var strCountries = JSON.stringify(countries);

  (0, _utils.setStorage)('countries', strCountries, EXPIRES_DAYS);
}

/**
 * извлекает страны
 * @returns {object} countries
 */
function getCountries() {
  var strCountries = (0, _utils.getStorage)('countries');

  return JSON.parse(strCountries);
}

function loadCountries() {
  var countries = getCountries();

  if (countries) {
    renderOptions(countries);
  } else {
    (0, _load.httpRequest)(URL, QUERY, countryProcessing);
  }
}

exports.loadCountries = loadCountries;

},{"./load":2,"./utils":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var cells = document.querySelectorAll('.table__cell');

/**
 * очищает ячейки
 * @param {string} className
 */
function clearCells(className) {
  Array.prototype.forEach.call(cells, function (item, i) {
    item.classList.remove(className);
  });
}

/**
 * закрашивает ячейки
 * @param {boolean} isActive
 * @param {number} count
 */
function renderCells(isActive, count) {
  var className = isActive ? 'table__active-cell' : 'table__disabled-cell';

  if (count === 0) return;

  clearCells(className);

  Array.prototype.forEach.call(cells, function (item, i) {
    if (isActive ? i < count : i > count) item.classList.add(className);
  });
}

exports.renderCells = renderCells;

},{}],6:[function(require,module,exports){
'use strict';

// IE polyfill CustomEvent

Object.defineProperty(exports, "__esModule", {
  value: true
});
(function () {

  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

/**
 * @const
 * @type {number}
 */
var MILLISECONDS_IN_WEEKS = 1000 * 60 * 60 * 24 * 7;

/**
 * @const
 * @type {number}
 */
var MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

/**
 * @const
 * @type {number}
 */
var WEEKS_IN_YEAR = 52;

/**
 * проверяет дату по шаблону dd.mm.yyyy
 * @param {date} date дата
 * @returns {boolean}
 */
function isDate(date) {
  var today = new Date();
  var value = date.split('.');

  var day = Boolean(value[0]) && value[0].length === 2 ? +value[0] : 0;
  var month = Boolean(value[1]) && value[1].length === 2 ? +value[1] - 1 : 0;
  var year = Boolean(value[2]) && value[2].length === 4 ? +value[2] : 0;

  if (!(day && month && year)) return false;

  var birthday = new Date(year, month, day);

  var result = birthday.getFullYear() === year && birthday.getMonth() === month && +birthday.getDate() === day;

  return result;
}

/**
 * сортирует массив объектов по текстовому ключу
 * @param {array} array массив объектов
 * @param {string} key ключ сортировки
 * @returns {array}
 */
function sortArrayOfObjects(array, key) {
  return array.sort(function (a, b) {
    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
  });
}

/**
 * сортирует объект по ключу
 * @param {object} obj объект
 * @returns {object}
 */
function sortObject(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
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
  var today = new Date();

  // дата в текущем году
  var dateInThisYear = new Date(date.getTime());
  dateInThisYear.setFullYear(today.getFullYear());

  // прошла ли дата в текущем году?
  var isDateInFuture = dateInThisYear < today;

  // прожито полных лет в неделях
  var yearsInWeeks = (today.getFullYear() - date.getFullYear()) * WEEKS_IN_YEAR;

  // прожито недель в этом году (до или после даты)
  var diff = isDateInFuture ? today - dateInThisYear : dateInThisYear - today;
  var weeks = Math.floor(diff / MILLISECONDS_IN_WEEKS);

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
  var now = Date.now();
  var expires = localStorage.getItem(key + '_expires');

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
  var now = Date.now();
  var duration = now + expires * MILLISECONDS_IN_DAY;

  localStorage.setItem(key, value);
  if (expires) localStorage.setItem(key + '_expires', duration);
}

exports.sortObject = sortObject;
exports.isDate = isDate;
exports.getWeeksFromDate = getWeeksFromDate;
exports.getStorage = getStorage;
exports.setStorage = setStorage;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZm9ybS5qcyIsInNyYy9qcy9sb2FkLmpzIiwic3JjL2pzL3NjcmlwdC5qcyIsInNyYy9qcy9zZWxlY3QuanMiLCJzcmMvanMvdGFibGUuanMiLCJzcmMvanMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7O0FBSUEsSUFBTSxVQUFVLEdBQWhCOztBQUVBOzs7O0FBSUEsSUFBTSxnQkFBZ0IsRUFBdEI7O0FBRUE7Ozs7QUFJQSxJQUFNLGtCQUFrQixvQkFBeEI7O0FBRUE7Ozs7QUFJQSxJQUFNLE1BQU0sb0NBQVo7O0FBRUE7Ozs7QUFJQSxJQUFNLFFBQVE7QUFDWixVQUFRLE9BREk7QUFFWixRQUFNLG9DQUZNO0FBR1osV0FBUyxDQUhHO0FBSVosUUFBTSxNQUpNO0FBS1osVUFBUSxHQUxJO0FBTVosVUFBUTtBQU5JLENBQWQ7O0FBU0E7Ozs7QUFJQSxJQUFNLGVBQWUsRUFBckI7O0FBRUEsSUFBSSxPQUFPLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFYOztBQUVBOzs7O0FBSUEsU0FBUyxNQUFULEdBQWtCO0FBQ2hCLE1BQUksTUFBTSxTQUFTLGFBQVQsQ0FBdUIsMkJBQXZCLENBQVY7O0FBRUEsU0FBTyxNQUFNLElBQUksS0FBVixHQUFrQixFQUF6QjtBQUNEOztBQUVEOzs7O0FBSUEsU0FBUyxXQUFULEdBQXVCO0FBQ3JCLE1BQUksWUFBWSxtQkFBTyxLQUFLLEtBQVosSUFBcUIsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixHQUFqQixDQUFyQixHQUE2QyxFQUE3RDs7QUFFQSxTQUFPLFlBQVksSUFBSSxJQUFKLENBQVMsVUFBVSxDQUFWLENBQVQsRUFBdUIsVUFBVSxDQUFWLElBQWUsQ0FBdEMsRUFBeUMsVUFBVSxDQUFWLENBQXpDLENBQVosR0FBcUUsRUFBNUU7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TUFBTSxVQUEzQixFQUF1QyxRQUF2QztBQUNkOztRQUVRLFUsR0FBQSxVO1FBQVksTSxHQUFBLE07UUFBUSxnQixHQUFBLGdCO1FBQWtCLFUsR0FBQSxVO1FBQVksVSxHQUFBLFUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBodHRwUmVxdWVzdCB9IGZyb20gJy4vbG9hZCc7XG5pbXBvcnQgeyBpc0RhdGUsIGdldFdlZWtzRnJvbURhdGUsIGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGNsZWFyQ2VsbHMsIHJlbmRlckNlbGxzIH0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQgeyBsb2FkQ291bnRyaWVzIH0gZnJvbSAnLi9zZWxlY3QnO1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuY29uc3QgTUFYX0FHRSA9IDEyMjtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IFdFRUtTX0lOX1lFQVIgPSA1MjtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IERFRkFVTFRfQ09VTlRSWSA9ICdSdXNzaWFuIEZlZGVyYXRpb24nO1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuY29uc3QgVVJMID0gJ2h0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHAnO1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuY29uc3QgUVVFUlkgPSB7XG4gIGFjdGlvbjogJ3BhcnNlJyxcbiAgcGFnZTogJ0xpc3Rfb2ZfdGhlX3ZlcmlmaWVkX29sZGVzdF9wZW9wbGUnLFxuICBzZWN0aW9uOiAxLFxuICBwcm9wOiAndGV4dCcsXG4gIG9yaWdpbjogJyonLFxuICBmb3JtYXQ6ICdqc29uJ1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IEVYUElSRVNfREFZUyA9IDMwO1xuXG5sZXQgZGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYXRlJyk7XG5cbi8qKlxuICog0L/QvtC70YPRh9Cw0LXRgiDQv9C+0LtcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFNleCgpIHtcbiAgbGV0IHNleCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJzZXhcIl06Y2hlY2tlZCcpO1xuXG4gIHJldHVybiBzZXggPyBzZXgudmFsdWUgOiAnJztcbn1cblxuLyoqXG4gKiDQv9C+0LvRg9GH0LDQtdGCINC00LDRgtGDINGA0L7QttC00LXQvdC40Y9cbiAqIEByZXR1cm5zIHtkYXRlfVxuICovXG5mdW5jdGlvbiBnZXRCaXJ0aGRheSgpIHtcbiAgbGV0IGRhdGVGaWVsZCA9IGlzRGF0ZShkYXRlLnZhbHVlKSA/IGRhdGUudmFsdWUuc3BsaXQoJy4nKSA6ICcnO1xuXG4gIHJldHVybiBkYXRlRmllbGQgPyBuZXcgRGF0ZShkYXRlRmllbGRbMl0sIGRhdGVGaWVsZFsxXSAtIDEsIGRhdGVGaWVsZFswXSkgOiAnJztcbn1cblxuLyoqXG4gKiDQv9C+0LvRg9GH0LDQtdGCINGB0YLRgNCw0L3Rg1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0Q291bnRyeSgpIHtcbiAgbGV0IGNvdW50cnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRyeScpO1xuICBsZXQgY291bnRyeVZhbHVlID0gY291bnRyeS5vcHRpb25zW2NvdW50cnkuc2VsZWN0ZWRJbmRleF0udGV4dDtcblxuICByZXR1cm4gY291bnRyeSAmJiBjb3VudHJ5LnNlbGVjdGVkSW5kZXggPyBjb3VudHJ5VmFsdWUgOiAnJztcbn1cblxuLyoqXG4gKiDQv9GA0L7QstC10YDRj9C10YIg0LLQvtC30YDQsNGB0YJcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1ZhbGlkQWdlKCkge1xuICBsZXQgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBsZXQgYmlydGhkYXkgPSBnZXRCaXJ0aGRheSgpO1xuICBsZXQgbWluWWVhciA9IHRvZGF5LmdldEZ1bGxZZWFyKCkgLSAocGFyc2VJbnQoIGdldFN0b3JhZ2UoJ21heEFnZScpICkgfHwgTUFYX0FHRSk7XG5cbiAgcmV0dXJuIGJpcnRoZGF5ID8gYmlydGhkYXkgPCB0b2RheSAmJiBtaW5ZZWFyIDwgYmlydGhkYXkuZ2V0RnVsbFllYXIoKSA6IGZhbHNlO1xufVxuXG4vKipcbiAqINC/0YDQvtCy0LXRgNGP0LXRgiDQtNCw0YLRgyDRgNC+0LbQtNC10L3QuNGPXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNWYWxpZEJpcnRoZGF5KCkge1xuICBkYXRlLnNldEN1c3RvbVZhbGlkaXR5KCcnKTtcblxuICBsZXQgaXNWYWxpZCA9IGRhdGUuY2hlY2tWYWxpZGl0eSgpICYmIGlzVmFsaWRBZ2UoKTtcbiAgZGF0ZS5zZXRDdXN0b21WYWxpZGl0eShpc1ZhbGlkID8gJycgOiAnSW52YWxpZCcpO1xuXG4gIHJldHVybiBpc1ZhbGlkO1xufVxuXG4vKipcbiAqINGD0YHRgtCw0L3QsNCy0LvQuNCy0LDQtdGCINGB0YLRgNCw0L3Rg1xuICovXG5mdW5jdGlvbiBzZXRDb3VudHJ5KHZhbHVlKSB7XG4gIGxldCBjb3VudHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50cnknKTtcblxuICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGNvdW50cnkub3B0aW9ucywgZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmIChpdGVtLnRleHQgPT09IHZhbHVlKSBpdGVtLnNlbGVjdGVkID0gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qKlxuICog0L/QsNGA0YHQuNGCINC00LDQvdC90YvQtVxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEg0L3QsNCx0L7RgCDQtNCw0L3QvdGL0YVcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuZnVuY3Rpb24gcGFyc2VEYXRhKGRhdGEpIHtcbiAgbGV0IGFnZXMgPSBbXTtcbiAgbGV0IHRleHQgPSBkYXRhWydwYXJzZSddWyd0ZXh0J11bJyonXTtcblxuICAvLyBleHRyYWN0IHJvd3NcbiAgbGV0IHRycyA9IHRleHQuc2xpY2UodGV4dC5pbmRleE9mKCc8dGFibGUgY2xhc3M9XCJ3aWtpdGFibGUgc29ydGFibGVcIj4nKSkubWF0Y2goLzx0cj4oW1xcc1xcU10qPyk8XFwvdHI+L2cpO1xuXG4gIC8vINC40LfQstC70LXQutCw0LXRgiDQstC+0LfRgNCw0YHRglxuICBmdW5jdGlvbiBnZXRBZ2Uocm93cykge1xuICAgIGxldCBhZ2UgPSAwO1xuXG4gICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmICh+aXRlbS5pbmRleE9mKCd5ZWFyJykpXG4gICAgICAgIGFnZSA9IHBhcnNlSW50KChpdGVtLm1hdGNoKC88dGQ+KFtcXHNcXFNdKj8pPFxcL3RkPi8pWzFdKS5zcGxpdCgnICcpWzBdKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhZ2U7XG4gIH1cblxuICB0cnMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgbGV0IHRkcyA9IGl0ZW0ubWF0Y2goLzx0ZD4oW1xcc1xcU10qPyk8XFwvdGQ+L2cpO1xuICAgIGlmICh0ZHMpIGFnZXMucHVzaCggZ2V0QWdlKHRkcykgKTtcbiAgfSk7XG5cbiAgcmV0dXJuIE1hdGgubWF4KC4uLmFnZXMpO1xufVxuXG4vKipcbiAqINC/0L7Qu9GD0YfQsNC10YIg0L/RgNC+0LTQvtC70LbQuNGC0LXQu9GM0L3QvtGB0YLRjCDQttC40LfQvdC4XG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRMaWZlRXhwZWN0YW5jeSgpIHtcbiAgbGV0IGNvdW50cnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRyeScpO1xuICBsZXQgc2V4ID0gZ2V0U2V4KCk7XG5cbiAgaWYgKCFzZXgpIHJldHVybjtcblxuICByZXR1cm4gcGFyc2VJbnQoc2V4ID09PSAnTWFsZScgPyBjb3VudHJ5LnZhbHVlLnNwbGl0KCcsJylbMF0gOlxuICAgIGNvdW50cnkudmFsdWUuc3BsaXQoJywnKVsxXSk7XG59XG5cbi8qKlxuICog0YHQvtGF0YDQsNC90Y/QtdGCINC80LDQutGB0LjQvNCw0LvRjNC90YPRjiDQv9GA0L7QtNC+0LvQttC40YLQtdC70YzQvdC+0YHRgtGMINC20LjQt9C90LhcbiAqL1xuZnVuY3Rpb24gc2F2ZU1heEFnZShkYXRhKSB7XG4gIGxldCBhZ2UgPSBwYXJzZURhdGEoZGF0YSk7XG5cbiAgaWYgKGFnZSkgc2V0U3RvcmFnZSgnbWF4QWdlJywgYWdlLCBFWFBJUkVTX0RBWVMpO1xufVxuXG4vKipcbiAqINC+0LHQvdC+0LLQu9GP0LXRgiDQstC+0LfRgNCw0YHRgiDQsiDQt9Cw0LPQvtC70L7QstC60LVcbiAqL1xuZnVuY3Rpb24gdXBkYXRlVGl0bGVZZWFycygpIHtcbiAgbGV0IHRpdGxlWWVhcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbl9feWVhcnMnKTtcbiAgbGV0IGxpZmVFeHBlY3RhbmN5ID0gZ2V0TGlmZUV4cGVjdGFuY3koKTtcblxuICBpZiAoIWxpZmVFeHBlY3RhbmN5KSByZXR1cm47XG5cbiAgdGl0bGVZZWFycy5pbm5lckhUTUwgPSBNYXRoLmZsb29yKGxpZmVFeHBlY3RhbmN5KTtcbn1cblxuLyoqXG4gKiDQt9Cw0LPRgNGD0LbQsNC10YIg0LTQsNC90L3Ri9C1XG4gKi9cbmZ1bmN0aW9uIGxvYWREYXRhKCkge1xuICBsZXQgc2V4VmFsdWUgPSBnZXRTdG9yYWdlKCdzZXgnKTtcbiAgbGV0IGJpcnRoZGF5ID0gZ2V0U3RvcmFnZSgnYmlydGhkYXknKTtcbiAgbGV0IGNvdW50cnkgPSBnZXRTdG9yYWdlKCdjb3VudHJ5JykgfHwgREVGQVVMVF9DT1VOVFJZO1xuICBsZXQgbWF4QWdlID0gZ2V0U3RvcmFnZSgnbWF4QWdlJyk7XG5cbiAgaWYgKHNleFZhbHVlKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZXhWYWx1ZS50b0xvd2VyQ2FzZSgpKS5jaGVja2VkID0gdHJ1ZTtcbiAgaWYgKGJpcnRoZGF5KSBkYXRlLnZhbHVlID0gYmlydGhkYXk7XG4gIGlmICghbWF4QWdlKSBodHRwUmVxdWVzdChVUkwsIFFVRVJZLCBzYXZlTWF4QWdlKTtcblxuICBzZXRDb3VudHJ5KGNvdW50cnkpO1xuXG4gIHVwZGF0ZURhdGEoKTsgLy8gVE9ETzog0L/QvtC00YPQvNCw0YLRjCFcbn1cblxuLyoqXG4gKiDRgdC+0YXRgNCw0L3Rj9C10YIg0LLQstC10LTQtdC90L3Ri9C1INC00LDQvdC90YvQtVxuICovXG5mdW5jdGlvbiBzYXZlRGF0YSgpIHtcbiAgbGV0IHNleCA9IGdldFNleCgpO1xuICBsZXQgY291bnRyeSA9IGdldENvdW50cnkoKTtcblxuICBpZiAoc2V4KSBzZXRTdG9yYWdlKCdzZXgnLCBzZXgpO1xuICBpZiAoIGlzVmFsaWRCaXJ0aGRheSgpICkgc2V0U3RvcmFnZSgnYmlydGhkYXknLCBkYXRlLnZhbHVlKTtcbiAgaWYgKGNvdW50cnkpIHNldFN0b3JhZ2UoJ2NvdW50cnknLCBjb3VudHJ5KTtcbn1cblxuLyoqXG4gKiDQvtCx0L3QvtCy0LvRj9C10YIg0YLQsNCx0LvQuNGG0YNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlVGFibGUoKSB7XG4gIGxldCBpc1ZhbGlkRmllbGRzID0gQm9vbGVhbiggZ2V0U2V4KCkgKSAmJiBpc1ZhbGlkQmlydGhkYXkoKTtcbiAgbGV0IGVsYXBzZWRXZWVrcyA9IGlzVmFsaWRGaWVsZHMgPyBnZXRXZWVrc0Zyb21EYXRlKCBnZXRCaXJ0aGRheSgpICkgOiAwO1xuICBsZXQgbGlmZUV4cGVjdGFuY3kgPSBnZXRMaWZlRXhwZWN0YW5jeSgpO1xuXG4gIC8vINC/0YDQvtC20LjRgtGL0LUg0L3QtdC00LXQu9C4XG4gIHJlbmRlckNlbGxzKHRydWUsIGVsYXBzZWRXZWVrcyk7XG5cbiAgLy8g0YHRgNC10LTQvdGP0Y8g0L/RgNC+0LTQvtC70LbQuNGC0LXQu9GM0L3QvtGB0YLRjFxuICByZW5kZXJDZWxscyhmYWxzZSwgTWF0aC5mbG9vcihsaWZlRXhwZWN0YW5jeSAqIFdFRUtTX0lOX1lFQVIpICk7XG59XG5cbi8qKlxuICog0L7QsdC90L7QstC70Y/QtdGCINC00LDQvdC90YvQtVxuICovXG5mdW5jdGlvbiB1cGRhdGVEYXRhKCkge1xuICB1cGRhdGVUYWJsZSgpO1xuICB1cGRhdGVUaXRsZVllYXJzKCk7XG4gIHNhdmVEYXRhKCk7XG59XG5cbi8qKlxuICog0L3QsNC30L3QsNGH0LDQtdGCINC+0LHRgNCw0LHQvtGC0YfQuNC60Lgg0Y3Qu9C10LzQtdC90YLQsNC8XG4gKi9cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIGxldCBzZXggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFtuYW1lPVwic2V4XCJdJyk7XG4gIGxldCBjb3VudHJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50cnknKTtcblxuICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHNleCwgZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdXBkYXRlRGF0YSk7XG4gIH0pO1xuICBkYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgdXBkYXRlRGF0YSk7XG4gIGNvdW50cnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdXBkYXRlRGF0YSk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdExvYWRlZCcsIGxvYWREYXRhKTtcblxuICBsb2FkQ291bnRyaWVzKCk7XG4gIGxvYWREYXRhKCk7XG59XG5cbmV4cG9ydCB7IGxvYWQgYXMgbG9hZEZvcm0gfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBjYWxsYmFjayDQv9C+0LvRg9GH0LDQtdGCINC00LDQvdC90YvQtSDQuNC3IGpzb24g0LfQsNC/0YDQvtGB0LBcbiAqIEBjYWxsYmFjayBnZXREYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSDQvdCw0LHQvtGAINC00LDQvdC90YvRhVxuICovXG5cbi8qKlxuICog0LLRi9C/0L7Qu9C90Y/QtdGCIFhNTEh0dHBSZXF1ZXN0INC30LDQv9GA0L7RgVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCDQsNC00YDQtdGBXG4gKiBAcGFyYW0ge29iamVjdH0gcXVlcnkg0L7QsdGK0LXQutGCINGBINC/0LDRgNCw0LzQtdGC0YDQsNC80Lgg0LfQsNC/0YDQvtGB0LBcbiAqIEBwYXJhbSB7Z2V0RGF0YX0gY2Ig0LTQsNC90L3Ri9C1INC40Lcg0LfQsNC/0YDQvtGB0LBcbiAqL1xuZnVuY3Rpb24gaHR0cFJlcXVlc3QodXJsLCBxdWVyeSwgY2IpIHtcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbihldnQpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGxvYWRlZERhdGEgPSBKU09OLnBhcnNlKGV2dC50YXJnZXQucmVzcG9uc2UpO1xuICAgICAgY2IobG9hZGVkRGF0YSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7IC8vIFRPRE86INC/0LXRgNC10LTQtdC70LDRgtGMXG4gICAgfVxuICB9O1xuXG4gIGxldCBmaWx0ZXIgPSBPYmplY3Qua2V5cyhxdWVyeSkubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkgKyAnPScgKyBxdWVyeVtrZXldO1xuICB9KTtcblxuICB1cmwgKz0gJz8nICsgZmlsdGVyLmpvaW4oJyYnKTtcblxuICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgeGhyLnNlbmQoKTtcbn1cblxuZXhwb3J0IHtodHRwUmVxdWVzdH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGxvYWRGb3JtIH0gZnJvbSAnLi9mb3JtJztcblxuLy8g0LfQsNCz0YDRg9C30LrQsCDRhNC+0YDQvNGLXG5sb2FkRm9ybSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBodHRwUmVxdWVzdCB9IGZyb20gJy4vbG9hZCc7XG5pbXBvcnQgeyBzb3J0T2JqZWN0LCBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlIH0gZnJvbSAnLi91dGlscydcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFVSTCA9ICdodHRwczovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwJztcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFFVRVJZID0ge1xuICBhY3Rpb246ICdwYXJzZScsXG4gIHBhZ2U6ICdMaXN0X29mX2NvdW50cmllc19ieV9saWZlX2V4cGVjdGFuY3knLFxuICBzZWN0aW9uOiAzLFxuICBwcm9wOiAndGV4dCcsXG4gIG9yaWdpbjogJyonLFxuICBmb3JtYXQ6ICdqc29uJ1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IEVYUElSRVNfREFZUyA9IDMwO1xuXG4vKipcbiAqINC/0LDRgNGB0LjRgiDQtNCw0L3QvdGL0LVcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhINC90LDQsdC+0YAg0LTQsNC90L3Ri9GFXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlRGF0YShkYXRhKSB7XG4gIGxldCBjb3VudHJpZXMgPSB7fTtcbiAgbGV0IHRleHQgPSBkYXRhWydwYXJzZSddWyd0ZXh0J11bJyonXTtcblxuICAvLyBleHRyYWN0IHJvd3NcbiAgbGV0IHRycyA9IHRleHQuc2xpY2UodGV4dC5pbmRleE9mKCc8dGFibGUgY2xhc3M9XCJ3aWtpdGFibGUgc29ydGFibGVcIj4nKSkubWF0Y2goLzx0cj4oW1xcc1xcU10qPyk8XFwvdHI+L2cpO1xuXG4gIHRycy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAvLyBleHRyYWN0IGNvbHVtbnNcbiAgICBsZXQgdGRzID0gaXRlbS5tYXRjaCgvPHRkPihbXFxzXFxTXSo/KTxcXC90ZD4vZyk7XG5cbiAgICBpZiAodGRzKSB7XG4gICAgICBjb3VudHJpZXNbdGRzWzFdLm1hdGNoKC88YVtePl0rPihbXFxzXFxTXSo/KTxcXC9hPi8pWzFdXSA9IHtcbiAgICAgICAgbWFsZTogK3Rkc1szXS5tYXRjaCgvPHRkPihbXFxzXFxTXSo/KTxcXC90ZD4vKVsxXSxcbiAgICAgICAgZmVtYWxlOiArdGRzWzRdLm1hdGNoKC88dGQ+KFtcXHNcXFNdKj8pPFxcL3RkPi8pWzFdXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY291bnRyaWVzO1xufVxuXG4vKipcbiAqIGNhbGxiYWNrLdGE0YPQvdC60YbQuNGPINC/0L7Qu9GD0YfQsNC10YIg0YHRgtGA0LDQvdGLINC40Lcg0LfQsNC/0YDQvtGB0LBcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKi9cbmZ1bmN0aW9uIGNvdW50cnlQcm9jZXNzaW5nKGRhdGEpIHtcbiAgbGV0IGNvdW50cmllcyA9IHBhcnNlRGF0YShkYXRhKTtcbiAgbGV0IHNvcnRlZENvdW50cmllcyA9IHNvcnRPYmplY3QoY291bnRyaWVzKTtcblxuICBpZiAoIXNvcnRlZENvdW50cmllcykgcmV0dXJuO1xuXG4gIHJlbmRlck9wdGlvbnMoc29ydGVkQ291bnRyaWVzKTtcbiAgc2F2ZUNvdW50cmllcyhzb3J0ZWRDb3VudHJpZXMpO1xufVxuXG4vKipcbiAqINC90LDQv9C+0LvQvdGP0LXRgiBzZWxlY3Qg0YHRgtGA0LDQvdCw0LzQuFxuICogQHBhcmFtIHtvYmplY3R9IGNvdW50cmllcyDRgdGC0YDQsNC90YtcbiAqL1xuZnVuY3Rpb24gcmVuZGVyT3B0aW9ucyhjb3VudHJpZXMpIHtcbiAgbGV0IHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudHJ5Jyk7XG4gIGxldCBvcHRpb25zRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBzZWxlY3RFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnc2VsZWN0TG9hZGVkJyk7XG5cbiAgLy8g0L3QsNC/0L7Qu9C90LXQvdC40LUgc2VsZWN0XG4gIGZvciAobGV0IGl0ZW0gaW4gY291bnRyaWVzKSB7XG4gICAgbGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXG4gICAgb3B0aW9uLnZhbHVlID0gY291bnRyaWVzW2l0ZW1dWydtYWxlJ10gKyAnLCcgKyBjb3VudHJpZXNbaXRlbV1bJ2ZlbWFsZSddO1xuICAgIG9wdGlvbi50ZXh0ID0gaXRlbTtcbiAgICBvcHRpb25zRnJhZ21lbnQuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfVxuXG4gIHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb25zRnJhZ21lbnQpO1xuXG4gIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoc2VsZWN0RXZlbnQpO1xufVxuXG4vKipcbiAqINGB0L7RhdGA0LDQvdGP0LXRgiDRgdGC0YDQsNC90YtcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb3VudHJpZXNcbiAqL1xuZnVuY3Rpb24gc2F2ZUNvdW50cmllcyhjb3VudHJpZXMpIHtcbiAgbGV0IHN0ckNvdW50cmllcyA9IEpTT04uc3RyaW5naWZ5KGNvdW50cmllcyk7XG5cbiAgc2V0U3RvcmFnZSgnY291bnRyaWVzJywgc3RyQ291bnRyaWVzLCBFWFBJUkVTX0RBWVMpO1xufVxuXG4vKipcbiAqINC40LfQstC70LXQutCw0LXRgiDRgdGC0YDQsNC90YtcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvdW50cmllc1xuICovXG5mdW5jdGlvbiBnZXRDb3VudHJpZXMoKSB7XG4gIGxldCBzdHJDb3VudHJpZXMgPSBnZXRTdG9yYWdlKCdjb3VudHJpZXMnKTtcblxuICByZXR1cm4gSlNPTi5wYXJzZShzdHJDb3VudHJpZXMpO1xufVxuXG5mdW5jdGlvbiBsb2FkQ291bnRyaWVzKCkge1xuICBsZXQgY291bnRyaWVzID0gZ2V0Q291bnRyaWVzKCk7XG5cbiAgaWYgKGNvdW50cmllcykge1xuICAgIHJlbmRlck9wdGlvbnMoY291bnRyaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBodHRwUmVxdWVzdChVUkwsIFFVRVJZLCBjb3VudHJ5UHJvY2Vzc2luZyk7XG4gIH1cbn1cblxuZXhwb3J0IHsgbG9hZENvdW50cmllcyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgY2VsbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudGFibGVfX2NlbGwnKTtcblxuLyoqXG4gKiDQvtGH0LjRidCw0LXRgiDRj9GH0LXQudC60LhcbiAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWVcbiAqL1xuZnVuY3Rpb24gY2xlYXJDZWxscyhjbGFzc05hbWUpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChjZWxscywgZnVuY3Rpb24oaXRlbSwgaSkge1xuICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiDQt9Cw0LrRgNCw0YjQuNCy0LDQtdGCINGP0YfQtdC50LrQuFxuICogQHBhcmFtIHtib29sZWFufSBpc0FjdGl2ZVxuICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XG4gKi9cbmZ1bmN0aW9uIHJlbmRlckNlbGxzKGlzQWN0aXZlLCBjb3VudCkge1xuICBsZXQgY2xhc3NOYW1lID0gaXNBY3RpdmUgPyAndGFibGVfX2FjdGl2ZS1jZWxsJyA6ICd0YWJsZV9fZGlzYWJsZWQtY2VsbCc7XG5cbiAgaWYgKGNvdW50ID09PSAwKSByZXR1cm47XG5cbiAgY2xlYXJDZWxscyhjbGFzc05hbWUpO1xuXG4gIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoY2VsbHMsIGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICBpZiAoaXNBY3RpdmUgPyBpIDwgY291bnQgOiBpID4gY291bnQpIGl0ZW0uY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICB9KTtcbn1cblxuZXhwb3J0IHsgcmVuZGVyQ2VsbHMgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gSUUgcG9seWZpbGwgQ3VzdG9tRXZlbnRcbihmdW5jdGlvbiAoKSB7XG5cbiAgaWYgKCB0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSBcImZ1bmN0aW9uXCIgKSByZXR1cm4gZmFsc2U7XG5cbiAgZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKCBldmVudCwgcGFyYW1zICkge1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZSwgZGV0YWlsOiB1bmRlZmluZWQgfTtcbiAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdDdXN0b21FdmVudCcgKTtcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KCBldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsICk7XG4gICAgcmV0dXJuIGV2dDtcbiAgIH1cblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlO1xuXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IE1JTExJU0VDT05EU19JTl9XRUVLUyA9IDEwMDAgKiA2MCAqIDYwICogMjQgKiA3O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuY29uc3QgTUlMTElTRUNPTkRTX0lOX0RBWSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5jb25zdCBXRUVLU19JTl9ZRUFSID0gNTI7XG5cbi8qKlxuICog0L/RgNC+0LLQtdGA0Y/QtdGCINC00LDRgtGDINC/0L4g0YjQsNCx0LvQvtC90YMgZGQubW0ueXl5eVxuICogQHBhcmFtIHtkYXRlfSBkYXRlINC00LDRgtCwXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEYXRlKGRhdGUpIHtcbiAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgbGV0IHZhbHVlID0gZGF0ZS5zcGxpdCgnLicpO1xuXG4gIGxldCBkYXkgPSBCb29sZWFuKHZhbHVlWzBdKSAmJiB2YWx1ZVswXS5sZW5ndGggPT09IDIgPyArdmFsdWVbMF0gOiAwO1xuICBsZXQgbW9udGggPSBCb29sZWFuKHZhbHVlWzFdKSAmJiB2YWx1ZVsxXS5sZW5ndGggPT09IDIgPyArdmFsdWVbMV0gLSAxIDogMDtcbiAgbGV0IHllYXIgPSBCb29sZWFuKHZhbHVlWzJdKSAmJiB2YWx1ZVsyXS5sZW5ndGggPT09IDQgPyArdmFsdWVbMl0gOiAwO1xuXG4gIGlmICggIShkYXkgJiYgbW9udGggJiYgeWVhcikgKSByZXR1cm4gZmFsc2U7XG5cbiAgbGV0IGJpcnRoZGF5ID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRheSk7XG5cbiAgbGV0IHJlc3VsdCA9IGJpcnRoZGF5LmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiZcbiAgICAgICAgICAgICAgIGJpcnRoZGF5LmdldE1vbnRoKCkgPT09IG1vbnRoICYmXG4gICAgICAgICAgICAgICArYmlydGhkYXkuZ2V0RGF0ZSgpID09PSBkYXk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiDRgdC+0YDRgtC40YDRg9C10YIg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIg0L/QviDRgtC10LrRgdGC0L7QstC+0LzRgyDQutC70Y7Rh9GDXG4gKiBAcGFyYW0ge2FycmF5fSBhcnJheSDQvNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QslxuICogQHBhcmFtIHtzdHJpbmd9IGtleSDQutC70Y7RhyDRgdC+0YDRgtC40YDQvtCy0LrQuFxuICogQHJldHVybnMge2FycmF5fVxuICovXG5mdW5jdGlvbiBzb3J0QXJyYXlPZk9iamVjdHMoYXJyYXksIGtleSkge1xuICByZXR1cm4gYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGFba2V5XSA8IGJba2V5XSA/IC0xIDogYVtrZXldID4gYltrZXldID8gMSA6IDA7XG4gIH0pO1xufVxuXG4vKipcbiAqINGB0L7RgNGC0LjRgNGD0LXRgiDQvtCx0YrQtdC60YIg0L/QviDQutC70Y7Rh9GDXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqINC+0LHRitC10LrRglxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gc29ydE9iamVjdChvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikuc29ydCgpLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gb2JqW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwge30pO1xufVxuXG4vKipcbiAqINCy0YvRh9C40YHQu9GP0LXRgiDQutC+0LvQuNGH0LXRgdGC0LLQviDQv9GA0L7RiNC10LTRiNC40YUg0L3QtdC00LXQu9GMINGBINC30LDQtNCw0L3QvdC+0Lkg0LTQsNGC0YtcbiAqINC00L7Qv9GD0YnQtdC90LjQtTog0LrQvtC7LdCy0L4g0L3QtdC00LXQu9GMINCyINCz0L7QtNGDINGA0L7QstC90L4gNTIsXG4gKiDRgi7Qui4g0YLQsNCx0LvQuNGG0LAg0LTQu9GPINC60YDQsNGB0L7RgtGLINC40LzQtdC10YIgNTIg0Y/Rh9C10LnQutC4INCyINC60LDQttC00L7QuSDRgdGC0YDQvtC60LVcbiAqIEBwYXJhbSB7ZGF0ZX0gZGF0ZSDQtNCw0YLQsCDQvtGC0YHRh9C10YLQsFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0V2Vla3NGcm9tRGF0ZShkYXRlKSB7XG4gIGxldCB0b2RheSA9IG5ldyBEYXRlKCk7XG5cbiAgLy8g0LTQsNGC0LAg0LIg0YLQtdC60YPRidC10Lwg0LPQvtC00YNcbiAgbGV0IGRhdGVJblRoaXNZZWFyID0gbmV3IERhdGUoIGRhdGUuZ2V0VGltZSgpICk7XG4gIGRhdGVJblRoaXNZZWFyLnNldEZ1bGxZZWFyKCB0b2RheS5nZXRGdWxsWWVhcigpICk7XG5cbiAgLy8g0L/RgNC+0YjQu9CwINC70Lgg0LTQsNGC0LAg0LIg0YLQtdC60YPRidC10Lwg0LPQvtC00YM/XG4gIGxldCBpc0RhdGVJbkZ1dHVyZSA9IGRhdGVJblRoaXNZZWFyIDwgdG9kYXk7XG5cbiAgLy8g0L/RgNC+0LbQuNGC0L4g0L/QvtC70L3Ri9GFINC70LXRgiDQsiDQvdC10LTQtdC70Y/RhVxuICBsZXQgeWVhcnNJbldlZWtzID0gKCB0b2RheS5nZXRGdWxsWWVhcigpIC0gZGF0ZS5nZXRGdWxsWWVhcigpICkgKiBXRUVLU19JTl9ZRUFSO1xuXG4gIC8vINC/0YDQvtC20LjRgtC+INC90LXQtNC10LvRjCDQsiDRjdGC0L7QvCDQs9C+0LTRgyAo0LTQviDQuNC70Lgg0L/QvtGB0LvQtSDQtNCw0YLRiylcbiAgbGV0IGRpZmYgPSBpc0RhdGVJbkZ1dHVyZSA/IHRvZGF5IC0gZGF0ZUluVGhpc1llYXIgOiBkYXRlSW5UaGlzWWVhciAtIHRvZGF5O1xuICBsZXQgd2Vla3MgPSBNYXRoLmZsb29yKGRpZmYgLyBNSUxMSVNFQ09ORFNfSU5fV0VFS1MpO1xuXG4gIHJldHVybiBpc0RhdGVJbkZ1dHVyZSA/IHllYXJzSW5XZWVrcyArIHdlZWtzIDogeWVhcnNJbldlZWtzIC0gd2Vla3M7XG59XG5cbi8qKlxuICog0YPQtNCw0LvRj9C10YIg0LfQsNC/0LjRgdGMINC40LcgbG9jYWxTdG9yYWdlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5INC60LvRjtGHXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVN0b3JhZ2Uoa2V5KSB7XG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSArICdfZXhwaXJlcycpO1xufVxuXG4vKipcbiAqINC/0L7Qu9GD0YfQsNC10YIg0LfQvdCw0YfQtdC90LjQtSDQuNC3IGxvY2FsU3RvcmFnZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSDQutC70Y7Rh1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0U3RvcmFnZShrZXkpIHtcbiAgbGV0IG5vdyA9IERhdGUubm93KCk7XG4gIGxldCBleHBpcmVzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5ICsgJ19leHBpcmVzJyk7XG5cbiAgaWYgKCFleHBpcmVzIHx8IGV4cGlyZXMgPiBub3cpIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuXG4gIHJlbW92ZVN0b3JhZ2Uoa2V5KTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICog0LfQsNC/0LjRgdGL0LLQsNC10YIg0LfQvdCw0YfQtdC90LjQtSDQsiBsb2NhbFN0b3JhZ2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkg0LrQu9GO0YdcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSDQt9C90LDRh9C10L3QuNC1XG4gKiBAcGFyYW0ge251bWJlcn0gZXhwaXJlcyDQutC+0Lst0LLQviDQtNC90LXQuSDRhdGA0LDQvdC10L3QuNGPXG4gKi9cbmZ1bmN0aW9uIHNldFN0b3JhZ2Uoa2V5LCB2YWx1ZSwgZXhwaXJlcykge1xuICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcbiAgbGV0IGR1cmF0aW9uID0gbm93ICsgZXhwaXJlcyAqIE1JTExJU0VDT05EU19JTl9EQVk7XG5cbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gIGlmIChleHBpcmVzKSBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXkgKyAnX2V4cGlyZXMnLCBkdXJhdGlvbik7XG59XG5cbmV4cG9ydCB7IHNvcnRPYmplY3QsIGlzRGF0ZSwgZ2V0V2Vla3NGcm9tRGF0ZSwgZ2V0U3RvcmFnZSwgc2V0U3RvcmFnZSB9O1xuIl19
