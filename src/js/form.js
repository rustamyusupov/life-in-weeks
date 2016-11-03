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

  if (sex) return sex.value === 'Male' ?
    Math.floor(country.value.split(',')[0]) : Math.floor(country.value.split(',')[1]);

  return null;
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
  clearCells();

  if ( isValidFields() ) renderCells( calculateElapsedWeeks() );
}

/**
 * устанавливает возраст в зависимости от страны и пола
 */
function setAge() {
  let titleYears = document.querySelector('.main__years');
  let lifeExpectancy = getLifeExpectancyBySex();

  titleYears.innerHTML = lifeExpectancy ? lifeExpectancy : 90;
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
