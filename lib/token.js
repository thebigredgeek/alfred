const { parse: parseUrl } = require('url');
const { parse: parseQueryString } = require('querystring');

const { sign, verify } = require('jsonwebtoken');

const { log } = require('./util');

const middleware = secret =>
  next =>
    (req, res) => {
      const query = parseQueryString(parseUrl(req.url).query);

      const { token } = query;

      if (!token) {
        log('request missing token parameter');
        res.writeHead(401);
        res.end('Missing token parameter');
        return;
      }

      try {
        const data = verify(token, secret);
        req.tokenId = data.id;
        req.tokenExpectedNumber = data.number;
        next(req, res);
      } catch (err) {
        log('request has invalid token parameter');
        res.writeHead(401);
        res.end('Invalid token parameter');
      }
    };

const factory = (
  {
    secret,
    number,
    id
  }
) =>
  sign(
    {
      number,
      id
    },
    secret
  );

module.exports = {
  middleware,
  factory
};
