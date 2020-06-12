export default (rssSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssSource, 'application/xml');
  const channelTitleElement = doc.querySelector('rss>channel>title');
  const channelDescriptionElement = doc.querySelector('rss>channel>description');
  const channelLinkElement = doc.querySelector('rss>channel>link');
  if (channelTitleElement && channelDescriptionElement && channelLinkElement) {
    const postElmenets = [...doc.querySelectorAll('rss>channel>item')];
    const rssData = {
      channel: {
        title: channelTitleElement.textContent,
        description: channelDescriptionElement.textContent,
        link: channelLinkElement.textContent,
      },
      posts: postElmenets.map((item) => (
        {
          title: item.querySelector('title').textContent,
          link: item.querySelector('link').textContent,
        }
      )),
    };
    return rssData;
  }
  return null;
};
