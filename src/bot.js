import { getNormalizedTime } from './time';
import format from 'date-fns/format'

function msg(from, to, message, api) {
  let time = getNormalizedTime(removePrefix(message))
  let date = format(new Date(), 'YYYY-MM-DD')
  if (time) {
    return api.addTime(date, from, time).then((response) => {
      return {
        reply: 'OK: ' + time,
        apiResponse: response.data
      }
    })
  }
  return Promise.resolve({})
}

function removePrefix(message) {
  return message.replace('rallibotti: ', '')
}

module.exports = {
  msg: msg
}