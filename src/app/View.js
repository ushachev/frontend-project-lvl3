export default class View {
  constructor() {
    this.rssQuerySection = document.querySelector('#rssQuery');
    this.rssForm = document.querySelector('#rssForm');
    this.rssUrlInput = document.querySelector('#url');
    this.submitBtn = this.rssForm.querySelector('button[type="submit"]');
    this.feedback = document.querySelector('#feedback');
    this.feedsContainer = document.querySelector('#feedsContainer');
    this.postsContainer = document.querySelector('#postsContainer');
  }

  disableForm(isDisabled) {
    this.rssUrlInput.disabled = isDisabled;
    this.submitBtn.disabled = isDisabled;
  }

  renderFeedback({ rssForm: { processState, processResult } }) {
    const classValue = processState === 'completed' ? 'text-success' : 'text-danger';
    this.feedback.innerHTML = processResult === null
      ? ''
      : `<span class="${classValue}">${processResult}</span>`;
  }

  renderFeeds(feeds) {
    const feedItems = feeds.map(({ title, description }) => `
      <li class="list-group-item">
        <h3>${title}</h3>
        <p>${description}</p>
      </li>
    `);

    this.feedsContainer.innerHTML = `
      <h2>feeds</h2>
      <ul class="list-group">
        ${feedItems.join('\n')}
      </ul>
    `;
  }

  renderPosts(posts) {
    const postItems = posts.map(({ title, link }) => `
      <li class="list-group-item p-3">
        <a href="${link}" target="_blank">${title}</a>
      </li>
    `);

    this.postsContainer.innerHTML = `
      <h2>posts</h2>
      <ul class="list-group">
        ${postItems.join('\n')}
      </ul>
    `;
  }
}
