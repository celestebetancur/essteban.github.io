// Load YouTube players only when someone actually presses play.
// Without JS each thumbnail is a normal link to YouTube.
document.addEventListener('click', function (e) {
  var a = e.target.closest('a.yt');
  if (!a || !a.dataset.id || a.classList.contains('playing')) return;
  e.preventDefault();
  var id = a.dataset.id, start = a.dataset.start;
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1' + (start ? '&start=' + start : '');
  f.title = a.getAttribute('aria-label') || 'YouTube video';
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  a.classList.add('playing');
  a.appendChild(f);
});
