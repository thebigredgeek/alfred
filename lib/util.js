const debug = require('debug');

const log = debug('alfred');

const formatNumber = number => String(number).replace(/\D/g, '') || null;

const compose = (...fns) =>
  fns.reduce((fn, composed) => (...args) => fn(composed(...args)));

module.exports = {
  log,
  formatNumber,
  compose
};
