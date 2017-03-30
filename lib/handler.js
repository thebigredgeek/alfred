const { send } = require('micro');
const twilio = require('twilio');
const sleep = require('then-sleep');

const { log, formatNumber } = require('./util');

// From -> https://evolution.voxeo.com/library/audio/prompts/dtmf/index.jsp
const hash = {
  '0': 'Dtmf-0.wav',
  '1': 'Dtmf-1.wav',
  '2': 'Dtmf-2.wav',
  '3': 'Dtmf-3.wav',
  '4': 'Dtmf-4.wav',
  '5': 'Dtmf-5.wav',
  '6': 'Dtmf-6.wav',
  '7': 'Dtmf-7.wav',
  '8': 'Dtmf-8.wav',
  '9': 'Dtmf-9.wav',
  '#': 'Dtmf-pound.wav',
  '*': 'Dtmf-star.wav'
};

module.exports = (
  {
    toneDelay = 0,
    toneSequence,
    welcomeMessage,
    welcomeLanguage = 'en-US'
  }
) =>
  async (req, res) => {
    await sleep(toneDelay);

    log('fielding request');

    const twiml = new twilio.TwimlResponse();

    if (welcomeMessage) {
      log(
        `playing welcome message "${welcomeMessage}" in locale "${welcomeLanguage}"`
      );
      twiml.say(welcomeMessage, {
        voice: 'alice',
        language: welcomeLanguage
      });
    }

    if (req.tokenExpectedNumber) {
      const { From } = req.body;
      if (formatNumber(From) !== req.tokenExpectedNumber) {
        log('expected number mismatch');
        return send(res, 401, 'Expected number mismatch');
      }
    }

    toneSequence
      .split('')
      .filter(t => Boolean(hash[t]))
      .map(
        t => `https://evolution.voxeo.com/library/audio/prompts/dtmf/${hash[t]}`
      )
      .map(url => twiml.play(url));

    // Render the response as XML in reply to the webhook request
    res.setHeader('Content-Type', 'text/xml');

    log('sending response to twilio');

    return send(res, 200, twiml.toString());
  };
