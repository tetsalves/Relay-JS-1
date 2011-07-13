(function ( $, window, undefined ){

var noop  = function() {};
var empty = [];

var _defaults = {
  text        : '',
  oktext      : 'Ok',
  yestext     : 'Yes',
  notext      : 'No',
  canceltext  : 'Cancel',
  show        : noop,
  yes         : noop,
  no          : noop,
  ok          : noop,
  cancel      : noop,
  close       : noop
};

var _queue = [];
var _visible = false;

var _events = {
  input  : 'relay:input',
  show   : 'relay:show',
  yes    : 'relay:yes',
  no     : 'relay:no',
  ok     : 'relay:ok',
  cancel : 'relay:cancel',
  close  : 'relay:close'
};

var _eventString = [
  _events.input,
  _events.show,
  _events.yes,
  _events.no,
  _events.ok,
  _events.cancel,
  _events.close
].join(' ').replace(/_/g, ':');;

var _templates = {
  alert: [
    '<div class="relay_wrapper relay_alert relay_theme_nes" id="relay_wrapper">',
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

// Position a relay element
function _position($Relay) {
  var
    $container = $Relay.find('.relay_container'),
    winWidth   = $(window).width(),
    winHeight  = $(window).height()
  ;

  var finalWidth = (winWidth / 2) - $container.outerWidth() / 2;
  var finalHeight = (winHeight / 2) - $container.outerHeight() / 2;

  $container.css({ left: finalWidth + 'px' });
}

// Handle events triggered on a Relay element
function _handleEvents(event, Relay) {
  var callbacks = Relay.settings;

  switch(event.type) {
    case _events.show:
      callbacks.show.call(Relay);
      break;
    case _events.ok:
      callbacks.ok.call(Relay);
      break;
    case _events.close:
      callbacks.close.call(Relay);
      break;
    case _events.yes:
      callbacks.yes.call(Relay);
      break;
    case _events.no:
      callbacks.no.call(Relay);
      break;
    case _events.cancel:
      callbacks.cancel.call(Relay);
      break;
  }
  return Relay;
}

function _render(Relay, view) {
  var string = Relay.template;

  for(var v in view) {
    if(view.hasOwnProperty(v)) {
      string = string.replace('{{ ' + v + ' }}', view[v]);
    }
  }

  Relay.$Relay = $(string);

  Relay.$Relay.delegate('button', 'click', function (e) {
    var clicked = $(this).attr('name');
    Relay[clicked]();
    return false;
  });

  return Relay;
}

var Relay = function(type, settings) {

  if(!type && !_templates[type]) {
    return "You must supply a valid type to Relay.";
  }

  var Relay = this;

  Relay.type = type || 'alert';
  Relay.$Receiver = $('<b/>');

  Relay.settings = $.extend({}, _defaults, settings);

  Relay._setTemplate(Relay.type)
       ._attachEvents()

  _render(Relay, Relay.settings);

  return Relay;
};

Relay.fn = Relay.prototype = {
  el: null,

  _attachEvents: function () {
    this.$Receiver.bind(_eventString, _handleEvents);
    return this;
  },

  _setTemplate: function (type) {
    this.template = _templates[type];
    return this;
  },

  show: function () {
    // if(_visible) {
    //   _queue[_queue.length] = this.show;
    //   return this;
    // }

    this.$Relay.appendTo('body').hide().fadeIn(200);
    this.$Receiver.trigger(_events.show, [this]);

    _position(this.$Relay);

    // _visible = true;
    return this;
  },

  ok: function () {
    this.close();
    this.$Receiver.trigger(_events.ok, [this]);
    return this;
  },

  cancel: function () {
    this.close();
    this.$Receiver.trigger(_events.cancel, [this]);
    return this;
  },

  yes: function () {
    this.close();
    this.$Receiver.trigger(_events.yes, [this]);
    return this;
  },

  no: function () {
    this.close();
    this.$Receiver.trigger(_events.no, [this]);
    return this;
  },

  close: function () {
    this.$Relay.fadeOut(200, function () { $(this).detach(); });
    this.$Receiver.trigger(_events.close, [this]);

    // if(_queue.length) {
    //   _queue.shift()();
    // } else {
    //   _visible = false;
    // }

    return this;
  }
};

window.Relay = Relay;

})( jQuery, window );
