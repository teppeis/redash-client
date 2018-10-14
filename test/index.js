'use strict';

const Client = require('../');
const assert = require('assert');
const {back} = require('nock');
const nockBackMocha = require('@teppeis/nock-back-mocha')();

require('axios-debug-log');

/** @test {RedashClient} */
describe('RedashClient', () => {
  beforeEach(nockBackMocha.beforeEach);
  afterEach(nockBackMocha.afterEach);

  it('should be a constructor', () => {
    const client = new Client();
    assert(client instanceof Client);
  });

  describe('api', () => {
    let client;

    beforeEach(() => {
      client = new Client({
        endPoint: 'https://demo.redash.io/',
        apiToken: process.env.API_TOKEN || 'abc123',
      });
    });

    /** @test {RedashClient#getQuery} */
    it('getQuery', async () => {
      const actual = await client.getQuery(1);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
    });

    /** @test {RedashClient#getQueries} */
    it('getQueries', async () => {
      const actual = await client.getQueries();
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
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
    });

    /** @test {RedashClient#getJob} */
    it('getJob', async () => {
      const id = 'e9b927e0-f9eb-44b1-b03f-4644c6680993';
      const actual = await client.getJob(id);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
    });

    /** @test {RedashClient#getQueryResult} */
    it.skip('getQueryResult', async () => {
      const id = 4578008;
      const actual = await client.getQueryResult(id);
      const expectedBody = require(back.fixtureFile)[0].response;
      assert.deepEqual(actual, expectedBody);
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it.skip('queryAndWaitResult', async function() {
      this.timeout(10000);
      // const job1 = require('./fixtures/post-query_results-max_age_0');
      // const job2 = require('./fixtures/get-jobs-2');
      // const job3 = require('./fixtures/get-jobs-3');
      // const queryResult = require('./fixtures/get-query_results');

      // const jobId = job1.job.id;
      // const queryResultId = job3.job.query_result_id;
      // mock.onPost('/api/query_results').reply(200, job1);
      // mock.onGet(`/api/jobs/${jobId}`).replyOnce(200, job2);
      // mock.onGet(`/api/jobs/${jobId}`).replyOnce(200, job3);
      // mock.onGet(`/api/query_results/${queryResultId}`).reply(200, queryResult);

      const actual = await client.queryAndWaitResult({
        query: 'select * from cohort2',
        data_source_id: 2,
        max_age: 0,
      });
      assert.deepEqual(actual, {});
    });

    /** @test {RedashClient#queryAndWaitResult} */
    it.skip('queryAndWaitResult: timeout', function(done) {
      this.timeout(3000);

      // const job1 = require('./fixtures/post-query_results-max_age_0');
      // const job2 = require('./fixtures/get-jobs-2');
      //
      // const jobId = job1.job.id;
      // mock.onPost('/api/query_results').reply(200, job1);
      // mock.onGet(`/api/jobs/${jobId}`).reply(200, job2);

      client
        .queryAndWaitResult(
          {
            query: 'select * from cohort2',
            data_source_id: 2,
            max_age: 0,
          },
          1000
        )
        .catch(e => {
          assert(/polling timeout/.test(e.message));
          done();
        });
    });
  });
});
