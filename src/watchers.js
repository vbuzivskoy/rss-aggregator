import onChange from 'on-change';
import * as renders from './renders';

export default (state) => (
  onChange(state, (path, value) => {
    if (path === 'rssChannels') {
      renders.renderRssChannels(value);
    }
    if (path === 'rssPosts') {
      renders.renderRssPosts(value);
    }
    if (path === 'addFeedForm.inputStatus' && value === 'added') {
      renders.resetForm();
    }
    if (path === 'addFeedForm.validationErrors') {
      renders.renderValidationErrors(state.addFeedForm.validationErrors);
    }
    if (path === 'addFeedForm.submitButtonStatus') {
      renders.renderSubmitButton(state.addFeedForm.submitButtonStatus);
    }
    if (path === 'addFeedForm.validationStatus') {
      renders.renderInputField(value);
    }
  })
);
