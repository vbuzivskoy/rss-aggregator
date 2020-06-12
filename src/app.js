import axios from 'axios';
import * as yup from 'yup';
import parseRssFeed from './parseRssFeed';
import watcher from './watchers';

const corsProxyInit = () => {
  const corsAPIhost = 'cors-anywhere.herokuapp.com';
  const corsAPIurl = `https://${corsAPIhost}/`;
  const sliceArray = [].slice;
  const origin = `${window.location.protocol}//${window.location.host}`;
  const originOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(...argums) {
    const args = sliceArray.call(argums);
    const targetOrigin = /^https?:\/\/([^/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin
      && targetOrigin[1] !== corsAPIhost) {
      args[1] = corsAPIurl + args[1];
    }
    return originOpen.apply(this, args);
  };
};

const getRssFeed = (url) => {
  corsProxyInit();

  return axios.get(url);
};

const app = () => {
  const state = {
    addFeedForm: {
      inputStatus: 'empty',
      validationStatus: 'valid',
      validationErrors: [],
      submitButtonStatus: 'disabled',
    },
    rssChannels: [],
    rssPosts: [],
  };

  const watchedState = watcher(state);

  const rssFeedForm = document.querySelector('#rssFeedForm');

  const schema = yup.object().shape({
    feedUrl: yup.string().url().required(),
  });

  rssFeedForm.addEventListener('input', (e) => {
    watchedState.addFeedForm.inputStatus = 'typing';
    const formData = new FormData(e.currentTarget);
    const feedUrl = formData.get('feedUrl');
    schema.validate({ feedUrl })
      .then(() => {
        watchedState.addFeedForm.validationStatus = 'valid';
        watchedState.addFeedForm.submitButtonStatus = 'enabled';
        watchedState.addFeedForm.validationErrors = [];
      })
      .catch(({ errors }) => {
        watchedState.addFeedForm.validationStatus = 'invalid';
        watchedState.addFeedForm.submitButtonStatus = 'disabled';
        watchedState.addFeedForm.validationErrors = errors;
      });
  });
  rssFeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('feedUrl');
    getRssFeed(feedUrl)
      .then((response) => {
        const parsedRssFeedData = parseRssFeed(response.data);
        const isAlreadyAdded = state.rssChannels
          .filter(({ link }) => link === parsedRssFeedData.channel.link)
          .length === 1;
        if (isAlreadyAdded) {
          watchedState.addFeedForm.validationStatus = 'invalid';
          watchedState.addFeedForm.submitButtonStatus = 'disabled';
          watchedState.addFeedForm.validationErrors = ['Error: That rss feed has already been added.'];
        } else {
          watchedState.addFeedForm.inputStatus = 'added';
          watchedState.rssChannels.push(parsedRssFeedData.channel);
          watchedState.rssPosts.push(...parsedRssFeedData.posts);
        }
      })
      .catch((error) => {
        watchedState.addFeedForm.validationErrors = [error];
      });
  });
};

export default app;
