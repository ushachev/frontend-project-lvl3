export default ({ contents }) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(contents, 'application/xml');

  if (xml.documentElement.nodeName !== 'rss') {
    throw new Error('errors.parsing');
  }

  const feed = {
    title: xml.querySelector('channel title').textContent,
    description: xml.querySelector('channel description').textContent,
  };

  const posts = [...xml.querySelectorAll('channel item')]
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

  return { feed, posts };
};
