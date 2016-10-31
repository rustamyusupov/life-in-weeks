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
function httpRequest(url, query, cb) {
  let xhr = new XMLHttpRequest();

  xhr.onload = function(evt) {
    try {
      let loadedData = JSON.parse(evt.target.response);
      cb(loadedData);
    } catch (err) {
      console.log(err.message); // TODO: переделать
    }
  };

  let filter = Object.keys(query).map(function(key) {
    return key + '=' + query[key];
  });

  url += '?' + filter.join('&');

  xhr.open('GET', url);
  xhr.send();
}

export {httpRequest};
