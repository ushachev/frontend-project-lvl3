import onChange from 'on-change';

const renderForm = (state, view) => {
  switch (state.rssForm.processState) {
    case 'filling':
      view.disableForm(false);
      view.rssUrlInput.focus();
      break;

    case 'processing':
      view.disableForm(true);
      break;

    case 'completed':
      view.rssForm.reset();
      break;

    default:
      throw Error(`Unknown form state: ${state.rssForm.processState}`);
  }
};

export default (state, view) => {
  const statePathMapping = {
    'rssForm.processState': () => renderForm(state, view),
    'rssForm.processResult': () => view.renderFeedback(state),
    'rssForm.valid': () => view.rssUrlInput.classList.toggle('is-invalid'),
    appStatus: () => view.rssQuerySection.classList.toggle('my-auto'),
    feeds: () => view.renderFeeds(state.feeds),
    posts: () => view.renderPosts(state),
    postToShowId: () => view.renderModal(state),
  };

  return onChange(state, (path) => statePathMapping[path]?.());
};
