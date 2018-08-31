/* globals
  FlakeId, $, serviceAPI, processVideoData, window, Raven
*/

/* eslint-disable no-unused-vars, prefer-const */
let queue = [];
let lastInd = 0;
let player;
let done = true;
let ready = false;
let refetchWarned = false;
let playlistVid;

const validToggles = ['weapon', 'warframe', 'machinima', 'sfm', 'lore', 'talk', 'fashion'];
const historicalVideos = [];
const contentCreators = [];
const alerts = [];

const titleCase = str => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(token => token.charAt(0).toUpperCase() + token.slice(1));
};

const generateNewToken = () => {
  const currentToken = localStorage.getItem('watcherToken');
  if (typeof currentToken === 'undefined' || (currentToken && !currentToken.length) || !currentToken) {
    const token = new FlakeId().gen();
    localStorage.setItem('watcherToken', token);
    return token;
  }
  return currentToken;
};

const getAuthorInfo = id => {
  const queueResults = queue.filter(vid => vid.video_id === id);
  const historyResults = queue.filter(vid => vid.video_id === id);
  const histResult = historyResults.length ? historyResults[0] : undefined;
  const result = queueResults.length ? queueResults[0] : histResult;
  return contentCreators.filter(creator => creator.author_id === result.author_id)[0];
};

const notify = message => {
  if (!$('#warn-refetch').length && !refetchWarned) {
    refetchWarned = true;
    $('#top-nav').after(`
    <div class="alert alert-dismissible alert-info" id="warn-refetch">
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      <h4 class="alert-heading">Heads up!</h4>
      <p class="mb-0">${message}</p>
    </div>
  `);
    setTimeout(() => {
      $('#warn-refetch').alert('close');
    }, 3000);
  }
};

function makeTags(tagArray) {
  if (!tagArray || tagArray.length === 0) return '';
  return $.map(tagArray, tag => {
    if (tag && tag !== null) {
      return `<span class="badge badge-light">${titleCase(tag)}</span>`;
    }
    return '';
  }).slice(0, 5).join('');
}

function getCurrentToggles() {
  const currentToggles = [];
  validToggles.forEach(toggle => {
    const val = localStorage.getItem(toggle);
    if (val !== null && val === 'on') {
      currentToggles.push(toggle);
    }
  });
  return currentToggles;
}

function resetToggles() {
  validToggles.forEach(thing => localStorage.removeItem(thing));
}

const resetWatchedVideos = async () => {
  localStorage.removeItem('watchedVideos');
  const opts = [
    'method=delete-watched-videos-list',
    `token=${localStorage.getItem('watcherToken') || generateNewToken()}`,
  ];
  const requestInfo = {
    method: 'DELETE',
    header: {
      'content-type': 'application/json',
      'user-agent': navigator.userAgent,
    },
    credentials: 'omit',
    referrer: 'no-referrer',
  };
  const url = `${serviceAPI}?${opts.join('&')}`;
  const request = new Request(url, requestInfo);

  try {
    const response = await fetch(request);
    if (!response.ok) {
      Raven.captureException('[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.');
    } else {
      processVideoData(await response.json());
    }
  } catch (error) {
    Raven.captureException(error);
  }
};

const setUrl = path => {
  window.history.pushState('', '', path);
};
