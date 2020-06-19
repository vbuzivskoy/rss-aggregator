import onChange from 'on-change';
import i18next from 'i18next';
import * as renders from './renders';

export default (state) => {
  renders.renderLocaleButton(state.currentLocale);
  renders.renderSubmitButtonValue(i18next.t('rssFeedForm.addButton'));
  renders.renderInputFieldPlaceholder(i18next.t('rssFeedForm.inputPlaceholder'));
  return onChange(state, (path, value) => {
    if (path === 'rssChannels') {
      renders.renderRssChannels(value);
    }
    if (path === 'rssPosts') {
      renders.renderRssPosts(value);
    }
    if (path === 'rssFeedForm.inputStatus' && value === 'added') {
      renders.resetForm();
    }
    if (path === 'rssFeedForm.validationErrors') {
      const errorMessages = value.map((errorCode) => i18next.t(`errors.${errorCode}`));
      renders.renderValidationErrors(errorMessages);
    }
    if (path === 'rssFeedForm.submitButtonStatus') {
      renders.renderSubmitButton(state.rssFeedForm.submitButtonStatus);
    }
    if (path === 'rssFeedForm.validationStatus') {
      renders.renderInputField(value);
    }
    if (path === 'currentLocale') {
      i18next.changeLanguage(value);
      renders.renderLocaleButton(value);
      const errorMessages = state.rssFeedForm.validationErrors.map((errorCode) => i18next.t(`errors.${errorCode}`));
      renders.renderValidationErrors(errorMessages);
      renders.renderSubmitButtonValue(i18next.t('rssFeedForm.addButton'));
      renders.renderInputFieldPlaceholder(i18next.t('rssFeedForm.inputPlaceholder'));
    }
  });
};
