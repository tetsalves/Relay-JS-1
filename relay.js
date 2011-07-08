(function ( $, window, undefined ){

var templates = {
  alert: [
    '<div class="relay_wrapper relay_alert {{ theme }}" id="relay_wrapper">',
      '<form class="relay_container relay_form">',
        '<div class="relay_content">',
          '<p class="relay_header">{{ text }}</p>',
        '</div>',
        '<div class="relay_actions">',
          '<button type="button" name="ok" class="relay_action_ok">{{ oktext }}</button>',
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
            '<input type="{{ type }}" class="relay_textbox" name="answer">',
          '</div>',
        '</div>',
        '<div class="relay_actions">',
          '<button type="button" name="cancel" class="relay_action_cancel">{{ canceltext }}</button>',
          '<button type="button" name="ok" class="relay_action_ok">{{ oktext }}</button>',
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
          '<button type="button" name="no">{{ notext }}</button>',
          '<button type="button" name="yes" class="relay_action_ok">{{ yestext }}</button>',
        '</div>',
      '</div>',
    '</div>'
  ].join('')
};


var noop = function () {};

var defaults = {
  content    : '',
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

$('.relay_container button').live('click.relay', function (e) {
  _handleRelayAction($(this));
  return false;
}).live('keydown.relay', function (e) {
  if ($(this).hasClass('relay_focus')) {
    switch (e.keyCode) {
      case 13:
        _handleRelayAction($(this));
        return false;
      break;
    }
  }
}).live('focusin.relay', function (e) {
  $(this).addClass('relay_focus');
}).live('focusout.relay', function (e) {
  $(this).removeClass('relay_focus');
});

$('.relay_form').live('submit', function (e) {
  _handleRelayAction($(this).find('.relay_action_ok'));
  return false;
});

function _handleRelayAction(el) {
  var name = el.attr('name');
  var data = el.data('relay:settings');
  var relay = el.parents('.relay_wrapper').first();
  var answer = '';
  var valid = true;
  var watch = null;

  if(relay.find('.relay_textbox').length) {
    answer = relay.find('.relay_textbox').val();
    if(data.watch && typeof data.watch[answer] === 'function') {
      watch = data.watch[answer].call(el, answer);
      valid = false;
    }
  }

  if (valid === true) {
    if(typeof data[name] === 'function') data[name].call(el, answer);
    if (!watch || !watch instanceof Relay) {
      el.parents('.relay_wrapper').fadeOut(200, function () {
        $(this).remove();
      });
    }
  }
}

function _appendRelay(html, settings) {
  var relay   = $(html);
  var actions = relay.find('button');
 
  var ok = relay.find('.relay_action_ok');
  var textbox = relay.find('.relay_textbox');

  actions.data('relay:settings', settings);

  if($('#relay_wrapper').length) {
    $('#relay_wrapper').remove();
  }

  $('body').append(relay);

  relay.show();
  _position(relay);
  relay.hide();

  relay.show();
  textbox.length ? textbox.focus() : ok.focus();
}

function _position(relay) {
  var
    relay      = relay.find('.relay_container'),
    winWidth   = $(window).width(),
    winHeight  = $(window).height()
  ;

  var finalWidth = (winWidth / 2) - relay.outerWidth() / 2;
  var finalHeight = (winHeight / 2) - relay.outerHeight() / 2;

  relay.css({ left: finalWidth + 'px' });
}

function _makeTemplate(template, settings) {
  var html = template;
  for (var o in settings) {
    html = html.replace('{{ ' + o + ' }}', settings[o].length ? settings[o] : defaults[o]);
  }
  return html;
}

var Relay = function(method, settings) {
  this.init = false;

  if (this.init) return this;

  var template = '';

  if (!method || !settings) return false;

  settings = $.extend({}, defaults, settings);

  settings.theme = 'relay_theme_' + settings.theme;

  switch(typeof method) {
    case 'string':
      template = _makeTemplate(templates[method], settings);
      _appendRelay(template, settings);
    break;
    default:
    break;
  };

  this.init = true;

  return this;
}

Relay.prototype = {
  constructor: Relay
};

window.Relay = Relay;

})( jQuery, window );
