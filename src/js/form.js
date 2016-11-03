'use strict';

import { getMaxAge, isDate, getWeeksFromDate } from './utils';
import { clearCells, renderCells } from './table';
import { loadCountries } from './select';

let sex = document.querySelectorAll('input[name="sex"]');
let date = document.getElementById('date');
let country = document.getElementById('country');

/**
 * получает дату рождения
 * @returns {date}
 */
function getBirthday() {
  let inputField = date.value.split('.');
  let birthday = new Date(inputField[2], inputField[1] - 1, inputField[0]);

  return birthday;
}

/**
 * проверяет возраст
 * @returns {boolean}
 */
function isValidAge() {
  const MAX_AGE = 122; // TODO: взять из кук
  // максимальная продолжительность жизни
  //getMaxAge();

  let today = new Date();
  let birthday = getBirthday();
  let maxAge = today.getFullYear() - MAX_AGE;

  return birthday < today && maxAge < birthday.getFullYear();
}

/**
 * проверяет валидность заполнения полей
 * @returns {boolean}
 */
function isValidFields() {
  let sex = document.querySelector('input[name="sex"]:checked');

  let isSexValid = Boolean(sex);
  let isCountryValid = Boolean(country.value);

  let isAgeValid = isValidAge();
  date.setCustomValidity(isAgeValid ? '' : 'Invalid');
  let isDateValid = isDate(date.value) && date.checkValidity();

  return isSexValid && isCountryValid && isDateValid && isAgeValid;
}

/**
 * получает продолжительность жизни в зависимости от пола
 * @returns {number}
 */
function getLifeExpectancyBySex() {
  let sex = document.querySelector('input[name="sex"]:checked');

  if (sex) return sex.value === 'Male' ? country.value.split(',')[0] :
    country.value.split(',')[1];
}

/**
 * обработчик формы
 */
function formHandler() {
  clearCells('table__active-cell');

  let elapsedWeeks = isValidFields() ? getWeeksFromDate( getBirthday() ) : 0;
  renderCells(true, elapsedWeeks);
}

/**
 * устанавливает возраст в зависимости от страны и пола
 */
function setAge() {
  const WEEKS_IN_YEAR = 52;

  let titleYears = document.querySelector('.main__years');
  let lifeExpectancy = getLifeExpectancyBySex();

  if (!lifeExpectancy) return;

  titleYears.innerHTML = Math.floor(lifeExpectancy);

  clearCells('table__disabled-cell');
  renderCells( false, Math.floor(lifeExpectancy * WEEKS_IN_YEAR) );
}

/**
 * назначает обработчики элементам
 */
function load() {
  Array.prototype.forEach.call(sex, function(item) {
    item.addEventListener('change', formHandler);
    item.addEventListener('change', setAge);
  });

  date.addEventListener('input', formHandler);

  country.addEventListener('change', formHandler);
  country.addEventListener('change', setAge);

  loadCountries();
}

export { load as loadForm };
