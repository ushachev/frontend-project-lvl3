/* eslint-disable no-param-reassign */

import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';

import parseUrlData from '../parser.js';

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
  console.log('parsered feed:');
  console.dir(feed);
  const id = uniqueId('feed_');
  const relationedPosts = posts.map((post) => ({ id: uniqueId('post_'), feedId: id, ...post }));

  state.feeds.push({ id, url, ...feed });
  console.log('state.feeds after new feed pushed:');
  console.dir(state.feeds);
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
      console.log('url:', url);
      console.log('state:');
      console.dir(state);
      const isUrlUniq = !state.feeds.find((feed) => feed.url === url);
      console.log('is url uniq:', isUrlUniq);

      if (isUrlUniq) return sendRequest(url);

      throw new yup.ValidationError('errors.validation.doubleUrl');
    })
    .then((res) => {
      console.dir(res);
      const { config, data } = res;
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
      console.log('err.message:', err.message);
      state.rssForm.valid = err.name !== 'ValidationError';
      state.rssForm.processResult = i18n.t(err.message, i18n.t('errors.unknown'));
    })
    .then(() => {
      state.rssForm.processState = 'filling';
    });
};
