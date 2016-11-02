'use strict';

import { isValidDate, getWeeksFromDate } from './utils';
import { clearCells, renderCells } from './table';

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
 * вычисляет количество оставшихся недель
 * @returns {number}
 */
function calculateElapsedWeeks() {
  let sex = document.querySelector('input[name="sex"]:checked');

  let expectancyValue = sex.value === 'Male' ? country.value.split(',')[0] : country.value.split(',')[1];

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
 * назначает обработчики элементам
 */
function load() {
  Array.prototype.forEach.call(sex, function(item) {
    item.addEventListener('change', formHandler);
  });
  date.addEventListener('input', formHandler);
  country.addEventListener('change', formHandler);
}

export { load as loadForm };
