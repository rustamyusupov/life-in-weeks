'use strict';

/**
 * очищает ячейки
 */
function clearCells() {
  let cells = document.querySelectorAll('.table__content li');

  Array.prototype.forEach.call(cells, function(item, i) {
    item.classList.remove('table__active-cell');
  });
}

/**
 * закрашивает ячейки
 * @param {number} count
 */
function renderCells(count) {
  let cells = document.querySelectorAll('.table__content li');

  Array.prototype.forEach.call(cells, function(item, i) {
    if (i < count) item.classList.add('table__active-cell');
  });
}

export { clearCells, renderCells };
