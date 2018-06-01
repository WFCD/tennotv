/* Actual useful stuff */
/* globals localStorage, navigator, $, fetch, Request, YT, dataLayer */
const serviceAPI = 'https://api.warframestat.us/tennotv';
let queue = [];
let lastInd = 0;
let player;
let done = true;
let ready = false;
const validToggles = ['weapon', 'warframe', 'machinima', 'sfm', 'lore', 'talk'];

/* Helpers */
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}

/* Video Queue */
function addWatchedVideo(id) {
  let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  watchedVideos.push(id);
  localStorage.setItem('watchedVideos', JSON.stringify([...new Set(watchedVideos)].filter(thing => thing !== null)));
}
function getVideos(useQueue) {
  const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  const opts = [
    `included_tags=${getCurrentToggles().join(',')}`,
    `excluded_video_ids=${watchedVideos.concat(useQueue ? queue.map(video => video.video_id) : []).join(',')}`
  ];
  const requestInfo =  {
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'user-agent': navigator.userAgent,
      },
      credentials: 'omit',
      referrer: 'no-referrer'
  };
  const url = `${serviceAPI}?${opts.join('&')}`;
  const request = new Request(url, requestInfo);

  fetch(request)
    .then(response => {
      if (!response.ok) {
        console.error(`[ERROR] Something went wrong fetching videos. Contact tennotv@warframe.gg for support.`);
        return;
      }
      return response.json();
    }).then(stuff => {
      processVideoData(stuff);
    })
    .catch(e => {
      console.error(e);
    });
}
function makeTags(tagArray) {
    return $.map(tagArray, tag => {
        if (tag) {
          return `<span class="badge badge-light">${titleCase(tag)}</span>`;
        }
        return '';
    }).slice(0, 5).join('');
}
function makeRow(video) {
  return `<tr id="${video.video_id}" class="video-row">
    <td scope="row" class="numRow col-md-1" style>${++lastInd}</th>
    <td class="title col-md-6"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}">${video.video_title}</a></td>
    <td class="author col-md-2"><a href="https://www.youtube.com/channel/${video.youtube_key}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">${video.account_name}</a></td>
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
}
function updatePlaylist(newVideoArray) {
    $.each(newVideoArray, (index) => {
        const video = newVideoArray[index];
        $("#playlist").append(makeRow(video));
        $(`#${video.video_id}`).click(() => {
            startVideo(video.video_id, true);
        });
        $(`#${video.video_id} .title a`).click((e) => {
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
function resetPlayer() {
    $("#player").remove();
    $("#playerWrapper").append("<div id=\"player\">Loading player...</div>");
    makeYTScripts();
}

function getNextVideoId(currentVideoId) {
  let nextId;
  $.each(queue, function (queueIndex) {
    if (queue[queueIndex].video_id === currentVideoId){
      if (typeof queue[queueIndex+1] !== 'undefined') {
        nextId = queue[queueIndex+1].video_id;
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
  if (queue[queue.length -1].video_id === videoId) {
    getVideos(true);
  }
}

/* Player events */

function onPlayerReady(event) {
  event.target.playVideo();
}
function onPlayerStateChange(event) {
  console.debug(`[State change] ${event.data}`);
  const vidId = player.getVideoUrl().match(/v=(.*)/i)[1];
  if (event.data == YT.PlayerState.ENDED && !done) {
    done = true;
    const next = getNextVideoId(vidId);
    done = false;
    loadVideo(next);
  }
}
function stopVideo() {
  player.stopVideo();
}
function onYouTubeIframeAPIReady() {
  ready = true;
  console.debug(`[DEBUG] onYouTubeIframeAPIReady called`);
}
function makeYTScripts() {
  /* Make the player */
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
makeYTScripts();
function startVideo(videoId) {
    if (!player && ready) {
      done = false;
      player = new YT.Player('player', {
        videoId: videoId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
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
function toggleStatus(toggle, status) {
  localStorage.setItem(toggle, status);
}
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
      const toggleStatus = localStorage.getItem(toggle);
      if (toggleStatus && toggleStatus === 'off') {
        $(`#toggle-${toggle}-check`).prop('checked', false);
        $(`#toggle-${toggle}`).removeClass('active');
      } else if (toggleStatus) {
        $(`#toggle-${toggle}-check`).prop('checked', true);
        $(`#toggle-${toggle}`).addClass('active');
      }
      // set cookie if it doesn't exist
      if (!toggleStatus) {
        localStorage.setItem(toggle, 'on');
        $(`#toggle-${toggle}-check`).prop('checked', true);
        $(`#toggle-${toggle}`).addClass('active');
      }
    });
}
function handleOptionClick(event) {
  const item = event.target.id.replace(/toggle\-/ig, '').replace(/\-check/ig, '');
  let newStatus = $(`#toggle-${item}-check`).prop('checked') ? 'off' : 'on';
  console.debug(`[DEBUG] clicked ${item} toggle: ${event.target.id}, new status: ${newStatus}`);
  if (newStatus === 'on') {
    $(`#toggle-${item}-check`).prop('checked', true);
  }
  localStorage.setItem(item, newStatus);
}

/* Ready, set, go! */
$(document).ready(function() {
  /* set up options clicks */
  $(".opts-h").on("click", handleOptionClick);
  $(function () {
    $('label.opts-h').tooltip({
      placement: 'bottom',
      title: 'Click to Toggle',
    });
  });
  loadToggles();

  /* G-tag analytics */
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-47080716-9');

  // justifyBtnGroup('options');

  /* Still not reloading, but it wipes data */
  $('.btn-reset').on('click', (e) => {
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
