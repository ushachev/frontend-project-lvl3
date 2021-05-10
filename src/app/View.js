export default class View {
  constructor() {
    this.rssQuerySection = document.querySelector('#rssQuery');
    this.rssForm = document.querySelector('#rssForm');
    this.rssUrlInput = document.querySelector('#url');
    this.submitBtn = this.rssForm.querySelector('button[type="submit"]');
    this.feedback = document.querySelector('#feedback');
    this.feedsContainer = document.querySelector('#feedsContainer');
  }

  disableForm(isDisabled) {
    if (isDisabled) {
      this.rssUrlInput.setAttribute('disabled', true);
      this.submitBtn.setAttribute('disabled', true);
    } else {
      this.rssUrlInput.removeAttribute('disabled');
      this.submitBtn.removeAttribute('disabled');
    }
  }

  renderFeedback(state) {
    if (state.rssForm.status === 'success') {
      this.feedback.classList.remove('text-danger');
      this.feedback.classList.add('text-success');
      this.feedback.textContent = 'RSS loaded successfully';
    } else {
      this.feedback.classList.remove('text-success');
      this.feedback.classList.add('text-danger');
      this.feedback.textContent = state.rssForm.validationError;
    }
  }

  renderFeeds(feeds) {
    if (!this.feedList) {
      this.feedList = document.createElement('ul');
      this.feedList.classList.add('list-group');
      this.feedsContainer.append(this.feedList);
    }
    const feedItems = feeds.map((feed) => `<li class="list-group-item">${feed}</li>`);
    this.feedList.innerHTML = feedItems.join('\n');
  }
}
