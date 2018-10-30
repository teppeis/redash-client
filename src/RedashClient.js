'use strict';

const fetch = require('cross-fetch');
const delay = require('delay');

const DEFAULT_POLLING_TIMEOUT_MS = 60 * 1000;

/**
 * Redash Client
 */
class RedashClient {
  /**
   * @param {{endPoint: string, apiToken: string, agent: ?http.Agent, authHeaderName: ?string}} options
   */
  constructor({endPoint, apiToken, agent, authHeaderName = 'Authorization'} = {}) {
    /**
     * @param {string} path
     * @param {Object=} body
     * @param {Object=} options
     * @return {Promise<Response>}
     * @private
     */
    this.fetchJson_ = (path, body, options = {}) => {
      options.headers = {
        ...options.headers,
        agent,
        [authHeaderName]: `Key ${apiToken}`,
        'content-type': 'application/json',
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      return fetch(endPoint + path, options).then(resp => resp.json());
    };
  }

  /**
   * @param {string} path
   * @return {Promise<Response>}
   * @private
   */
  get_(path) {
    const options = {
      method: 'GET',
    };
    return this.fetchJson_(path, null, options);
  }

  /**
   * @param {string} path
   * @param {Object=} body
   * @return {Promise<Response>}
   * @private
   */
  post_(path, body = {}) {
    const options = {
      method: 'POST',
    };
    return this.fetchJson_(path, body, options);
  }

  /**
   * @return {Promise<Array<DataSource>>}
   */
  getDataSources() {
    return this.get_(`api/data_sources`);
  }

  /**
   * @param {number} id
   * @return {Promise<DataSource>}
   */
  getDataSource(id) {
    if (typeof id !== 'number') {
      throw new TypeError(`Data Source ID should be number: ${id}`);
    }
    return this.get_(`api/data_sources/${id}`);
  }

  /**
   * @param {{query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  postQuery(query) {
    return this.post_('api/queries', query);
  }

  /**
   * @param {{id: number, query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  updateQuery(query) {
    if (typeof query.id !== 'number') {
      throw new TypeError(`Query ID should be number: ${query.id}`);
    }
    return this.post_(`api/queries/${query.id}`, query);
  }

  /**
   * @return {Promise<{count: number, page: number, page_size: number, results: Array<Query>}>}
   */
  getQueries() {
    return this.get_(`api/queries`);
  }

  /**
   * @param {number} id
   * @return {Promise<Query>}
   */
  getQuery(id) {
    return this.get_(`api/queries/${id}`);
  }

  /**
   * @param {{data_source_id: number, max_age: number, query: string, query_id: number}} query
   * @return {Promise<{job: Job}|{query_result: QueryResult}>}
   */
  postQueryResult(query) {
    return this.post_('api/query_results', query);
  }

  /**
   * @param {number} queryResultId
   * @return {Promise<{query_result: QueryResult}>}
   */
  getQueryResult(queryResultId) {
    if (typeof queryResultId !== 'number') {
      throw new TypeError(`Query Result ID should be number: ${queryResultId}`);
    }
    return this.get_(`api/query_results/${queryResultId}`);
  }

  /**
   * @param {number} id
   * @return {Promise<{job: Job}>}
   */
  getJob(id) {
    return this.get_(`api/jobs/${id}`);
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
