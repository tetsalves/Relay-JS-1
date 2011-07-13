(function ( $, window, undefined ){

var noop  = function() {};
var empty = [];

var _defaults = {
  onShow: noop,
  onClose: noop
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
       ._render({
         text   : Relay.settings.text,
         oktext : Relay.settings.oktext
       });

  return Relay;
};

Relay.fn = Relay.prototype = {
  version: '0.0.1',
  el: null,

  _attachEvents: function () {
    this.$Receiver.bind(_eventString, this._handleEvents);
    return this;
  },

  _setTemplate: function (type) {
    this.template = _templates[type];
    return this;
  },

  _render: function (view) {
    var string = this.template;

    for(var v in view) {
      if(view.hasOwnProperty(v)) {
        string = string.replace('{{ ' + v + ' }}', view[v]);
      }
    }

    this.$Relay = $(string);
    this.$Relay.delegate('button', 'click', function (e) {
      return false;
    });

    return this;
  },

  _handleEvents: function (event, Relay) {
    var callbacks = Relay.settings;
    switch(event.type) {
      case _events.show:
        callbacks.onShow.call(Relay);
        break;
      case _events.close:
        callbacks.onClose.call(Relay);
        break;
    }
    return Relay;
  },

  show: function () {
    if(_visible) {
      _queue[_queue.length] = this.show;
      return this;
    }

    this.$Receiver.trigger(_events.show, [this]);
    this.$Relay.appendTo('body').hide().fadeIn(200);

    _visible = true;
    return this;
  },

  close: function () {
    this.$Receiver.trigger(_events.close, [this]);
    this.$Relay.undelegate('button', 'click');
    this.$Relay.detach();

    if(_queue.length) {
      _queue.shift()();
    } else {
      _visible = false;
    }

    return this;
  }
};

var Foo = new Relay('alert', {
  text: 'I am a cool dude.',
  oktext: 'LOL',

  onShow: function () {
    console.log(this, ' is showing.');
  },
  onClose: function() {
    console.log(this, ' is closing.');
  }
});

var Bar = new Relay('confirm', {
  text: 'I am a bad dude.',

  onShow: function () {
    console.log('goodbye');
  },
  onClose: function() {
    alert('lol!');
  }
});

var Baz = new Relay();

window.Foo = Foo;
window.Bar = Bar;


// 
// var callbacks = {
//   ok  : $.noop,  
//   yes : $.noop,
//   no  : $.noop
// };
// 
// var events = {
//   ok  : 'relay:ok',
//   yes : 'relay:yes',
//   no  : 'relay:no'
// };
// 
// var defaults = {
//   
// };
// 
// var Relay = function(method, settings) {
//   var instance = this;
// 
//   settings = $.extend({}, defaults, callbacks, settings);
// 
//   instance.settings = settings;
//   instance.chain    = settings.chain || [];
//   instance.el       = $(templates[method]);
//   instance.test     = settings.test || instance.test;
//   switch(typeof method) {
//     case 'string':
//       // for(var i = instance.chain.length -1; i >= 0; i--) {
//       //   instance.chain.shift().call(instance);
//       // }
//       $('body').append(instance.el);
//       instance.bindEvents();
//       instance.el.trigger(events.ok);
//     break;
//   }
//   return instance;
// };
// 
// Relay.fn = Relay.prototype = {
//   chain: [],
//   test: function (txt) {
//     alert(txt);
//   },
//   bindEvents: function() {
//     var instance = this;
//     instance.el.bind(events.ok, function(e) {
//       instance.settings.ok.call(instance);
//     });
//   }
// };
// 
// // var noop = function () {};
// // 
// // var defaults = {
// //   content    : '',
// //   theme      : 'default',
// //   type       : 'text',
// //   ok         : noop,
// //   oktext     : 'Ok',
// //   cancel     : noop,
// //   canceltext : 'Cancel',
// //   yes        : noop,
// //   yestext    : 'Yes',
// //   no         : noop,
// //   notext     : 'No',
// //   watch      : {}
// // };
// // 
// // $('.relay_container button').live('click.relay', function (e) {
// //   _handleRelayAction($(this));
// //   return false;
// // }).live('keydown.relay', function (e) {
// //   if ($(this).hasClass('relay_focus')) {
// //     switch (e.keyCode) {
// //       case 13:
// //         _handleRelayAction($(this));
// //         return false;
// //       break;
// //     }
// //   }
// // }).live('focusin.relay', function (e) {
// //   $(this).addClass('relay_focus');
// // }).live('focusout.relay', function (e) {
// //   $(this).removeClass('relay_focus');
// // });
// // 
// // $('.relay_form').live('submit', function (e) {
// //   _handleRelayAction($(this).find('.relay_action_ok'));
// //   return false;
// // });
// // 
// // function _handleRelayAction(el) {
// //   var name = el.attr('name');
// //   var data = el.data('relay:settings');
// //   var relay = el.parents('.relay_wrapper').first();
// //   var answer = '';
// //   var valid = true;
// //   var watch = null;
// // 
// //   if(relay.find('.relay_textbox').length) {
// //     answer = relay.find('.relay_textbox').val();
// //     if(data.watch && typeof data.watch[answer] === 'function') {
// //       watch = data.watch[answer].call(el, answer);
// //       valid = false;
// //     }
// //   }
// // 
// //   if (valid === true) {
// //     if(typeof data[name] === 'function') data[name].call(el, answer);
// //     if (!watch || !watch instanceof Relay) {
// //       el.parents('.relay_wrapper').fadeOut(200, function () {
// //         $(this).remove();
// //       });
// //     }
// //   }
// // }
// // 
// // function _appendRelay(html, settings) {
// //   var relay   = $(html);
// //   var actions = relay.find('button');
// //  
// //   var ok = relay.find('.relay_action_ok');
// //   var textbox = relay.find('.relay_textbox');
// // 
// //   actions.data('relay:settings', settings);
// // 
// //   if($('#relay_wrapper').length) {
// //     $('#relay_wrapper').remove();
// //   }
// // 
// //   $('body').append(relay);
// // 
// //   relay.show();
// //   _position(relay);
// //   relay.hide();
// // 
// //   relay.show();
// //   textbox.length ? textbox.focus() : ok.focus();
// // }
// // 
// // function _position(relay) {
// //   var
// //     relay      = relay.find('.relay_container'),
// //     winWidth   = $(window).width(),
// //     winHeight  = $(window).height()
// //   ;
// // 
// //   var finalWidth = (winWidth / 2) - relay.outerWidth() / 2;
// //   var finalHeight = (winHeight / 2) - relay.outerHeight() / 2;
// // 
// //   relay.css({ left: finalWidth + 'px' });
// // }
// // 
// // function _makeTemplate(template, settings) {
// //   var html = template;
// //   for (var o in settings) {
// //     html = html.replace('{{ ' + o + ' }}', settings[o].length ? settings[o] : defaults[o]);
// //   }
// //   return html;
// // }
// // 
// // var Relay = function(method, settings) {
// //   this.init = false;
// // 
// //   if (this.init) return this;
// // 
// //   var template = '';
// // 
// //   if (!method || !settings) return false;
// // 
// //   settings = $.extend({}, defaults, settings);
// // 
// //   settings.theme = 'relay_theme_' + settings.theme;
// // 
// //   switch(typeof method) {
// //     case 'string':
// //       template = _makeTemplate(templates[method], settings);
// //       _appendRelay(template, settings);
// //     break;
// //     default:
// //     break;
// //   };
// // 
// //   this.init = true;
// // 
// //   return this;
// // }
// // 
// // Relay.prototype = {
// //   constructor: Relay
// // };
// 
// window.Relay = Relay;

})( jQuery, window );
