'use strict';

const axios = require('axios');
const delay = require('delay');

const DEFAULT_POLLING_TIMEOUT_MS = 60 * 1000;

/**
 * Redash Client
 */
class RedashClient {
  /**
   * @param {{endPoint: string, apiToken: string, authHeaderName: ?string}} options
   */
  constructor({endPoint, apiToken, authHeaderName = 'Authorization'} = {}) {
    /**
     * @type {axios}
     * @private
     */
    this.axios_ = axios.create({
      baseURL: endPoint,
      headers: {
        [authHeaderName]: `Key ${apiToken}`,
      },
    });
  }

  /**
   * @param {number} id
   * @return {Promise<DataSource>}
   */
  getDataSource(id) {
    if (typeof id !== 'number') {
      throw new TypeError(`Data Source ID should be number: ${id}`);
    }
    return this.axios_.get(`api/data_sources/${id}`).then(resp => resp.data);
  }

  /**
   * @return {Promise<Array<DataSource>>}
   */
  getDataSources() {
    return this.axios_.get(`api/data_sources`).then(resp => resp.data);
  }

  /**
   * @param {{query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  postQuery(query) {
    return this.axios_.post('api/queries', query).then(resp => resp.data);
  }

  /**
   * @param {{id: number, query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  updateQuery(query) {
    if (typeof query.id !== 'number') {
      throw new TypeError(`Query ID should be number: ${query.id}`);
    }
    return this.axios_.post(`api/queries/${query.id}`, query).then(resp => resp.data);
  }

  /**
   * @return {Promise<{count: number, page: number, page_size: number, results: Array<Query>}>}
   */
  getQueries() {
    return this.axios_.get(`api/queries`).then(resp => resp.data);
  }

  /**
   * @param {number} id
   * @return {Promise<Query>}
   */
  getQuery(id) {
    return this.axios_.get(`api/queries/${id}`).then(resp => resp.data);
  }

  /**
   * @param {number} id
   * @return {Promise<{job: Job}>}
   */
  getJob(id) {
    return this.axios_.get(`api/jobs/${id}`).then(resp => resp.data);
  }

  /**
   * @param {{data_source_id: number, max_age: number, query: string, query_id: number}} query
   * @return {Promise<{job: Job}|{query_result: QueryResult}>}
   */
  postQueryResult(query) {
    return this.axios_.post('api/query_results', query).then(resp => resp.data);
  }

  /**
   * @param {number} queryResultId
   * @return {Promise<{query_result: QueryResult}>}
   */
  getQueryResult(queryResultId) {
    if (typeof queryResultId !== 'number') {
      throw new TypeError(`Query Result ID should be number: ${queryResultId}`);
    }
    return this.axios_.get(`api/query_results/${queryResultId}`).then(resp => resp.data);
  }

  /**
   * @param {{data_source_id: number, max_age: number, query: string, query_id: number}} query
   * @param {number=} timeout
   * @return {Promise<{query_result: QueryResult}>}
   */
  async queryAndWaitResult(query, timeout = DEFAULT_POLLING_TIMEOUT_MS) {
    // `max_age` should be 0 to disable cache always
    query = {...query, max_age: 0};
    const {
      job: {id},
    } = await this.postQueryResult(query);
    let queryResultId;
    const start = Date.now();
    while (true) {
      const {job} = await this.getJob(id);
      if (job.status === 3) {
        queryResultId = job.query_result_id;
        break;
      }
      if (Date.now() - start > timeout) {
        throw new Error('polling timeout');
      }
      await delay(1000);
    }
    return this.getQueryResult(queryResultId);
  }
}

module.exports = RedashClient;
