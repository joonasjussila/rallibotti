import irc from 'irc';
import axios from 'axios';
import RallirekisteriApi from './rallirekisteri_api';

var bot = require('./bot')

const channel = '#avoltus-ricing'
const apiUrl = 'http://debra.avoltus.net:8080'
const api = new RallirekisteriApi(axios, apiUrl)

var client = new irc.Client('irc.avoltus.net', 'rallibotti', {
  channels: [channel],
  retryDelay: 30000
});

client.addListener('raw', function (message) {
  if (message.command === 'ERROR') {
    console.log(message.command + ': ' + message.args);
  }
});

client.addListener('message', function (from, to, message) {
  bot.msg(from, to, message, api)
    .then((result) => {
      if (result.reply) {
        client.say(channel, result.reply)
      }
    })
});

client.addListener('pm', function (from, message) {
  console.log(from + ' => ME: ' + message);
});

client.addListener('error', function (message) {
  console.log('error: ', message);
});


if (module.hot) {
  module.hot.accept('./bot.js', function () {
    bot = require('./bot.js');
  });
}
