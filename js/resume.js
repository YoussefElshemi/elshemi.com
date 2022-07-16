(function ($) {
  "use strict";

  const theme = document.getElementById('theme-stylesheet');
  if (localStorage.getItem('theme') === 'dark') {
    theme.setAttribute('href', 'css/dark.css');
  } else {
    theme.setAttribute('href', 'css/light.css');
  }

  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  $('.js-scroll-trigger').click(function () {
    $('.navbar-collapse').collapse('hide');
  });

  $('body').scrollspy({
    target: '#sideNav'
  });

  $('#theme').click(function () {
    if (theme.getAttribute('href') == 'css/light.css') {
      theme.setAttribute('href', 'css/dark.css');
      localStorage.setItem('theme', 'dark');
    } else {
      theme.setAttribute('href', 'css/light.css');
      localStorage.setItem('theme', 'light');
    }
  });

})(jQuery);
