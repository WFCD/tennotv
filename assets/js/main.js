/* Actual useful stuff */
/*
globals localStorage, navigator, $, fetch, gapi,
Request, YT, FlakeId, serviceAPI, SVGInjector, limitToCreator,
initialVideo
*/
/* eslint-disable no-console */
const validToggles = ['weapon', 'warframe', 'machinima', 'sfm', 'lore', 'talk', 'fashion'];
const historicalVideos = [];
const contentCreators = [];
const alerts = [];

let queue = [];
let lastInd = 0;
let player;
let done = true;
let ready = false;
let playlistVid;

/* Helpers */
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
const setSubscriberBar = () => {
  try {
    if (player) {
      const author = getAuthorInfo(player.getVideoData().video_id);
      if (author) {
        $('#sub-div').attr('data-channelid', author.youtube_key);

        gapi.ytsubscribe.go('yt-subscribe-container');
        $('#yt-subscribe-container').show();
      } else {
        $('#yt-subscribe-container').hide();
      }
    }
  } catch (error) {
    console.error('[ERROR] Failure fetching author info. Ensure player is loaded.');
  }
};
const getContentCreators = async () => {
  const requestInfo = {
    method: 'GET',
    header: {
      'content-type': 'application/json',
      'user-agent': navigator.userAgent,
    },
    credentials: 'omit',
    referrer: 'no-referrer',
  };
  const opts = [];
  opts.push('method=get-content-creators');
  const url = `${serviceAPI}?${opts.join('&')}`;
  try {
    const request = new Request(url, requestInfo);
    const response = await fetch(request);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('[ERROR] Something went wrong content creators. Contact tennotv@warframe.gg for support.');
    } else {
      contentCreators.unshift(...(await response.json()));
      if (!$('#sub-div').attr('data-channelid')) {
        setTimeout(setSubscriberBar, 1000);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
const resetSubBar = () => {
  $('#yt-subscribe-container').empty();
  $('#yt-subscribe-container').append('<div id="sub-div" class="g-ytsubscribe"></div>');
};

const notify = message => {
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
};

/* Video Queue */
async function addVideoToUserHistory(id) {
  const requestInfo = {
    method: 'POST',
    header: {
      'content-type': 'application/json',
      'user-agent': navigator.userAgent,
    },
    body: {
      method: 'add-watcher-history',
      token: localStorage.getItem('watcherToken') || generateNewToken(),
      video_id: id,
    },
    credentials: 'omit',
    referrer: 'no-referrer',
  };
  const opts = [];
  opts.push('method=add-watcher-history');
  opts.push(`video_id=${id}`);
  opts.push(`token=${localStorage.getItem('watcherToken') || generateNewToken()}`);
  const url = `${serviceAPI}?${opts.join('&')}`;
  try {
    const request = new Request(url, requestInfo);
    const response = await fetch(request);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] Something went wrong adding ${id} to history. Contact tennotv@warframe.gg for support.`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
function makeHistoryRow(video) {
  /* eslint-disable no-plusplus */
  return `<tr id="${video.video_id}" class="video-row">
    <td class="title col-md-7"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}">${video.video_title}</a></td>
    <td class="author col-md-2"><a href="https://www.youtube.com/channel/${video.youtube_key}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">${video.account_name}</a></td>
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
}
function addHistoryRow(id) {
  let video;
  $.each(historicalVideos, queueIndex => {
    if (historicalVideos[queueIndex].video_id === id) {
      video = historicalVideos[queueIndex];
    }
  });
  if (!video) {
    $.each(queue, queueIndex => {
      if (queue[queueIndex].video_id === id) {
        video = queue[queueIndex];
      }
    });
    historicalVideos.push(video);
  }
  if (video && !$(`#historyList #${video.video_id}`).length) {
    $('#historyList').append(makeHistoryRow(video));

    $(`#historyList #${video.video_id}`).click(() => {
      loadHistoricalVideo(video.video_id);
    });
    $(`#historyList #${video.video_id} .title a`).click(e => {
      e.preventDefault();
      loadHistoricalVideo(video.video_id);
    });
  }
}
async function addWatchedVideo(id) {
  const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  watchedVideos.push(id);
  if (!localStorage.getItem('watcherToken')) {
    localStorage.setItem('watchedVideos', JSON.stringify([...new Set(watchedVideos)].filter(thing => thing !== null)));
  }
  if (!$(`#historyList #${id}`).length) {
    addVideoToUserHistory(id);
    addHistoryRow(id);
  }
}
async function getVideos(useQueue, ignoreTags) {
  const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  let currentToken = localStorage.getItem('watcherToken');
  if (!currentToken || !currentToken.length) {
    currentToken = generateNewToken();
    watchedVideos.forEach(videoId => addHistoryRow(videoId));
    localStorage.removeItem('watchedVideos');
  }

  const opts = [
    parseInt(limitToCreator, 10) || ignoreTags ? '' : `included_tags=${getCurrentToggles().join(',')}`,
    `excluded_video_ids=${watchedVideos.concat(useQueue ? queue.map(video => video.video_id) : []).join(',')}`,
    `token=${localStorage.getItem('watcherToken') || generateNewToken()}`,
    parseInt(limitToCreator, 10) ? `content_creator_ids=${limitToCreator}` : '',
    initialVideo ? `initial_video=${initialVideo}` : '',
  ].filter(param => param);
  const requestInfo = {
    method: 'GET',
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
      // eslint-disable-next-line no-console
      console.error('[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.');
    } else {
      const videoData = await response.json();
      processVideoData(videoData);
      if (videoData.length < 10) {
        notify('Not enough videos loaded from your tags, so we added some videos from other categories,<br /> they might be unrelated.');
        getVideos(true, true);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
async function getHistoricalVideos() {
  const requestInfo = {
    method: 'GET',
    header: {
      'content-type': 'application/json',
      'user-agent': navigator.userAgent,
    },
    credentials: 'omit',
    referrer: 'no-referrer',
  };
  const url = `${serviceAPI}?method=get-watched-videos-list&token=${localStorage.getItem('watcherToken') || generateNewToken()}`;
  const request = new Request(url, requestInfo);

  try {
    const response = await fetch(request);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('[ERROR] Something went wrong fetching historical videos. Contact tennotv@warframe.gg for support.');
    } else {
      const fetchedHistoricalVideos = await response.json();
      $.each(fetchedHistoricalVideos, videoIndex => {
        const historicalVid = fetchedHistoricalVideos[videoIndex];
        historicalVideos.push(historicalVid);
        addHistoryRow(historicalVid.video_id);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
function makeTags(tagArray) {
  if (!tagArray || tagArray.length === 0) return '';
  return $.map(tagArray, tag => {
    if (tag && tag !== null) {
      return `<span class="badge badge-light">${titleCase(tag)}</span>`;
    }
    return '';
  }).slice(0, 5).join('');
}
function makeRow(video) {
  const authorSpan = `<span class='author-name'>${video.account_name}</span>`;
  const authorImg = video.author_yt_thumbnail ? `<img class="author-img" alt="${video.account_name}" title="${video.account_name}" src="${video.author_yt_thumbnail}">` : '';
  const authorLink = `<a href="https://www.youtube.com/channel/${video.youtube_key}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">${authorImg}${authorSpan}</a>`;
  const authorRow = `<td class="author col-md-2">${authorLink}</td>`;

  return `<tr id="${video.video_id}" class="video-row">
    <td scope="row" class="numRow col-md-1" style>${++lastInd}</th>
    <td class="title col-md-6"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}">${video.video_title}</a></td>
    ${authorRow}
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
}
function updatePlaylist(newVideoArray) {
  $.each(newVideoArray, index => {
    const video = newVideoArray[index];
    $('#playlist').append(makeRow(video));
    $(`#playlist #${video.video_id}`).click(() => {
      loadVideo(video.video_id);
    });
    $(`#playlist #${video.video_id} .title a`).click(e => {
      e.preventDefault();
      loadVideo(video.video_id);
    });
  });
}

/* Video processing */
function processVideoData(videoArray) {
  queue = queue.concat(videoArray);
  updatePlaylist(videoArray);
  if (ready && done) {
    if (videoArray[0]) {
      startVideo(videoArray[0].video_id);
    } else {
      notify('Not enough videos loaded from your tags, so we added some videos from other categories,<br /> they might be unrelated.');
      getVideos(true, true);
    }
  }
}
function getNextVideoId(currentVideoId) {
  let nextId;
  $.each(queue, queueIndex => {
    if (queue[queueIndex].video_id === currentVideoId) {
      if (typeof queue[queueIndex + 1] !== 'undefined') {
        nextId = queue[queueIndex + 1].video_id;
      } else {
        getVideos(true);
      }
    }
  });
  return nextId;
}
function loadVideo(videoId) {
  $('.table-active').removeClass('table-active');
  $(`#playlist #${videoId}`).addClass('table-active');
  player.loadVideoById(videoId);
  addWatchedVideo(videoId);
  resetSubBar();
  setTimeout(setSubscriberBar, 1000);
  if (queue[queue.length - 1].video_id === videoId) {
    getVideos(true);
  }
}
function loadHistoricalVideo(videoId) {
  if (!playlistVid) {
    playlistVid = player.getVideoData().video_id;
  }
  $('.table-active').removeClass('table-active');
  $(`#historyList #${videoId}`).addClass('table-active');
  player.loadVideoById(videoId);
  resetSubBar();
  setTimeout(setSubscriberBar, 1000);
}

/* Player events */
function onPlayerReady(event) {
  event.target.playVideo();
}
function onPlayerStateChange(event) {
  const vidId = player.getVideoData().video_id;
  if (event.data === YT.PlayerState.ENDED && !done) {
    done = true;
    if (playlistVid && vidId !== playlistVid) {
      loadVideo(playlistVid);
      playlistVid = undefined;
    } else {
      const next = getNextVideoId(vidId);
      loadVideo(next);
    }
    done = false;
  }
}

// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  ready = true;
}
function makeYTScripts() {
  /* Make the player */
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
makeYTScripts();
function startVideo(videoId) {
  if (!player && ready) {
    done = false;
    player = new YT.Player('player', {
      videoId,
      rel: 0,
      cc_load_policy: 0,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
      playerVars: {
        modestbranding: 1,
        widget_referrer: 'https://tenno.tv',
      },
    });
    addWatchedVideo(videoId);
  }
  if (player && ready && done) {
    loadVideo(videoId);
  }
}

/* Toggles */
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
function loadToggles() {
  validToggles.forEach(toggle => {
    const currentToggleStatus = localStorage.getItem(toggle);
    if (currentToggleStatus && currentToggleStatus === 'off') {
      $(`#toggle-${toggle}-check`).prop('checked', false);
      $(`#toggle-${toggle}`).removeClass('active');
    } else if (currentToggleStatus) {
      $(`#toggle-${toggle}-check`).prop('checked', true);
      $(`#toggle-${toggle}`).addClass('active');
    }
    // set cookie if it doesn't exist
    if (!currentToggleStatus) {
      localStorage.setItem(toggle, 'off');
      $(`#toggle-${toggle}-check`).prop('checked', false);
      $(`#toggle-${toggle}`).removeClass('active');
    }
  });
}
function handleOptionClick(event) {
  const item = event.target.id.replace(/toggle-/ig, '').replace(/-check/ig, '').replace(/-img/ig, '');
  const newStatus = $(`#toggle-${item}-check`).prop('checked') ? 'off' : 'on';
  if (newStatus === 'on') {
    $(`#toggle-${item}-check`).prop('checked', true);
  }
  localStorage.setItem(item, newStatus);
}

/* Resets */
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
      // eslint-disable-next-line no-console
      console.error('[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.');
    } else {
      processVideoData(await response.json());
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const handleReset = async e => {
  const target = $(e.currentTarget);
  const toReset = target.attr('data-reset');
  switch (toReset) {
  case 'all':
    resetToggles();
    await resetWatchedVideos();
    break;
  case 'toggles':
    resetToggles();
    await resetWatchedVideos();
    break;
  case 'videos':
    await resetWatchedVideos();
    break;
  default:
    break;
  }
  window.location.reload(true);
};

const adjustPlayerSize = () => {
  const staticHeights = $('#top-nav').height()
    + $('#footer-content').height()
    + $('#under-player-controls').height();
  let dynamicHeights = 0;
  alerts
    .filter(alert => {
      const jItem = $(`#${alert}`);
      return jItem.length;
    })
    .forEach(alert => {
      const jItem = $(`#${alert}`);
      dynamicHeights += jItem.height() + 37;
    });
  const bufferHeight = 35;

  let height = $(window).height() - (staticHeights + dynamicHeights + bufferHeight);
  let width = (height / 9) * 16;
  if (width > $(window).width()) {
    width = $(window).width();
    height = (width / 16) * 9;
  }
  $('#playerWrapper').height(height);
  $('#playerWrapper').width(width);
};

/* Ready, set, go! */
$(document).ready(() => {
  $('.opts-h').on('click', handleOptionClick);
  $.each($('label.opts-h'), (index, element) => {
    $(element).tooltip({
      placement: 'bottom',
      title: `Click to Toggle ${$(element).attr('data-toggle-name')}`,
    });
  });
  $('#historyTrigger').tooltip({
    placement: 'bottom',
    title: 'Open History',
  });
  $('#playlistTrigger').tooltip({
    placement: 'bottom',
    title: 'Open Playlist',
  });
  $('#feedbackTrigger').tooltip({
    placement: 'bottom',
    title: 'Feedback',
  });
  $('#creatorsTrigger').tooltip({
    placement: 'bottom',
    title: 'Content Creators',
  });
  $('button.btn-reset').tooltip({
    placement: 'bottom',
    title: 'Reset & Options',
  });
  $('#playerNext').tooltip({
    placement: 'bottom',
    title: 'Next Video',
  });
  loadToggles();

  /* Still not reloading, but it wipes data */
  $('.btn-reset').on('click', handleReset);

  SVGInjector(document.querySelectorAll('img.toggle-svg'));

  const jDismissibles = $('.alert-dismissible');
  jDismissibles.each(index => alerts.push(jDismissibles[index].id));
  alerts.forEach(alert => {
    const isOpen = localStorage.getItem(`${alert}Visible`) !== 'closed';
    if (isOpen) {
      $(`#${alert}`).on('closed.bs.alert', () => {
        localStorage.setItem(`${alert}Visible`, 'closed');
        adjustPlayerSize();
      });
    } else {
      $(`#${alert}`).alert('close');
      adjustPlayerSize();
    }
  });
  adjustPlayerSize();
  $(window).resize(adjustPlayerSize);

  gapi.load('ytsubscribe');
  getContentCreators();
});
getVideos(true);
getHistoricalVideos();
