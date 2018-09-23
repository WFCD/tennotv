/* eslint-disable no-unused-vars, no-global-assign */
/* globals updatePlaylist, YT, getVideos, notify, $, addWatchedVideo,
queue, ready, done, player, playlistVid, setUrl, contentCreators,
resolveVideo, loadAuthorSocialsByVideoId, initialVideo, hello
*/

var api_key = 'AIzaSyD22uMB0bxCnYFocXRDqdLatjWzmUPf_sw';
var access_token = 'MISSING';

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
  loadAuthorSocialsByVideoId(player.getVideoData().video_id);
  if (!initialVideo) {
    window.history.pushState('', '', `/v/${player.getVideoData().video_id}`);
  }
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
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
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

function likeVideo() {
  var videoId = player.getVideoData().video_id;
  // If the like button already has the 'liked' class and is pressed,
  // send the 'none' rating instead to undo the like (otherwise, like the video via post)
  if ($('#playerLike').hasClass('liked')) {
    var postUrl = 'https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=none&key='+api_key+'&access_token='
    tryAuthenticateAndPost(postUrl)
    $('#playerLike').removeClass('liked')
  } else {
    var postUrl = 'https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=like&key='+api_key+'&access_token='
    tryAuthenticateAndPost(postUrl)
    $('#playerLike').addClass('liked')
    $('#playerDislike').removeClass('disliked')
  }
}

function dislikeVideo() {
  var videoId = player.getVideoData().video_id
  // If the dislike button already has the 'disliked' class and is pressed,
  // send the 'none' rating instead to undo the dislike (otherwise, dislike the video via post)
  if ($('#playerDislike').hasClass('disliked')) {
    var postUrl = 'https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=none&key='+api_key+'&access_token='
    tryAuthenticateAndPost(postUrl)
    $('#playerDislike').removeClass('disliked')
  } else {
    var postUrl = 'https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=dislike&key='+api_key+'&access_token='
    tryAuthenticateAndPost(postUrl)
    $('#playerDislike').addClass('disliked')
    $('#playerLike').removeClass('liked')
  }
}

function tryAuthenticateAndPost(requestUrl) {
  // If the access_token is set to missing, this means we haven't gotten it yet,
  // so use the google API login immediately, then call the function again
  if (access_token == "MISSING") {
    hello('google').login(function() {
      console.log("Getting access token...")
      access_token = hello('google').getAuthResponse().access_token;
      tryAuthenticateAndPost(requestUrl)
    });
  }

  // If we fail, try logging in and calling the function again
  $.post(requestUrl+access_token, function() {
    console.log('Done!')
  }).fail(function() {
    console.log("Failed!")
    hello('google').login(function() {
      console.log("Getting new access token...")
      access_token = hello('google').getAuthResponse().access_token;
      tryAuthenticateAndPost(requestUrl)
    });
  })
}
