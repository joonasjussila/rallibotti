
export default class RallirekisteriApi {

  constructor(axios, apiUrl) {
    this.axios = axios
    this.apiUrl = apiUrl
  }

  addTime(date, name, time) {
    console.log("Posting to " + this.apiUrl + ": " + date + " - " + name + ": " + time)
    return this.axios.post(this.apiUrl + '/api/addtime', {
      date: date,
      name: name,
      time: time
    })
  }

  getTimes() {
    return this.axios.get(this.apiUrl + '/api/times')
  }
}
