import { observable, flow } from 'mobx';
import { Resource } from './resource';

export class PagingResource extends Resource {
  pagerData = [];
  page = 0;
  pageSize = 20;
  pagerExhausted = false;
  filters = {};

  setFilters = flow(function* (params) {
    this.filters = params;
    this.resetPager();
    yield this.fetchMore();
  });

  resetPager() {
    this.page = 0;
    this.pagerExhausted = false;
    this.pagerData = [];
  }

  refreshPager = flow(function* (params) {
    this.page = 0;
    this.pagerExhausted = false;

    if (this.pagerData.length > this.pageSize) {
      // slice data to be of length of the page size
      this.pagerData = this.pagerData.slice(0, this.pageSize);
    }

    yield this.fetchMore(params);
  });

  fetchMore = flow(function* (params) {
    if (this.pagerExhausted) return;

    this.loading = true;
    var page = this.page;
    try {
      let results = yield this.listApiHandler({
        ...params,
        ...this.filters,
        rows: this.pageSize,
        offset: this.pageSize * page,
      });
      results = results.map((result, index) => {
        this.datum[result.id] = this.listMapper(
          result,
          this.datum[result.id],
          index,
          results,
        );
        return result.id;
      });
      this.pagerData =
        this.page > 0 ? [...this.pagerData, ...results] : results;
      this.loading = false;
      this.loaded = true;
      this.page = page + 1;
      this.pagerExhausted = results.length < this.pageSize;
    } catch (e) {
      console.error(e);
      this.error = e;
      this.notification.showError(this.errorFormatter('list', e));
    }
  });
}

export default PagingResource;
