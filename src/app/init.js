import i18next from 'i18next';

import resources from './locales/index.js';
import View from './View.js';
import initRenderer from './renderer.js';
import initHandlers from './controllers/index.js';

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
    postToShowId: null,
    rssForm: {
      valid: true,
      processState: 'filling',
      processResult: null,
    },
  };

  const view = new View(i18nInstance);

  const watchedState = initRenderer(state, view);
  const handlers = initHandlers(watchedState, i18nInstance, updateTimeout);

  view.init(handlers);
};
