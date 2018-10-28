'use strict';

const Client = require('../');
const assert = require('assert');
const {back} = require('nock');
const nockBackMocha = require('@teppeis/nock-back-mocha')();

require('axios-debug-log');

/** @test {RedashClient} */
describe('RedashClient', () => {
  it('should be a constructor', () => {
    const client = new Client();
    assert(client instanceof Client);
  });

  describe('api', () => {
    let client;

    beforeEach(function() {
      client = new Client({
        endPoint: 'https://demo.redash.io/',
        apiToken: process.env.API_TOKEN || 'abc123',
      });
      return nockBackMocha.beforeEach.call(this);
    });

    afterEach(nockBackMocha.afterEach);

    // /** @test {RedashClient#getDataSource} */
    // it('getDataSource', async () => {
    //   const expectedBody = require('./fixtures/get-data_source');
    //
    //   const {id} = expectedBody;
    //   mock.onGet(`/api/data_sources/${id}`).reply(200, expectedBody);
    //   const actual = await client.getDataSource(id);
    //   assert.deepEqual(actual, expectedBody);
    // });
    //
    // /** @test {RedashClient#getDataSources} */
    // it('getDataSources', async () => {
    //   const expectedBody = require('./fixtures/get-data_sources');
    //
    //   mock.onGet(`/api/data_sources`).reply(200, expectedBody);
    //   const actual = await client.getDataSources();
    //   assert.deepEqual(actual, expectedBody);
    // });

    /** @test {RedashClient#getQuery} */
    it('getQuery', async () => {
      const actual = await client.getQuery(1);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#getQueries} */
    it('getQueries', async () => {
      const actual = await client.getQueries();
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#postQuery} */
    it('postQuery with max_age = 0', async () => {
      const actual = await client.postQuery({
        query: 'select * from cohort2',
        data_source_id: 2,
        max_age: 0,
      });
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#getJob} */
    it('getJob', async () => {
      const id = 'e9b927e0-f9eb-44b1-b03f-4644c6680993';
      const actual = await client.getJob(id);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#getQueryResult} */
    it('getQueryResult', async () => {
      const id = 4766466;
      const actual = await client.getQueryResult(id);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it('queryAndWaitResult', async () => {
      client = new Client({
        endPoint: 'http://localhost:5000/',
        apiToken: process.env.API_TOKEN || 'abc123',
      });
      const actual = await client.queryAndWaitResult({
        query: '1E7lGYcgerhmYmKsfN7ReRulItby_tm8ivfTvuQD-TBM',
        data_source_id: 1,
        max_age: 0,
      });
      const requests = require(back.fixtureFile);
      const lastRequest = requests[requests.length - 1];
      assert(/^\/api\/query_results\/\d+/.test(lastRequest.path));
      assert(lastRequest.status === 200);
      assert.deepEqual(actual, lastRequest.response);
      back.assertScopesFinished();
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it('queryAndWaitResult: timeout', () =>
      client
        .queryAndWaitResult(
          {
            query: 'select * from cohort2',
            data_source_id: 2,
            max_age: 0,
          },
          1000
        )
        .then(
          () => assert.fail('should be rejected'),
          e => {
            assert(/polling timeout/.test(e.message));
            back.assertScopesFinished();
          }
        ));
  });
});
