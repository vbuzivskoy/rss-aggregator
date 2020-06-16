export const renderRssChannels = (rssChannels) => {
  const channelsList = document.querySelector('#rssChannels');
  channelsList.innerHTML = rssChannels.reduce((acc, { title, description }) => (
    `${acc}<div class="channelContainer"><div class="channelTitle">${title}</div><div class="channelDescription">${description}</div></div>`
  ), '');
};

export const renderRssPosts = (rssPosts) => {
  const postsList = document.querySelector('#rssPosts');
  postsList.innerHTML = rssPosts.reduce((acc, { title, link }) => (
    `${acc}<div class="postContainer"><div class="post"><a href="${link}" target="_blank">${title}</a></div></div>`
  ), '');
};

export const resetForm = () => {
  const rssFeedForm = document.querySelector('#rssFeedForm');
  rssFeedForm.reset();
};

export const renderValidationErrors = (validationErrors) => {
  const validationFeedback = document.querySelector('#validationFeedback');
  validationFeedback.innerHTML = validationErrors
    .reduce((acc, errorMessage) => (
      `${acc}<div>${errorMessage}</div>`
    ), '');
};

export const renderSubmitButton = (submitButtonStatus) => {
  const submitButton = document.querySelector('#submitButton');
  if (submitButtonStatus === 'disabled') {
    submitButton.setAttribute('disabled', 'disabled');
  } else {
    submitButton.removeAttribute('disabled');
  }
};

export const renderSubmitButtonValue = (value) => {
  const submitButton = document.querySelector('#submitButton');
  submitButton.textContent = value;
};

export const renderInputField = (validationStatus) => {
  const inputField = document.querySelector('#inputField');
  if (validationStatus === 'invalid') {
    inputField.classList.add('invaild');
  } else {
    inputField.classList.remove('invaild');
  }
};

export const renderInputFieldPlaceholder = (placeholder) => {
  const inputField = document.querySelector('#inputField');
  inputField.removeAttribute('placeholder');
  inputField.setAttribute('placeholder', placeholder);
};

export const renderLocaleButton = (currentLocale) => {
  const localeDropdownMenuButton = document.querySelector('#localeDropdownMenuButton');
  localeDropdownMenuButton.textContent = currentLocale;
};
