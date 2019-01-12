/*
 globals $
*/

const shadeHoverSetup = () => {
  $('[data-button]').each((index, element) => {
    const target = $(element);
    const vid = target.attr('data-button');
    target.hover(() => {
      $(`#${vid}-button`).toggleClass('faded');
      $(`#${vid}-video`).find('.shade').toggleClass('hide');
    });
  });
};

const construct = async () => {
  shadeHoverSetup();

  let videoWidth = null;

  /**
   * Defines what happenes when the "next" button is pressed.
   **/
  $('.next').click(event => {
    if (!videoWidth) {
      videoWidth = $('.video').width()
        + Number($('.video').css('margin-left').replace('px', ''))
        + Number($('.video').css('margin-right').replace('px', ''));
    }

    const target = $(event.currentTarget);
    const scroll = $(target.parent().find('.scroll'));
    const offset = scroll.scrollLeft();
    const width = scroll.width();
    const scrollLeft = offset + (((width / videoWidth).toFixed(0) * videoWidth) - videoWidth);
    const scrolled = Math.ceil(offset + width + 5);
    const fullWidth = Math.ceil(videoWidth * scroll.find('.playlist').children().length);

    if (scrolled === fullWidth) {
      target.addClass('hide');
    }
    target.siblings('.previous.hide').removeClass('hide');
    scroll.animate({
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
    const scroll = $(target.parent().find('.scroll'));
    const offset = scroll.scrollLeft();
    const width = scroll.width();
    const scrollLeft = offset - (((width / videoWidth).toFixed(0) * videoWidth) + videoWidth);

    scroll.animate({
      scrollLeft,
    }, 500);

    setTimeout(() => {
      if (scroll.scrollLeft() === 0) {
        target.addClass('hide');
      }

      const scrolled = Math.ceil(offset + width + 5);
      const fullWidth = Math.ceil(scroll.scrollLeft() * scroll.find('.playlist').children().length);
      if (scrolled !== fullWidth) {
        target.siblings('.next.hide').removeClass('hide');
      }
    }, 600);
  });

  $('[data-tab-id]').each((index, element) => {
    const target = $(element);
    if (target.hasClass('active')) {
      $(`#${target.attr('data-tab-id')}`).show();
    } else {
      $(`#${target.attr('data-tab-id')}`).hide();
    }
  });

  $('[data-tab-id]').click(async e => {
    const target = $(e.currentTarget);
    if (!target.attr('disabled')) {
      $('.body-wrapper').hide();
      $('[data-tab-id]').removeClass('active');
      target.addClass('active');
      $(`#${target.attr('data-tab-id')}`).show();
      await construct();
      shadeHoverSetup();
    }
  });

  /**
   * Fix for large width error causing strange spacing and overflowing shade.
   */
  $('.video').each((index, element) => {
    $(element).width($($(element).find('img')).width());
  });
};

$(document).ready(() => {
  construct();
});
