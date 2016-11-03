'use strict';

import { getMaxAge, isValidDate, getWeeksFromDate } from './utils';
import { clearCells, renderCells } from './table';
import { getLifeExpectancy } from './select';

let sex = document.querySelectorAll('input[name="sex"]');
let date = document.getElementById('date');
let country = document.getElementById('country');

/**
 * проверяет валидность заполнения полей
 * @returns {boolean}
 */
function isValidFields() {
  let sex = document.querySelector('input[name="sex"]:checked');

  let isSexValid = Boolean(sex);
  let isCountryValid = Boolean(country.value);

  let isDateValid = isValidDate(date.value) && date.checkValidity();

  return isDateValid && isSexValid && isCountryValid;
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
 * вычисляет количество оставшихся недель
 * @returns {number}
 */
function calculateElapsedWeeks() {
  let val = date.value.split('.');
  let dateValue = new Date(val[2], val[1] - 1, val[0]);

  return getWeeksFromDate(dateValue);
}

/**
 * обработчик формы
 */
function formHandler() {
  clearCells('table__active-cell');

  if ( isValidFields() ) renderCells( true, calculateElapsedWeeks() );
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

  // средняя продолжительность жизни по странам
  getLifeExpectancy();
}

export { load as loadForm };
