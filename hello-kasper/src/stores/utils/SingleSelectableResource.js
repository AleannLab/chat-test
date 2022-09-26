import { flow, observable } from 'mobx';
import { PagingResource } from './PagingResource';

export class SingleSelectableResource extends PagingResource {
  @observable selected = null;

  // prettier-ignore
  // eslint-disable-next-line require-yield
  select = flow(function* (id) { // NOSONAR
    if (id) {
      if (this.selected) {
        this.datum[this.selected].__isSelected = false;
      }
      this.datum[id].__isSelected = true;
      this.selected = id;
      this.onSelect();
    } else {
      if (this.selected) {
        this.datum[this.selected].__isSelected = false;
      }
      this.selected = null;
    }
  });

  onSelect = flow(function* () {});
}
