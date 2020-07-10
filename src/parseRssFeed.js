export default (rssSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssSource, 'application/xml');
  const channelTitleElement = doc.querySelector('rss>channel>title');
  const channelDescriptionElement = doc.querySelector('rss>channel>description');
  if (!(channelTitleElement && channelDescriptionElement)) {
    throw new Error('Invalid rss xml format');
  }
  const postElmenets = [...doc.querySelectorAll('rss>channel>item')];
  const rssData = {
    channel: {
      title: channelTitleElement.textContent,
      description: channelDescriptionElement.textContent,
    },
    posts: postElmenets.map((item) => (
      {
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        guid: item.querySelector('guid').textContent,
      }
    )),
  };
  return rssData;
};
