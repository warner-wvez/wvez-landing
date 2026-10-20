/* The email signup box (_includes/subscribe.html). Checks the address here,
   sends it to Brevo the same way Brevo's own form script does (?isAjax=1, the
   answer comes back as JSON), and shows Warner's messages in place. On success
   the form hides and only the thank-you line stays. With this file missing the
   form still works: it posts to Brevo and Brevo shows its own page. */
(function () {
  'use strict';

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  [].forEach.call(document.querySelectorAll('.subscribe-form'), function (form) {
    var box = form.parentNode;
    var input = form.querySelector('input[name="EMAIL"]');
    var button = form.querySelector('button');
    var msg = box.querySelector('.subscribe-msg');
    var say = function (text) { msg.textContent = text; };
    form.setAttribute('novalidate', '');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) { say(form.dataset.empty); input.focus(); return; }
      if (!EMAIL.test(value)) { say(form.dataset.invalid); input.focus(); return; }
      input.value = value;
      button.disabled = true;
      say('');
      fetch(form.action + '?isAjax=1', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.success) throw new Error('not saved');
          box.classList.add('subscribe-done');
          form.hidden = true;
          box.querySelector('.subscribe-line').hidden = true;
          say(form.dataset.note ? form.dataset.success + '\n' + form.dataset.note : form.dataset.success);
          // Which box people sign up from shows in GoatCounter as an event.
          if (window.goatcounter && window.goatcounter.count) {
            window.goatcounter.count({ path: 'subscribe-' + form.dataset.spot, title: 'Signed up (' + form.dataset.spot + ')', event: true });
          }
        })
        .catch(function () { say(form.dataset.error); })
        .then(function () { button.disabled = false; });
    });
  });
})();
