export default (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');

  if (xml.documentElement.nodeName !== 'rss') {
    throw new Error('Resource does not contain valid RSS');
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
