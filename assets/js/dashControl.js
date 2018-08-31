/*
 globals $, serviceAPI
*/

const requestInfo = {
  method: 'GET',
  header: {
    'content-type': 'application/json',
    'user-agent': navigator.userAgent,
  },
  credentials: 'omit',
  referrer: 'no-referrer',
};
const url = `${serviceAPI}/dashboard`;
const request = new Request(url, requestInfo);

const construct = async () => {
  const jsonResponse = await getRequest();
  jsonResponse.forEach(account => {
    /* break everything down into easier to read variable names */
    const name = account.account_name;
    const id = name.replace(/ /g, '_').toLowerCase();
    const accountPlaylist = account.playlist;

    /* create the initial object */
    $('#dashboard_results').append(`<div id="${id}" class="content_creator_playlist"></div>`);

    /* create title element */
    $(`#${id}`).append(`
        <div class="title">
            <a href="/${name}">
                ${name} <i class="fas fa-play"></i>
            </a>
        </div>
        <div class="bottom"></div>`);
    $(`#${id} .bottom`).append(`
      <div class="previous">
        <i class="fas fa-angle-left"></i>
      </div>
      <div class="scroll">
        <div class="playlist"></div>
      </div>
      <div class="next text-right">
        <i class="fas fa-angle-right"></i>
      </div>`);

    accountPlaylist.forEach(video => {
      $(`#${id} .playlist`).append(`
        <span class="video" id='${video.video_id}-video'>
          <a href="/v/${video.video_id}">
            <i class="fas fa-play faded" id="${video.video_id}-button"></i>
            <img src="https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg" />
            <div class='shade hide text-center'>
              <div class='shade-author hide'>${video.account_name}</div>
              <div class='shade-title'>${video.video_title}</div>
            </div>
          </a>
        </span>`);
      $(`#${video.video_id}-video`).hover(() => {
        $(`#${video.video_id}-button`).toggleClass('faded');
        $(`#${video.video_id}-video`).find('.shade').toggleClass('hide');
      });
    });
  });

  let videoWidth = null;

  $('.next').click(event => {
    if (!videoWidth) {
      videoWidth = $('.video').width()
            + Number($('.video').css('margin-left').replace('px', ''))
            + Number($('.video').css('margin-right').replace('px', ''));
    }

    const target = $(event.currentTarget);
    const scroll = target.parent().find('.scroll');
    const offset = $(scroll).scrollLeft();
    const width = $(scroll).width();
    const scrollLeft = offset + ((width / videoWidth).toFixed(0) * videoWidth) - videoWidth;

    $(scroll).animate({
      scrollLeft,
    }, 500);
  });

  $('.previous').click(event => {
    if (!videoWidth) {
      videoWidth = $('.video').width()
            + Number($('.video').css('margin-left').replace('px', ''))
            + Number($('.video').css('margin-right').replace('px', ''));
    }

    const target = $(event.currentTarget);
    const scroll = target.parent().find('.scroll');
    const offset = $(scroll).scrollLeft();
    const width = $(scroll).width();
    const scrollLeft = offset - ((width / videoWidth).toFixed(0) * videoWidth) + videoWidth;
    $(scroll).animate({
      scrollLeft,
    }, 500);
  });
};

async function getRequest() {
  try {
    const response = await fetch(request);
    if (!response.ok) {
      console.error('[ERROR] Bad stuff.');
    } else {
      return response.json();
    }
  } catch (error) {
    console.error(error);
  }
  return undefined;
}

construct();
