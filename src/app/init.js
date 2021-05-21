import i18next from 'i18next';

import resources from './locales/index.js';
import initView from './renderer.js';
import initSubmitHandler from './submitHandler.js';

export default async (updateTimeout = 5000) => {
  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    appStatus: 'initial',
    feeds: [],
    posts: [],
    shownPostsIds: new Set(),
    rssForm: {
      valid: true,
      processState: 'filling',
      processResult: null,
    },
    modal: {
      postId: null,
    },
  };

  const elements = {
    rssQuerySection: document.getElementById('rssQuery'),
    rssForm: document.getElementById('rssForm'),
    rssUrlInput: document.getElementById('url'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedback: document.getElementById('feedback'),
    feedsContainer: document.getElementById('feedsContainer'),
    postsContainer: document.getElementById('postsContainer'),

    modalTitle: document.getElementById('modalLabel'),
    modalBody: document.querySelector('.modal-body'),
    modalPostLink: document.getElementById('modalPostLink'),
  };

  const watchedState = initView(state, elements, i18nInstance);
  const handleRssFormSubmit = initSubmitHandler(watchedState, i18nInstance, updateTimeout);

  elements.rssForm.addEventListener('submit', handleRssFormSubmit);
};
