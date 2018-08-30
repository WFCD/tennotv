/*
 globals $
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
const url = 'http://xenogelion.com/Hidden/content_creator_scraper.php?method=get-content-creator-playlists';
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
    $(`#${id}`).append(`<div class="title">${name}</div><div class="bottom"></div>`);
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
            <i class="far fa-play-circle hide" id="${video.video_id}-button"></i>
            <img src="https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg" />
          </a>
        </span>`);
      $(`#${video.video_id}-video`).hover(() => {
        $(`#${video.video_id}-button`).toggleClass('hide');
      });
    });
  });

  $('.next').click(event => {
    const target = $(event.currentTarget);
    const scroll = target.parent().find('.scroll');
    const offset = $(scroll).scrollLeft();
    const width = $(scroll).width();

    $(scroll).animate({
      scrollLeft: offset + width,
    }, 500);
  });

  $('.previous').click(event => {
    const target = $(event.currentTarget);
    const scroll = target.parent().find('.scroll');
    const offset = $(scroll).scrollLeft();
    const width = $(scroll).width();

    $(scroll).animate({
      scrollLeft: offset - width,
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
