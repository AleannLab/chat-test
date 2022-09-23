import { observable } from 'mobx';

export class Notification {
  @observable message = '';
  @observable severity = 'info';
  @observable visible = false;
  autoHideDuration;
  anchorOrigin = { vertical: 'top', horizontal: 'right' };

  showInfo(message) {
    this.message = message;
    this.severity = 'info';
    this.visible = true;
  }

  showError(message) {
    this.message = message;
    this.severity = 'error';
    this.visible = true;
  }

  showSuccess(message) {
    this.message = message;
    this.severity = 'success';
    this.visible = true;
  }

  showWarning(message) {
    this.message = message;
    this.severity = 'warning';
    this.visible = true;
  }

  hideNotification() {
    this.message = '';
    this.visible = false;
  }
}
