/*
globals

localStorage, navigator, $, fetch, Request, serviceAPI, historicalVideos, contentCreators,
generateNewToken, queue, limitToCreator, loadHistoricalVideo, makeHistoryRow, initialVideo,
getCurrentToggles, processVideoData, notify
*/
/* eslint-disable no-unused-vars */
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
      
      if (!$($('#creators').find('.row.text-center')[0]).children().length) {
        contentCreators.forEach(creator => {
          $($('#creators').find('.row.text-center')[0]).append(`
            <div class="col-sm-2" id='creator-${creator.id}'>
              <figure>
                <a href="/${creator.name}"><img src="${creator.thumb}" height="75px" />
                  <figcaption class="creator-name">${creator.nameDisp}</figcaption>
                </a>
              </figure>
            </div>`);
        });
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

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
    parseInt(limitToCreator, 10) && !ignoreTags ? `content_creator_ids=${limitToCreator}` : '',
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
