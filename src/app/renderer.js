import onChange from 'on-change';

const renderForm = (state, view) => {
  switch (state.rssForm.status) {
    case 'filling':
      view.disableForm(false);
      view.rssUrlInput.focus();
      break;

    case 'processing':
      view.disableForm(true);
      break;

    case 'success':
      view.renderFeedback(state);
      view.rssForm.reset();
      break;

    default:
      throw Error(`Unknown form status: ${state.rssForm.status}`);
  }
};

export default (state, view) => {
  const statePathMapping = {
    'rssForm.status': () => renderForm(state, view),
    'rssForm.validationError': () => view.renderFeedback(state),
    appStatus: () => view.rssQuerySection.classList.toggle('my-auto'),
    feeds: () => view.renderFeeds(state.feeds),
    appError: () => {},
  };

  return onChange(state, (path) => statePathMapping[path]?.());
};
