/* eslint-disable no-param-reassign */

import Modal from 'bootstrap/js/dist/modal';
import onChange from 'on-change';

const renderForm = (state, elements) => {
  switch (state.rssForm.processState) {
    case 'filling':
      elements.submitBtn.disabled = false;
      elements.rssUrlInput.removeAttribute('readonly');
      elements.rssUrlInput.focus();
      break;

    case 'processing':
      elements.submitBtn.disabled = true;
      elements.rssUrlInput.setAttribute('readonly', '');
      break;

    case 'completed':
      elements.rssForm.reset();
      break;

    default:
      throw Error(`Unknown form state: ${state.rssForm.processState}`);
  }
};

const renderFeedback = ({ rssForm: { processState, processResult } }, elements) => {
  const classValue = processState === 'completed' ? 'text-success' : 'text-danger';
  elements.feedback.innerHTML = processResult === null
    ? ''
    : `<span class="${classValue}">${processResult}</span>`;
};

const renderFeeds = (feeds, elements, i18n) => {
  const feedItems = feeds.map(({ title, description }) => `
      <li class="list-group-item">
        <h3>${title}</h3>
        <p>${description}</p>
      </li>
    `);

  elements.feedsContainer.innerHTML = `
    <h2>${i18n.t('elements.feedsTitle')}</h2>
    <ul class="list-group">
      ${feedItems.join('\n')}
    </ul>
  `;
};

const renderPosts = (state, elements, i18n) => {
  const { posts, shownPostsIds } = state;
  const postItems = posts.map(({ id, title, link }) => {
    const linkClass = shownPostsIds.has(id) ? 'fw-normal' : 'fw-bold';

    return `
      <li class="list-group-item d-flex align-items-center p-3">
        <a href="${link}" class="${linkClass} me-auto" data-id="${id}" target="_blank">${title}</a>
        <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id="${
  id}">${i18n.t('elements.readButton')}</button>
      </li>
    `;
  });

  elements.postsContainer.innerHTML = `
    <h2>${i18n.t('elements.postsTitle')}</h2>
    <ul class="list-group">
      ${postItems.join('\n')}
    </ul>
  `;

  const readPostButtons = elements.postsContainer.querySelectorAll('button');
  [...readPostButtons].forEach((button) => button.addEventListener('click', (e) => {
    const { id } = e.target.dataset;

    state.modal.postId = id;
    state.shownPostsIds.add(id);
  }));
};

const renderModal = (state, elements, modal) => {
  const post = state.posts.find(({ id }) => id === state.modal.postId);
  const postLink = elements.postsContainer.querySelector(`a[data-id="${state.modal.postId}"]`);

  elements.modalTitle.textContent = post.title;
  elements.modalBody.textContent = post.description;
  elements.modalPostLink.href = post.link;

  modal.show();

  postLink.classList.remove('fw-bold');
  postLink.classList.add('fw-normal');
};

export default (state, elements, i18n) => {
  const modal = new Modal(document.getElementById('modal'));

  const statePathMapping = {
    'rssForm.processState': () => renderForm(state, elements),
    'rssForm.processResult': () => renderFeedback(state, elements),
    'rssForm.valid': () => elements.rssUrlInput.classList.toggle('is-invalid'),
    appStatus: () => elements.rssQuerySection.classList.toggle('my-auto'),
    feeds: () => renderFeeds(state.feeds, elements, i18n),
    posts: (watchedState) => renderPosts(watchedState, elements, i18n),
    'modal.postId': () => renderModal(state, elements, modal),
  };

  const watchedState = onChange(state, (path) => statePathMapping[path]?.(watchedState));

  return watchedState;
};
