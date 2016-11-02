'use strict';

import { getMaxAge } from './utils';
import { getLifeExpectancy } from './select';
import { loadForm } from './form';

// максимальная продолжительность жизни
getMaxAge();

// средняя продолжительность жизни по странам
getLifeExpectancy();

// загрузка формы
loadForm();
