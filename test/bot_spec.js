import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import axios from 'axios';
import mockAdapter from 'axios-mock-adapter';
import apiTimesResponse from './resources/api_times_response.json';
import apiScoresResponse from './resources/api_scores_response.json';


import bot from '../src/bot';
import RallirekisteriApi from '../src/rallirekisteri_api';

chai.use(chaiAsPromised)

describe('Bot', () => {
  const speaker = 'joonas'
  const chan = '#avoltus-ricing'
  const mock = new mockAdapter(axios);
  var api = new RallirekisteriApi(axios, '');

  describe('time handler', () => {
    beforeEach(() => {
      mock.onPost('/api/addtime').reply(200, 'OK')
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
    })

    afterEach(() => {
      mock.reset();
    })

    it('should mock axios request', () => {
      axios.post('/api/addtime').then((resp) => {
        expect(resp.data).to.equal('OK')
        expect(resp.status).to.equal(200)
      })
    });

    it('should not reply to normal messages', (done) => {
      const msg = 'Linkki tuksuvideoon: https://www.youtube.com/watch?v=qiIYEmpWaaQ'
      expect(bot.msg(speaker, chan, msg, api)
      ).to.not.eventually.have.property("reply").notify(done);
    });

    it('should not reply to normal messages, which contain a time', (done) => {
      const msg = 'Entäs kun joku ehdottaa syömään klo 10:21, niin ottaako se senkin ajan?'
      expect(bot.msg(speaker, chan, msg, api)
      ).to.not.eventually.have.property("reply").notify(done);
    });

    it('should reply to messages that are a time', (done) => {
      expect(bot.msg(speaker, chan, '3:45.234', api))
        .to.eventually.have.property('reply').notify(done)
    });

    it('should contain standing in the reply on messages that are a time', (done) => {
      expect(bot.msg(speaker, chan, '3:45.234', api))
        .to.eventually.have.property('reply')
        .and.contain('toisena').notify(done)
    });

    it('should reply to messages that are a time and prefixed with nick', (done) => {
      expect(bot.msg(speaker, chan, 'rallibotti: 3:45.234', api))
        .to.eventually.have.property('reply').notify(done)
    });

    it('should contain the time in the reply', (done) => {
      let time = '3:45.234';
      expect(bot.msg(speaker, chan, time, api))
        .to.eventually.have.property('reply').and.contain(time)
        .notify(done)
    });

    it('should add trailing 9s if not given', (done) => {
      let time = '3:45.1';
      expect(bot.msg(speaker, chan, time, api))
        .to.eventually.have.property('reply').and.contain(time + '99')
        .notify(done)
    });

    it('should not reply to an invalid time', (done) => {
      let time = ':24.1';
      expect(bot.msg(speaker, chan, time, api))
        .to.not.eventually.have.property('reply')
        .notify(done)
    });

    it('should post valid times to rallirekisteri', (done) => {
      expect(bot.msg(speaker, chan, '3:45.223', api))
        .to.eventually.have.property('apiResponse')
        .and.equal('OK').notify(done)
    });
  });

  describe('info handler', () => {
    afterEach(() => {
      mock.reset();
    })

    it('should return track with !track', (done) => {
      mock.onGet('/api/times').reply(200, apiTimesResponse)
      expect(bot.msg(speaker, chan, '!track', api))
        .to.eventually.have.property('reply')
        .and.equal('Naarajärvi, Finland')
        .notify(done)
    })

    it('should return car with !car', (done) => {
      mock.onGet('/api/times').reply(200, apiTimesResponse)
      expect(bot.msg(speaker, chan, '!car', api))
        .to.eventually.have.property('reply')
        .and.equal('80\'s BMW')
        .notify(done)
    })

    it('should return best with !best', (done) => {
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
      expect(bot.msg(speaker, chan, '!best', api))
        .to.eventually.have.property('reply')
        .and.equal('heikki')
        .notify(done)
    })

    it('should return everyone who is not best with !worst', (done) => {
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
      expect(bot.msg(speaker, chan, '!worst', api))
        .to.eventually.have.property('reply')
        .and.equal('Petrattavaa: inummila, miksaa, tommik, kristian, joudah, joonas')
        .notify(done)
    })

    it('should reply when someone is feeling !sad', (done) => {
      expect(bot.msg(speaker, chan, '!sad', api))
        .to.eventually.have.property('reply')
        .notify(done)
    })

    it('should return position with !position', (done) => {
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
      expect(bot.msg(speaker, chan, '!position', api))
        .to.eventually.have.property('reply')
        .and.equal('joonas: Olet toisena.')
        .notify(done)
    })

    it('should encourage competition if a racer has not posted a time and calls !position', (done) => {
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
      expect(bot.msg('eiole', chan, '!position', api))
        .to.eventually.have.property('reply')
        .and.equal('eiole: Ei sijoitusta, ajamaan siittä.')
        .notify(done)
    })

    it('should give daily standings with !standings', (done) => {
      mock.onGet('/api/scores?resolution=day').reply(200, apiScoresResponse)
      expect(bot.msg(speaker, chan, '!standings', api))
        .to.eventually.have.property('reply')
        .and.equal('Sijoitukset tänään: 1. heikki, 2. joonas, 3. joudah, 4. kristian, 5. tommik, 6. miksaa, 7. inummila')
        .notify(done)
    })
  })
});
