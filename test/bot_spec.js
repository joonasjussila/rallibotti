import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import axios from 'axios';
import mockAdapter from 'axios-mock-adapter';
import bot from '../src/bot';
import RallirekisteriApi from '../src/rallirekisteri_api';

chai.use(chaiAsPromised)

describe('Bot', () => {
  const speaker = 'joonas'
  const chan = '#avoltus-ricing'
  const mock = new mockAdapter(axios);
  var api = new RallirekisteriApi(axios, '');

  beforeEach(() => {
    mock.onPost('/api/addtime').reply(200, 'OK')
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
