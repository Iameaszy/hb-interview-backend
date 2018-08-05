const chai = require('chai');
const request = require('supertest');
const { app, server } = require('./../../app');

const { expect } = chai;
/** *********************** */
after(() => {
  server.close();
});
describe('post /login', () => {
  it('should have 200 response status code', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({ username: 'easyclick', password: 123456 })
      .expect(200, done);
  });
  it('should have 400 response status code', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({ username: 'easyclick' })
      .expect(400, done);
  });
  it('should have 400 response status code', (done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({ password: 123456 })
      .expect(400, done);
  });

  it('should reply with a valid data', async () => {
    let res;
    try {
      res = await request(app)
        .post('/login')
        .type('form')
        .send({ username: 'easyclick', password: 123456 });
    } catch (e) {
      expect(e).to.be.null;
    }

    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('token');
  });
});

describe('post /patch', () => {
  let token;
  before((done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({ username: 'easyclick', password: 123456 })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        ({ token } = res.body);
        return done();
      });
  });

  it('should have 401 response status code', (done) => {
    const invalidToken = 'aaaa';
    request(app)
      .post('/patch')
      .type('form')
      .set('Authorization', invalidToken)
      .send({ username: 'easyclick', password: 123456 })
      .expect(401, done);
  });

  it('should have Invalid token as error response text', (done) => {
    const invalidToken = 'aaaa';
    request(app)
      .post('/patch')
      .type('form')
      .set('Authorization', invalidToken)
      .send({
        data: { name: 'Yusuf' },
        patch: [{ op: 'replace', path: '/name', value: 'Ayinla' }],
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('Invalid token');
        done();
      });
  });

  it('should have 401 response status code', (done) => {
    request(app)
      .post('/patch')
      .type('form')
      .expect(401, done);
  });

  it('should have Unauthorised Access as error response text', (done) => {
    request(app)
      .post('/patch')
      .type('form')
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('Unauthorised Access');
        done();
      });
  });

  it('should have 400 response status code', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .expect(400, done);
  });
  it('should have 200 response status code', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({
        data: { name: 'Yusuf' },
        patch: [{ op: 'replace', path: '/name', value: 'Ayinla' }],
      })
      .expect(200, done);
  });

  it('should have 400 response status code', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({ data: { name: 'Yusuf' } })
      .expect(400, done);
  });

  it('should have invalid data or patch as error response text', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({ data: { name: 'Yusuf' } })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('invalid data or patch');
        done();
      });
  });

  it('should have invalid data or patch as error response text', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({ patch: [{ op: 'replace', path: '/name', value: 'Ayinla' }] })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('invalid data or patch');
        done();
      });
  });
  it('should apply patch correctly', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({
        data: { name: 'Yusuf' },
        patch: [{ op: 'replace', path: '/name', value: 'Ayinla' }],
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.body)
          .to.have.property('name')
          .to.equal('Ayinla');
        return done();
      });
  });

  it('should have 400 status code', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({
        data: { name: 'Yusuf' },
        patch: [{ op: 'replace', path: '/nam/1', value: 'Ayinla' }],
      })
      .expect(400, done);
  });

  it('should return a correct error text', (done) => {
    request(app)
      .post('/patch')
      .set('Authorization', token)
      .type('form')
      .send({
        data: { name: 'Yusuf' },
        patch: [{ op: 'replace', path: '/nam/1', value: 'Ayinla' }],
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).to.equal('Invalid patch values');

        return done();
      });
  });
});
