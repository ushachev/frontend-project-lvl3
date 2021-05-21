/* eslint-disable no-param-reassign */

import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';

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

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com/get';
const sendRequest = (url) => axios.get(proxyUrl, { params: { url, disableCache: true } })
  .catch(() => {
    throw new Error('errors.network');
  });

const pushRssDataToState = (state, url, feed, posts) => {
  const id = uniqueId('feed_');
  const relationedPosts = posts.map((post) => ({ id: uniqueId('post_'), feedId: id, ...post }));

  state.feeds.push({ id, url, ...feed });
  state.posts.push(...relationedPosts);
};

const startUpdatePosts = (state, updateTimeout) => {
  const updatePosts = () => {
    const feedPromises = state.feeds.map(({ id, url }) => sendRequest(url)
      .then(({ data }) => {
        const { posts } = parseUrlData(data);

        const oldPostsLinks = state.posts.filter(({ feedId }) => feedId === id)
          .map(({ link }) => link);

        const newPosts = posts.filter(({ link }) => !oldPostsLinks.includes(link))
          .map((post) => ({ id: uniqueId('post_'), feedId: id, ...post }));

        state.posts.push(...newPosts);
      }));

    Promise.allSettled(feedPromises).then(() => setTimeout(updatePosts, updateTimeout));
  };

  setTimeout(updatePosts, updateTimeout);
};

export default (state, i18n, updateTimeout) => (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  state.rssForm.valid = true;
  state.rssForm.processResult = null;
  state.rssForm.processState = 'processing';

  schema.validate(formData.get('url'))
    .then((url) => {
      const isUrlUniq = !state.feeds.find((feed) => feed.url === url);

      if (!isUrlUniq) {
        throw new yup.ValidationError('errors.validation.doubleUrl');
      }

      return sendRequest(url);
    })
    .then(({ config, data }) => {
      const { feed, posts } = parseUrlData(data);

      if (state.appStatus === 'initial') {
        state.appStatus = 'filled';
        startUpdatePosts(state, updateTimeout);
      }

      state.rssForm.processState = 'completed';
      state.rssForm.processResult = i18n.t('results.completed');

      pushRssDataToState(state, config.params.url, feed, posts);
    })
    .catch((err) => {
      state.rssForm.valid = err.name !== 'ValidationError';
      state.rssForm.processResult = i18n.t(err.message, i18n.t('errors.unknown'));
    })
    .then(() => {
      state.rssForm.processState = 'filling';
    });
};
