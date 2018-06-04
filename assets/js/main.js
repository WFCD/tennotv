/* Actual useful stuff */
/* globals localStorage, navigator, $, fetch, Request, YT */
const serviceAPI = 'https://api.warframestat.us/tennotv';
let queue = [];
let lastInd = 0;
let player;
let done = true;
let ready = false;
const validToggles = ['weapon', 'warframe', 'machinima', 'sfm', 'lore', 'talk'];

/* Helpers */
const titleCase = str => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(token => token.charAt(0).toUpperCase() + token.slice(1));
};

/* Video Queue */
function addWatchedVideo(id) {
  const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  watchedVideos.push(id);
  localStorage.setItem('watchedVideos', JSON.stringify([...new Set(watchedVideos)].filter(thing => thing !== null)));
}
function getVideos(useQueue) {
  const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  const opts = [
    `included_tags=${getCurrentToggles().join(',')}`,
    `excluded_video_ids=${watchedVideos.concat(useQueue ? queue.map(video => video.video_id) : []).join(',')}`,
  ];
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
  // eslint-disable-next-line no-console
  console.debug(`[DEBUG] Requsting: ${url}`);
  const request = new Request(url, requestInfo);

  fetch(request)
    .then(response => {
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.');
        return false;
      }
      return response.json();
    }).then(stuff => {
      processVideoData(stuff);
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
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
  /* eslint-disable no-plusplus */
  let authorRow = `<td class="author col-md-2"><a href="https://www.youtube.com/channel/${video.youtube_key}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">`;
  authorRow += video.author_ty_thumbnail ? `<img class='author-img' alt='${video.account_name}'>` : '';
  authorRow += `<span class='author-name'>${video.account_name}</span></a></td>`;
  return `<tr id="${video.video_id}" class="video-row">
    <td scope="row" class="numRow col-md-1" style>${++lastInd}</th>
    <td class="title col-md-6"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}">${video.video_title}</a></td>
    ${authorRow}
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
}
/* eslint-enable no-plusplus */
function updatePlaylist(newVideoArray) {
  $.each(newVideoArray, index => {
    const video = newVideoArray[index];
    $('#playlist').append(makeRow(video));
    $(`#${video.video_id}`).click(() => {
      startVideo(video.video_id, true);
    });
    $(`#${video.video_id} .title a`).click(e => {
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
    startVideo(videoArray[0].video_id);
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
  $(`#${videoId}`).addClass('table-active');
  player.loadVideoById(videoId);
  addWatchedVideo(videoId);
  if (queue[queue.length - 1].video_id === videoId) {
    getVideos(true);
  }
}

/* Player events */

function onPlayerReady(event) {
  event.target.playVideo();
}
function onPlayerStateChange(event) {
  const vidId = player.getVideoUrl().match(/v=(.*)/i)[1];
  if (event.data === YT.PlayerState.ENDED && !done) {
    done = true;
    const next = getNextVideoId(vidId);
    done = false;
    loadVideo(next);
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
    if (localStorage.getItem(toggle) !== null) {
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
      localStorage.setItem(toggle, 'on');
      $(`#toggle-${toggle}-check`).prop('checked', true);
      $(`#toggle-${toggle}`).addClass('active');
    }
  });
}
function handleOptionClick(event) {
  const item = event.target.id.replace(/toggle-/ig, '').replace(/-check/ig, '');
  const newStatus = $(`#toggle-${item}-check`).prop('checked') ? 'off' : 'on';
  if (newStatus === 'on') {
    $(`#toggle-${item}-check`).prop('checked', true);
  }
  localStorage.setItem(item, newStatus);
}

/* Ready, set, go! */
$(document).ready(() => {
  /* set up options clicks */
  $('.opts-h').on('click', handleOptionClick);
  $(() => {
    $('label.opts-h').tooltip({
      placement: 'bottom',
      title: 'Click to Toggle',
    });
  });
  loadToggles();

  // justifyBtnGroup('options');

  /* Still not reloading, but it wipes data */
  $('.btn-reset').on('click', e => {
    const target = $(e.currentTarget);
    const toReset = target.attr('data-reset');
    switch (toReset) {
    case 'all':
      validToggles.forEach(thing => localStorage.removeItem(thing));
      localStorage.removeItem('watchedVideos');
      break;
    case 'toggles':
      validToggles.forEach(thing => localStorage.removeItem(thing));
      break;
    case 'videos':
      localStorage.removeItem('watchedVideos');
      break;
    default:
      break;
    }
    window.location.reload(true);
  });

  $('.navbar-brand').on('click', () => { window.location.reload(true); });
});
getVideos(true);
