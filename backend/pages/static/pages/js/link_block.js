/*
 * CMS link picker (pages/links.py LinkBlock): show only the field for the
 * chosen "Link to" option, so editors see one choice at a time instead of
 * every possible field. Works for links added after the page loads, too.
 */
(function () {
  'use strict';

  // "Link to" value → the field that goes with it. "none" shows nothing extra.
  var FIELD_FOR = {
    page: 'page', topic: 'topic', role: 'role', company: 'company', course: 'course',
    search: 'search', genex_page: 'genex_page', url: 'url', none: null,
  };

  function ownFields(container) {
    // The link block's own fields: [data-contentpath] elements whose nearest
    // field-holding ancestor is not another field of this same block.
    return Array.prototype.filter.call(container.querySelectorAll('[data-contentpath]'), function (el) {
      var holder = el.parentElement && el.parentElement.closest('[data-contentpath], .gelearn-link');
      return holder === container;
    });
  }

  function sync(container) {
    var fields = ownFields(container);
    var typeField = fields.find(function (el) { return el.getAttribute('data-contentpath') === 'link_type'; });
    var select = typeField && typeField.querySelector('select');
    if (!select) return;
    var shown = FIELD_FOR[select.value];
    fields.forEach(function (el) {
      var name = el.getAttribute('data-contentpath');
      if (name === 'link_type') return;
      // Inline display as well as `hidden`, so admin CSS can't override it.
      var hide = name !== shown;
      el.hidden = hide;
      el.style.display = hide ? 'none' : '';
    });
  }

  function setup(container) {
    if (container.dataset.linkPickerReady) return;
    container.dataset.linkPickerReady = 'true';
    container.addEventListener('change', function (event) {
      if (event.target.tagName === 'SELECT') sync(container);
    });
    sync(container);
  }

  function scan(root) {
    if (root.matches && root.matches('.gelearn-link')) setup(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('.gelearn-link'), setup);
  }

  document.addEventListener('DOMContentLoaded', function () {
    scan(document);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) { m.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); }); });
    }).observe(document.body, { childList: true, subtree: true });
  });
})();
