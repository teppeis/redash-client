'use strict';

const Client = require('../');
const assert = require('assert');
const nockBackMochaFactory = require('@teppeis/nock-back-mocha');
const nockBackMocha = nockBackMochaFactory();

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
        endPoint: 'http://localhost/',
        // apiToken: process.env.API_TOKEN || 'abc123',
        apiToken: process.env.API_TOKEN || 'fK3nBy18rt1lBadzmumWdqJrJaFCUEeLBcdgWfrV',
      });
      return nockBackMocha.beforeEach.call(this);
    });

    afterEach(nockBackMocha.afterEach);

    /** @test {RedashClient#getDataSources} */
    it('getDataSources', async () => {
      const actual = await client.getDataSources();
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
    });

    /** @test {RedashClient#getDataSource} */
    it('getDataSource', async () => {
      const actual = await client.getDataSource(1);
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
    });

    /** @test {RedashClient#postQuery} */
    it('postQuery', async () => {
      const actual = await client.postQuery({
        query: 'select * from actor',
        data_source_id: 1,
        name: 'List Actors',
      });
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#getQueries} */
    it('getQueries', async () => {
      const actual = await client.getQueries();
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#getQuery} */
    it('getQuery', async () => {
      const actual = await client.getQuery(2);
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#updateQuery} */
    it('updateQuery', async () => {
      const actual = await client.postQuery({
        id: 3,
        query: 'select * from actor limit 10',
        data_source_id: 1,
        name: 'Top 10 Actors',
      });
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#postQueryResult} */
    it('postQueryResult with max_age = 0', async () => {
      const actual = await client.postQueryResult({
        query: 'select * from actor',
        data_source_id: 1,
        max_age: 0,
      });
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#getQueryResult} */
    it('getQueryResult', async () => {
      const id = 5;
      const actual = await client.getQueryResult(id);
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#getJob} */
    it('getJob', async () => {
      const id = 'a8822893-7614-4b35-b90d-6ae2dcb44e69';
      const actual = await client.getJob(id);
      const expectedBody = require(nockBackMocha.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it('queryAndWaitResult', async () => {
      const actual = await client.queryAndWaitResult({
        query: 'select * from actor limit 5',
        data_source_id: 1,
        max_age: 0,
      });
      const requests = require(nockBackMocha.fixtureFile);
      const lastRequest = requests[requests.length - 1];
      assert(/^\/api\/query_results\/\d+/.test(lastRequest.path));
      assert(lastRequest.status === 200);
      assert.deepEqual(actual, lastRequest.response);
      nockBackMocha.assertScopesFinished();
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it('queryAndWaitResult: timeout', () =>
      client
        .queryAndWaitResult(
          {
            query: 'select * from actor limit 5',
            data_source_id: 1,
            max_age: 0,
          },
          10
        )
        .then(
          () => assert.fail('should be rejected'),
          e => {
            assert(/polling timeout/.test(e.message));
            nockBackMocha.assertScopesFinished();
          }
        ));
  });
});
