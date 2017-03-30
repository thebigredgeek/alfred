const { log, compose } = require('./lib/util');
const environment = require('./lib/environment');
const { middleware: tokenMiddleware } = require('./lib/token');
const { middleware: bodyMiddleware } = require('./lib/body');
const handler = require('./lib/handler');

const logMiddleware = () =>
  next =>
    (req, res) => {
      log('receiving request');
      next(req, res);
    };

const {
  tokenSecret,
  toneDelay,
  toneSequence,
  welcomeMessage,
  welcomeLanguage,
  logsSecret
} = environment;

if (logsSecret) {
  require('now-logs')(logsSecret);
}

if (!tokenSecret) {
  throw new Error(
    'Alfred requires the environment variable TOKEN_SECRET to be set'
  );
}

if (!toneSequence) {
  throw new Error(
    'Alfred requires the environment variable TONE_SEQUENCE to be set'
  );
}

module.exports = compose(
  logMiddleware(),
  tokenMiddleware(tokenSecret),
  bodyMiddleware()
)(
  handler({
    toneDelay,
    toneSequence,
    welcomeMessage,
    welcomeLanguage
  })
);
