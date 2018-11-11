import {fetch, Headers} from 'cross-fetch';
import delay from 'delay';
import http from 'http';

const DEFAULT_POLLING_TIMEOUT_MS = 60 * 1000;

interface ConstructorOptions {
  endPoint: string;
  apiToken: string;
  agent?: http.Agent;
  authHeaderName?: string;
}

/**
 * Redash Client
 */
export default class RedashClient {
  private endPoint: string;
  private apiToken: string;
  private agent: http.Agent | null;
  private authHeaderName: string;
  constructor({endPoint, apiToken, agent, authHeaderName = 'Authorization'}: ConstructorOptions) {
    this.endPoint = endPoint;
    this.apiToken = apiToken;
    this.agent = agent || null;
    this.authHeaderName = authHeaderName;
  }

  private fetchJson_(
    path: string,
    body?: any,
    options: RequestInit & {agent?: http.Agent} = {} // append `agent` for node-fetch
  ): Promise<any> {
    if (!(options.headers instanceof Headers)) {
      options.headers = new Headers(options.headers || {});
    }
    options.headers.append(this.authHeaderName, `Key ${this.apiToken}`);
    options.headers.append('content-type', 'application/json');

    if (this.agent) {
      options.agent = this.agent;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(this.endPoint + path, options).then(resp => resp.json());
  }

  private get_(path: string): Promise<any> {
    const options = {
      method: 'GET',
    };
    return this.fetchJson_(path, null, options);
  }

  private post_(path: string, body = {}): Promise<any> {
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
  getDataSource(id: number) {
    if (typeof id !== 'number') {
      throw new TypeError(`Data Source ID should be number: ${id}`);
    }
    return this.get_(`api/data_sources/${id}`);
  }

  /**
   * @param {{query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  postQuery(query: any) {
    return this.post_('api/queries', query);
  }

  /**
   * @param {{id: number, query: string, data_source_id: number, name: string, description: string?}} query
   * @return {Promise<Query>}
   */
  updateQuery(query: any) {
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
  getQuery(id: number) {
    return this.get_(`api/queries/${id}`);
  }

  /**
   * @param {{data_source_id: number, max_age: number, query: string, query_id: number}} query
   * @return {Promise<{job: Job}|{query_result: QueryResult}>}
   */
  postQueryResult(query: any) {
    return this.post_('api/query_results', query);
  }

  /**
   * @param {number} queryResultId
   * @return {Promise<{query_result: QueryResult}>}
   */
  getQueryResult(queryResultId: number) {
    if (typeof queryResultId !== 'number') {
      throw new TypeError(`Query Result ID should be number: ${queryResultId}`);
    }
    return this.get_(`api/query_results/${queryResultId}`);
  }

  /**
   * @param {string} id
   * @return {Promise<{job: Job}>}
   */
  getJob(id: string) {
    return this.get_(`api/jobs/${id}`);
  }

  /**
   * @param {{data_source_id: number, query: string, query_id: number}} query
   * @param {number=} timeout
   * @return {Promise<{query_result: QueryResult}>}
   */
  async queryAndWaitResult(query: any, timeout: number = DEFAULT_POLLING_TIMEOUT_MS) {
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
