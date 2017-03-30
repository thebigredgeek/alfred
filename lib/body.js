const qs = require('querystring');
const Promise = require('bluebird');

const parseBody = req =>
  new Promise((resolve, reject) => {
    let body = '';

    req.on('data', data => {
      body += data;
      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) {
        req.connection.destroy();
        return reject(new Error('body too large'));
      }
    });

    req.on('end', () => {
      const data = qs.parse(body);
      return resolve(data);
    });

    req.on('error', err => reject(err));
  });

const middleware = () =>
  next =>
    async (req, res) => {
      req.body = await parseBody(req);
      next(req, res);
    };

module.exports = {
  middleware
};
