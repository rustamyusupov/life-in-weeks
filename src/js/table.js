'use strict';

let cells = document.querySelectorAll('.table__cell');

/**
 * очищает ячейки
 * @param {string} className
 */
function clearCells(className) {
  Array.prototype.forEach.call(cells, function(item, i) {
    item.classList.remove(className);
  });
}

/**
 * закрашивает ячейки
 * @param {boolean} isActive
 * @param {number} count
 */
function renderCells(isActive, count) {
  let className = isActive ? 'table__active-cell' : 'table__disabled-cell';

  if (count === 0) return;

  clearCells(className);

  Array.prototype.forEach.call(cells, function(item, i) {
    if (isActive ? i < count : i > count) item.classList.add(className);
  });
}

export { renderCells };
