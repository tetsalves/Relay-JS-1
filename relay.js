(function ( $, window, undefined ) {

var templates = {
  alert: [
    '<div class="relay_wrapper relay_alert {{ theme }}" id="relay_wrapper">',
      '<form class="relay_container relay_form">',
        '<div class="relay_content">',
          '<p class="relay_header">{{ text }}</p>',
        '</div>',
        '<div class="relay_actions">',
          '<button type="button" name="ok" class="relay_action_ok" tabindex="1">{{ oktext }}</button>',
        '</div>',
      '</form>',
    '</div>'
  ].join(''),

  prompt: [
    '<div class="relay_wrapper relay_prompt {{ theme }}" id="relay_wrapper">',
      '<form class="relay_container relay_form">',
        '<div class="relay_content">',
          '<p class="relay_header">{{ text }}</p>',
          '<div class="relay_body">',
            '<input type="{{ type }}" class="relay_textbox" name="answer" tabindex="1">',
          '</div>',
        '</div>',
        '<div class="relay_actions">',
          '<button type="button" name="cancel" class="relay_action_cancel" tabindex="1">{{ canceltext }}</button>',
          '<button type="button" name="ok" class="relay_action_ok" tabindex="1">{{ oktext }}</button>',
        '</div>',
      '</form>',
    '</div>'
  ].join(''),

  confirm: [
    '<div class="relay_wrapper relay_confirm {{ theme }}" id="relay_wrapper">',
      '<form class="relay_container relay_form">',
        '<div class="relay_content">',
          '<p class="relay_header">{{ text }}</p>',
        '</div>',
        '<div class="relay_actions">',
          '<button type="button" name="no" tabindex="1">{{ notext }}</button>',
          '<button type="button" name="yes" class="relay_action_ok" tabindex="1">{{ yestext }}</button>',
        '</div>',
      '</div>',
    '</div>'
  ].join('')
};


var noop = function (wrapper) {
  wrapper.fadeOut(200);
};

var defaults = {
  content    : '',
  chain      : [],
  theme      : 'default',
  type       : 'text',
  ok         : noop,
  oktext     : 'Ok',
  cancel     : noop,
  canceltext : 'Cancel',
  yes        : noop,
  yestext    : 'Yes',
  no         : noop,
  notext     : 'No',
  watch      : {}
};

// $('.relay_form').live('submit', function (e) {
//   _handleRelayAction($(this).find('.relay_action_ok'));
//   return false;
// });
// 
// function _handleRelayAction(el) {

// }

var Relay = function(method, settings) {
  var relay = this;

  if (relay.init) return relay;
  if (!method || !settings) return false;

  relay.settings  = $.extend({}, defaults, settings);
  relay.settings.theme = 'relay_theme_' + settings.theme.replace('relay_theme', '');

  relay.elements = {};
  relay.template = '';
  relay.chain       = settings.chain;
  relay.chainbackup = function () { return settings.chain; };
  relay.rendered = '';

  switch(typeof method) {
    case 'string':
      relay._setTemplate(templates[method])
           ._makeTemplate()
           ._attach();
    break;
    default:
    break;
  };

  relay.init = true;

  return relay;
}

Relay.p = Relay.prototype = {
  init        : false,
  chain       : [],
  elements    : {},
  theme       : 'default',
  rendered    : '',
  template    : '',
  constructor : Relay
};

Relay.p.set = function(settings) {
  var relay = this;
  var els   = relay.elements;
  var defaults = {
    text   : relay.settings.text,
    restart: false
  };

  settings = $.extend({}, defaults, settings);

  els.header.text(settings.text);

  if(settings.restart === true) {
    relay.chain = relay.chainbackup;
  }

};

Relay.p._makeTemplate = function() {
  var html = this.template;
  for (var o in this.settings) {
    html = html.replace('{{ ' + o + ' }}', this.settings[o].length ? this.settings[o] : defaults[o]);
  }

  this.rendered = html;
  return this;
}

Relay.p._setTemplate = function(template) {
  this.template = template;
  return this;
}

Relay.p._attach = function() {
  var relay = this;

  relay.elements.wrapper   = $(relay.rendered);
  relay.elements.actions   = relay.elements.wrapper.find('button');
  relay.elements.ok        = relay.elements.wrapper.find('.relay_action_ok');
  relay.elements.textbox   = relay.elements.wrapper.find('.relay_textbox');
  relay.elements.container = relay.elements.wrapper.find('.relay_container');
  relay.elements.header    = relay.elements.container.find('.relay_header');

  $('body').append(relay.elements.wrapper);

  relay._position();

  relay.elements.textbox.length ? relay.elements.textbox.focus() : relay.elements.ok.focus();
  relay.elements.wrapper.fadeIn(200);


  relay.elements.actions.bind('click.relay', function (e) {
    relay._handleRelayAction($(this));
    return false;
  }).bind('keydown.relay', function (e) {
    if ($(this).hasClass('relay_focus')) {
      switch (e.keyCode) {
        case 13:
          relay._handleRelayAction($(this));
          return false;
        break;
      }
    }
  }).bind('focusin.relay', function (e) {
    $(this).addClass('relay_focus');
  }).bind('focusout.relay', function (e) {
    $(this).removeClass('relay_focus');
  });

  return relay;
}

Relay.p._position = function() {

  var
    relay      = this,
    container  = relay.elements.container,
    winWidth   = $(window).width(),
    winHeight  = $(window).height()
  ;

  relay.elements.wrapper.show();

  var finalWidth = (winWidth / 2) - container.outerWidth() / 2;
  var finalHeight = (winHeight / 2) - container.outerHeight() / 2;

  container.css({ left: finalWidth + 'px' });
  relay.elements.wrapper.hide();

  return relay;
}

Relay.p._handleRelayAction = function(el) {
  var relay   = this;
  var name    = el.attr('name');
  var data    = relay.settings;
  var wrapper = relay.elements.wrapper;
  var answer  = '';
  var valid   = true;
  var watch   = data.watch;

  if(relay.elements.textbox.length) {
    answer = relay.elements.textbox.val();
    if(data.watch && typeof data.watch[answer] === 'function') {
      watch = data.watch[answer].call(relay, wrapper, answer);
      valid = false;
    }
  }

  if (valid === true) {
    if (relay.chain && relay.chain.length) {
      var currentCallback = (function (chain) { return chain.shift(); })(relay.chain);
      switch(typeof currentCallback) {
        case 'function':
          // if(typeof data[name] === 'function') data[name].call(this, wrapper, answer);
        break;
        case 'object':
          if(typeof currentCallback[name] === 'function') c = currentCallback[name].call(relay, wrapper);
        break;
      }
      return relay;
    } else {
      if(typeof data[name] === 'function') data[name].call(relay, wrapper);
    }

    el.parents('.relay_wrapper').fadeOut(200, function () {
      $(this).remove();
    });
  }
}

window.Relay = Relay;

})( jQuery, window );
