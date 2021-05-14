import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';

import resources from './locales/index.js';
import View from './View.js';
import initRenderer from './renderer.js';
import parseUrlData from './parser.js';

yup.setLocale({
  mixed: {
    required: 'errors.validation.required',
  },
  string: {
    required: 'errors.validation.required',
    url: 'errors.validation.url',
  },
});

const schema = yup
  .string()
  .trim()
  .required()
  .url();

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com/raw';
const sendRequest = (url) => axios.get(proxyUrl, { params: { url } });

const pushRssDataToState = (state, url, feed, posts) => {
  const id = uniqueId();
  const relationedPosts = posts.map((post) => ({ feedId: id, ...post }));

  state.feeds.push({ id, url, ...feed });
  state.posts.push(...relationedPosts);
};

export default async () => {
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
    rssForm: {
      valid: true,
      processState: 'filling',
      processResult: null,
    },
  };
  const view = new View(i18nInstance);
  const watchedState = initRenderer(state, view);

  view.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    watchedState.rssForm.valid = true;
    watchedState.rssForm.processResult = null;
    watchedState.rssForm.processState = 'processing';

    schema.validate(formData.get('url'))
      .then((url) => {
        const isUrlUniq = !watchedState.feeds.find((feed) => feed.url === url);

        if (isUrlUniq) return sendRequest(url);

        throw new yup.ValidationError('errors.validation.doubleUrl');
      })
      .then(({ config, data }) => {
        const { feed, posts } = parseUrlData(data);

        watchedState.appStatus = 'filled';
        watchedState.rssForm.processState = 'completed';
        watchedState.rssForm.processResult = i18nInstance.t('results.completed');

        pushRssDataToState(watchedState, config.params.url, feed, posts);
      })
      .catch((err) => {
        watchedState.rssForm.valid = err.name !== 'ValidationError';
        watchedState.rssForm.processResult = i18nInstance.t(err.message);
      })
      .then(() => {
        watchedState.rssForm.processState = 'filling';
      });
  });
};
