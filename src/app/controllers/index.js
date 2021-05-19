import initSubmitHandler from './submitHandler.js';
import initReadPostHandler from './readPostHandler.js';

export default (state, i18n, updateTimeout) => ({
  handleRssFormSubmit: initSubmitHandler(state, i18n, updateTimeout),
  handleReadPostButton: initReadPostHandler(state),
});
