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

export {sortArrayOfObjectsByKey};
