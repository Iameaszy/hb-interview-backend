const chai = require('chai');
const request = require('supertest');
const { app, server } = require('./../../app');

const { expect } = chai;

describe('post /photo', () => {
  let token;
  before((done) => {
    request(app)
      .post('/login')
      .type('form')
      .send({ username: 'eayclick', password: 123456 })
      .end((err, res) => {
        if (err) return done(err);
        ({ token } = res.body);
        return done();
      });
  });
  it('should return 401 status code', (done) => {
    request(app)
      .post('/thumbnail/create')
      .expect(401, done);
  });
  it('should have a correct error text', (done) => {
    request(app)
      .post('/thumbnail/create')
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('Unauthorised Access');
        return done();
      });
  });
  it('should return 400 status code', (done) => {
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .expect(400, done);
  });

  it('should have a correct error text', (done) => {
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('Invalid url');
        return done();
      });
  });

  it('should return 400 status code', (done) => {
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        return done();
      });
  });

  it('should return 400 status code', (done) => {
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .type('form')
      .send({ url: 'https://aaa' })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(400);
        expect(res.text).to.equal('Invalid url');
        return done();
      });
  });

  it('should have a correct error text', (done) => {
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .send({ url: 'https://aaa' })
      .type('form')
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res.text).to.equal('Invalid url');
        return done();
      });
  });


  it('should return 401 status code ', (done) => {
    const invalidToken = 'aaa';
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', invalidToken)
      .type('form')
      .send({
        url:
          'https://e00-marca.uecdn.es/assets/multimedia/imagenes/2018/08/02/15332229122420.jpg',
      })
      .expect(401, done);
  });

  it('should return 401 status code ', (done) => {
    const invalidToken = 'aaa';
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', invalidToken)
      .type('form')
      .send({
        url:
          'https://e00-marca.uecdn.es/assets/multimedia/imagenes/2018/08/02/15332229122420.jpg',
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).to.equal('Invalid token');
        return done();
      });
  });

  it('should return 200 status code ', function waitIt(done) {
    this.timeout(20000);
    request(app)
      .post('/thumbnail/create')
      .set('Authorization', token)
      .type('form')
      .send({
        url:
          'https://e00-marca.uecdn.es/assets/multimedia/imagenes/2018/08/02/15332229122420.jpg',
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('image/png');
        return done();
      });
  });
});
