/*
global
makeTags, lastInd, loadVideo, $, lastInd, validToggles, resetToggles, resetWatchedVideos, alerts
SVGInjector, gapi, getContentCreators, getVideos, getHistoricalVideos, initialVideo, localStorage
*/
/* eslint-disable no-unused-vars */

function makeHistoryRow(video) {
  /* eslint-disable no-plusplus */
  return `<tr id="${video.video_id}" class="video-row">
    <td class="title col-md-7"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}">${video.video_title}</a></td>
    <td class="author col-md-2"><a href="/${video.account_name.replace(/\s/ig, '').toLowerCase()}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">${video.account_name}</a></td>
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
}

function makeRow(video) {
  const authorSpan = `<span class='author-name'>${video.account_name}</span>`;
  const authorImg = video.author_yt_thumbnail ? `<img class="author-img" alt="${video.account_name}" title="${video.account_name}" src="${video.author_yt_thumbnail}">` : '';
  const authorLink = `<a href="/${video.account_name.replace(/\s/ig, '').toLowerCase()}" name="${video.account_name}'s Channel" target="_blank" rel="noopener">${authorImg}${authorSpan}</a>`;
  const authorRow = `<td class="author col-md-2">${authorLink}</td>`;

  /* eslint-disable no-global-assign */
  return `<tr id="${video.video_id}" class="video-row">
    <td scope="row" class="numRow col-md-1" style>${++lastInd}</th>
    <td class="title col-md-6"><a href="${video.video_id}" target="_blank" rel="noopener" name="${video.video_title}"><i class="fas fa-play"></i>${video.video_title}</a></td>
    ${authorRow}
    <td class="tags col-md-3">${makeTags(video.video_tag_ids)}</td>
  </tr>`;
  /* eslint-enable no-global-assign */
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

function handleOptionClick(event) {
  const item = event.target.id.replace(/toggle-/ig, '').replace(/-check/ig, '').replace(/-img/ig, '');
  const newStatus = $(`#toggle-${item}-check`).prop('checked') ? 'off' : 'on';
  if (newStatus === 'on') {
    $(`#toggle-${item}-check`).prop('checked', true);
  }
  localStorage.setItem(item, newStatus);
  window.location.reload();
}

function handleOptionDropdownClick(event) {
  // do nothing
  const target = $(event.currentTarget);
  const newStatus = !target.hasClass('active');
  const tag = target.attr('data-toggle-opt');
  // add class to text-based
  target.toggleClass('active');
  // add checkbox
  $(`#toggle-${tag}-check`).prop('checked', newStatus);
  // add active on toggle
  $(`#toggle-${tag}`).toggleClass('active');
  localStorage.setItem(tag, newStatus ? 'on' : 'off');
  event.stopPropagation();
}

function loadToggles() {
  validToggles.forEach(toggle => {
    const currentToggleStatus = localStorage.getItem(toggle);
    if (currentToggleStatus && currentToggleStatus === 'off') {
      $(`#toggle-${toggle}-check`).prop('checked', false);
      $(`#toggle-${toggle}`).removeClass('active');
      $('.opts').find(`[data-toggle-opt="${toggle}"]`).removeClass('active');
    } else if (currentToggleStatus) {
      $(`#toggle-${toggle}-check`).prop('checked', true);
      $(`#toggle-${toggle}`).addClass('active');
      $('.opts').find(`[data-toggle-opt="${toggle}"]`).addClass('active');
    }
    // set cookie if it doesn't exist
    if (!currentToggleStatus) {
      localStorage.setItem(toggle, 'off');
      $(`#toggle-${toggle}-check`).prop('checked', false);
      $(`#toggle-${toggle}`).removeClass('active');
      $('.opts').find(`[data-toggle-opt="${toggle}"]`).removeClass('active');
    }

    $(`[data-toggle-opt="${toggle}"]`).on('click', handleOptionDropdownClick);
  });
}

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

  if ($('#top-nav').width() < 990) {
    $('#logo').attr('src', '/img/logos/logo-50.webp');
  } else {
    $('#logo').attr('src', '/img/logos/banner.webp');
  }
};

$(document).ready(() => {
  if (initialVideo) {
    window.history.pushState('', '', '/');
  }

  $('.opts-h').on('click', handleOptionClick);
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

  gapi.load('ytsubscribe');
  getContentCreators();

  $(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });

  $('.btn-social').on('click', event => {
    window.open(event.currentTarget.getAttribute('href'), '_blank');
  });
});

getVideos(true);
getHistoricalVideos();
$(window).resize(adjustPlayerSize);
