import { getNormalizedTime } from './time';
import format from 'date-fns/format';
import standingTexts from './standing_texts';

function msg(from, to, message, api) {
  let trim = removePrefix(message)
  if (getNormalizedTime(trim)) {
    return timeResponse(getNormalizedTime(trim), from, api)
  } else if (trim === '!track') {
    return trackResponse(api)
  } else if (trim === '!car') {
    return carResponse(api)
  } else if (trim === '!best') {
    return bestResponse(api)
  } else if (trim === '!worst' || trim === '!loser') {
    return worstResponse(api)
  } else if (trim === '!sad') {
    return sadResponse(from)
  }
  return Promise.resolve({})
}

function removePrefix(message) {
  return message.replace('rallibotti: ', '')
}

function timeResponse(time, from, api) {
  let date = format(new Date(), 'YYYY-MM-DD')
  return api.addTime(date, from, time).then((response) => {
    return api.getScores('day').then((scores) => {
      let racerIndex = scores.data.day[0].findIndex((elem) => {
        return (elem.name === from)
      })
      if (racerIndex) {
        let standing = scores.data.day[0].length - racerIndex
        let text = standingTexts[standing]
        return {
          reply: 'OK: ' + time + ", olet " + text + ".",
          apiResponse: response.data
        }
      } else {
        return {
          reply: 'OK: ' + time,
          apiResponse: response.data
        }
      }
    })
  })
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

function bestResponse(api) {
  return api.getScores('day').then((response) => {
    let list = response.data.day[0]
    return {
      reply: list[list.length - 1].name
    }
  })
}

function worstResponse(api) {
  return api.getScores('day').then((response) => {
    let list = response.data.day[0]
    return {
      reply: 'Petrattavaa: ' + list.slice(0, list.length - 1).map((time) => time.name).join(', ')
    }
  })
}

function sadResponse(who) {
  const replies = [
    "Tell me how you’re feeling, I’ll probably understand how you feel more than you think.",
    "Even if it doesn’t seem that way right now, this feeling won’t last forever.",
    "Take your time, no-one is rushing you to feel better.",
    "I’m still here for you and I’m not going anywhere."
  ]
  return Promise.resolve({
    reply: who + ": " + replies[Math.floor(Math.random() * replies.length)]
  })
}

module.exports = {
  msg: msg
}