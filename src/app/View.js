import Modal from 'bootstrap/js/dist/modal';

export default class View {
  constructor(i18nInstance) {
    this.i18n = i18nInstance;
    this.rssQuerySection = document.getElementById('rssQuery');
    this.rssForm = document.getElementById('rssForm');
    this.rssUrlInput = document.getElementById('url');
    this.submitBtn = this.rssForm.querySelector('button[type="submit"]');
    this.feedback = document.getElementById('feedback');
    this.feedsContainer = document.getElementById('feedsContainer');
    this.postsContainer = document.getElementById('postsContainer');

    this.modalTitle = document.getElementById('modalLabel');
    this.modalBody = document.querySelector('.modal-body');
    this.modalPostLink = document.getElementById('modalPostLink');
    this.modal = new Modal(document.getElementById('modal'));
  }

  init(handlers) {
    this.handlers = handlers;
    this.rssForm.addEventListener('submit', this.handlers.handleRssFormSubmit);
  }

  disableForm(isDisabled) {
    this.submitBtn.disabled = isDisabled;
    if (isDisabled) {
      this.rssUrlInput.setAttribute('readonly', '');
    } else {
      this.rssUrlInput.removeAttribute('readonly');
    }
  }

  renderFeedback({ rssForm: { processState, processResult } }) {
    const classValue = processState === 'completed' ? 'text-success' : 'text-danger';
    this.feedback.innerHTML = processResult === null
      ? ''
      : `<span class="${classValue}">${processResult}</span>`;
  }

  renderFeeds(feeds) {
    const feedItems = feeds.map(({ title, description }) => `
      <li class="list-group-item">
        <h3>${title}</h3>
        <p>${description}</p>
      </li>
    `);

    this.feedsContainer.innerHTML = `
      <h2>${this.i18n.t('elements.feedsTitle')}</h2>
      <ul class="list-group">
        ${feedItems.join('\n')}
      </ul>
    `;
  }

  renderPosts({ posts, shownPostsIds }) {
    const postItems = posts.map(({ id, title, link }) => {
      const linkClass = shownPostsIds.has(id) ? 'font-weight-normal' : 'font-weight-bold';

      return `
        <li class="list-group-item d-flex align-items-center p-3">
          <a href="${link}" class="${linkClass} me-auto" data-id="${id}" target="_blank">${title}</a>
          <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id="${
  id}">${this.i18n.t('elements.readButton')}</button>
        </li>
      `;
    });

    this.postsContainer.innerHTML = `
      <h2>${this.i18n.t('elements.postsTitle')}</h2>
      <ul class="list-group">
        ${postItems.join('\n')}
      </ul>
    `;

    const readPostButtons = this.postsContainer.querySelectorAll('button');
    [...readPostButtons]
      .forEach((button) => button.addEventListener('click', this.handlers.handleReadPostButton));
  }

  renderModal({ postToShowId, posts }) {
    const post = posts.find(({ id }) => id === postToShowId);
    const postLink = this.postsContainer.querySelector(`a[data-id="${postToShowId}"]`);

    this.modalTitle.textContent = post.title;
    this.modalBody.textContent = post.description;
    this.modalPostLink.href = post.link;

    this.modal.show();

    postLink.classList.remove('font-weight-bold');
    postLink.classList.add('font-weight-normal');
  }
}
