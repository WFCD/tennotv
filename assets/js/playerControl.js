/* eslint-disable no-unused-vars, no-global-assign */
/* globals updatePlaylist, YT, getVideos, notify, $, addWatchedVideo,
queue, ready, done, player, playlistVid, setUrl, contentCreators,
resolveVideo, loadAuthorSocialsByVideoId
*/

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
  setUrl(`/v/${videoId}`);
  $('.table-active').removeClass('table-active');
  $(`#playlist #${videoId}`).addClass('table-active');
  player.loadVideoById(videoId);
  addWatchedVideo(videoId);
  loadAuthorSocialsByVideoId(videoId);
  if (queue[queue.length - 1].video_id === videoId) {
    getVideos(true);
  }
}
function loadHistoricalVideo(videoId) {
  if (!playlistVid) {
    playlistVid = player.getVideoData().video_id;
  }
  setUrl(`/v/${videoId}`);
  $('.table-active').removeClass('table-active');
  $(`#historyList #${videoId}`).addClass('table-active');
  player.loadVideoById(videoId);
}

/* Player events */
function onPlayerReady(event) {
  event.target.playVideo();
  loadAuthorSocialsByVideoId(player.getVideoData.video_id);
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
    $('.table-active').removeClass('table-active');
    $(`#playlist #${videoId}`).addClass('table-active');
    addWatchedVideo(videoId);
  }
  if (player && ready && done) {
    loadVideo(videoId);
  }
}
