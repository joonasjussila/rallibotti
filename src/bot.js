import { getNormalizedTime } from './time';
import format from 'date-fns/format'

function msg(from, to, message, api) {
  let trim = removePrefix(message)
  if (getNormalizedTime(trim)) {
    return timeResponse(getNormalizedTime(trim), from, api)
  } else if (isTrackCommand(trim)) {
    return trackResponse(api)
  } else if (isCarCommand(trim)) {
    return carResponse(api)
  }
  return Promise.resolve({})
}

function removePrefix(message) {
  return message.replace('rallibotti: ', '')
}

function timeResponse(time, from, api) {
  let date = format(new Date(), 'YYYY-MM-DD')
  return api.addTime(date, from, time).then((response) => {
    return {
      reply: 'OK: ' + time,
      apiResponse: response.data
    }
  })
}

function isTrackCommand(trim) {
  return (trim == '!track')
}

function isCarCommand(trim) {
  return (trim == '!car')
}

function trackResponse(api) {
  return api.getTimes().then((response) => {
    return {
      reply: response.data[0].track
    }
  })
}

function carResponse(api) {
  return api.getTimes().then((response) => {
    return {
      reply: response.data[0].car
    }
  })
}

module.exports = {
  msg: msg
}