export const renderRssChannels = (rssChannels) => {
  const channelsList = document.querySelector('#rssChannels');
  channelsList.innerHTML = '';
  rssChannels.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="channelTitle">${title}</div><div class="channelDescription">${description}</div>`;
    channelsList.append(li);
  });
};

export const renderRssPosts = (rssPosts) => {
  const postsList = document.querySelector('#rssPosts');
  postsList.innerHTML = '';
  rssPosts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="post"><a href="${link}">${title}</a></div>`;
    postsList.append(li);
  });
};

export const resetForm = () => {
  const rssFeedForm = document.querySelector('#rssFeedForm');
  rssFeedForm.reset();
};

export const renderValidationErrors = (validationErrors) => {
  const validationFeedback = document.querySelector('#validationFeedback');
  validationFeedback.innerHTML = '';
  validationErrors.forEach((errorMessage) => {
    const li = document.createElement('li');
    li.textContent = errorMessage;
    validationFeedback.append(li);
  });
};

export const renderSubmitButton = (submitButtonStatus) => {
  const submitButton = document.querySelector('#submitButton');
  if (submitButtonStatus === 'disabled') {
    submitButton.setAttribute('disabled', 'disabled');
  } else {
    submitButton.removeAttribute('disabled');
  }
};

export const renderInputField = (validationStatus) => {
  const inputField = document.querySelector('#inputField');
  if (validationStatus === 'invalid') {
    inputField.className = validationStatus;
  } else {
    inputField.className = '';
  }
};
