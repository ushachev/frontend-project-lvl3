/* eslint-disable no-param-reassign */

export default (state) => (e) => {
  const { id } = e.target.dataset;

  state.postToShowId = id;
  state.shownPostsIds.push(id);
};
