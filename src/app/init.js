import * as yup from 'yup';
import View from './View.js';
import initRenderer from './renderer.js';

const schema = yup
  .string()
  .trim()
  .required()
  .url();

const sendRequest = (url) => new Promise((resolve) => setTimeout(resolve, 500, { data: url }));

export default () => {
  const state = {
    appStatus: 'initial',
    appError: null,
    feeds: [],
    rssForm: {
      status: 'filling',
      validationError: null,
    },
  };
  const view = new View();
  const watchedState = initRenderer(state, view);

  view.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    watchedState.rssForm.status = 'processing';
    schema.validate(formData.get('url'))
      .then((url) => {
        watchedState.rssForm.validationError = null;
        return sendRequest(url);
      })
      .then(({ data }) => {
        watchedState.appStatus = 'filled';
        watchedState.feeds.push(data);
        watchedState.rssForm.status = 'success';
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          watchedState.rssForm.validationError = err.message;
          return;
        }
        watchedState.appError = err.message;
      })
      .then(() => {
        watchedState.rssForm.status = 'filling';
      });
  });
};
