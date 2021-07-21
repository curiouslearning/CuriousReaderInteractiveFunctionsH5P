var H5P = H5P || {};
/**
 * H5P audio module
 *
 * @external {jQuery} $ H5P.jQuery
 */
H5P.CRAudio = (function ($) {

  /**
  * @param {Object} params Options for this library.
  * @param {Number} id Content identifier.
  * @param {Object} extras Extras.
  * @returns {undefined}
  */

  function C(params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.contentId = id;
    this.params = params;
    this.extras = extras;
    this.splittedWord = params.timeStampForEachText;
    this.hightlightingColor = params.hightlightingColor;
    this.sentenceStyles = (params.sentence != undefined) ? params.sentence.params.text : '';
    this.highlightingColor = params.highlightingColor;
    this.toggleButtonEnabled = true;
    this.setAutoPlay = (this.params.cpAutoplay != undefined) ? this.params.cpAutoplay : false;

    // Retrieve previous state
    if (extras && extras.previousState !== undefined) {
      this.oldTime = extras.previousState.currentTime;
    }
    this.params = $.extend({}, {
      playerMode: 'minimalistic',
      fitToWrapper: false,
      controls: true,
      autoplay: false,
      audioNotSupported: "Your browser does not support this audio",
      playAudio: "Play audio",
      pauseAudio: "Pause audio",
    }, params);

    this.on('resize', this.resize, this);
  }

  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Adds a minimalistic audio player with only "play" and "pause" functionality.
   *
   * @param {jQuery} $container Container for the player.
   * @param {boolean} transparentMode true: the player is only visible when hovering over it; false: player's UI always visible
   */

  C.prototype.addMinimalAudioPlayer = function ($container, transparentMode) {
    var INNER_CONTAINER = 'h5p-audio-inner';
    var AUDIO_BUTTON = 'h5p-audio-minimal-button';
    var PLAY_BUTTON = 'h5p-audio-minimal-play';
    var PLAY_BUTTON_PAUSED = 'h5p-audio-minimal-play-paused';
    var PAUSE_BUTTON = 'h5p-audio-minimal-pause';

    var self = this;
    this.$container = $container;
    this.playOnDemand = false;

    self.$inner = $('<div/>', {
      'class': INNER_CONTAINER + (transparentMode ? ' h5p-audio-transparent' : '')
    }).appendTo($container);

    if (this.splittedWord != undefined) {
      var slideTextElement = '';
      for (let i = 0; i < this.splittedWord.length; i++) {
        slideTextElement = slideTextElement + "<span id=" + i + ">" + this.splittedWord[i].text.trim() + ' </span>'
      }
    }

    if (this.params.sentence.params.text != undefined) {
      var $elementText = $.parseHTML(this.params.sentence.params.text);
      var sentence = $($elementText)[0]
      do {
        var temp;
        if (sentence.children.length != 0) {
          sentence = sentence.children[0];
          if(sentence.children.length == 0)
          {
            temp = $(sentence)
            sentence.id = "sentence-style"
            sentence.innerHTML = slideTextElement;
            break;
          }
        } else {
            sentence.id = "sentence-style"
            sentence.innerHTML = slideTextElement;
            break;
        }
      } while (sentence.children.length != 0)
    }

    var audioButton = $($elementText).appendTo(self.$inner)
      .click(function (event) {
        if (!self.isEnabledToggleButton()) {
          return;
        }
        if (event.target.id != "" && self.audio.paused) {
          self.playOnDemand = true;
          spanTagId = parseInt((event.target.id).charAt((event.target.id.length - 1)));
          var selectedFontSize = self.parent == undefined ? $('#'+spanTagId).css('font-size'): $('.h5p-current').find('#'+spanTagId).css('font-size');
          var selectedTextColor = self.parent == undefined ? $('#'+spanTagId).css('color'): $('.h5p-current').find('#'+spanTagId).css('color');
          self.audio.currentTime = self.splittedWord[spanTagId]['startDuration'];
          self.audioEndTime = self.splittedWord[spanTagId]['endDuration'] - 0.23;
          self.play();
          if (self.parent != undefined) {
            $('.h5p-current').each(function () {
              $(this).find('#' +spanTagId).css({
                'font-size' : '40px',
                'color' : self.params.highlightingColor
              })
            })
            setTimeout(function () {
              $('.h5p-current').each(function () {
                $(this).find('#' +spanTagId).css({
                  'font-size' : selectedFontSize,
                  'color' : selectedTextColor
                })
              })
            }, 600)
          } else {
            $('#' +spanTagId).css({
              'font-size' : '40px',
              'color' : self.params.highlightingColor
            });
            setTimeout(function () {
              $('#' +spanTagId).css({
                'font-size' : selectedFontSize,
                'color' : selectedTextColor
              })
            }, 600)
          }
        }
      });

    if (this.params.fitToWrapper) {
      audioButton.css({
        //   'width': '100%',
        //   'height': '100%'
      });
    }

    //Event listeners that change the look of the player depending on events.
    self.audio.addEventListener('ended', function () {
      self.playOnDemand = false;
    });

    self.audio.addEventListener('pause', function () {
      $('.h5p-element-inner').css({
        'color': 'black'
      })
    });

    self.audio.addEventListener('timeupdate', function () {
      if (self.playOnDemand) {
        if (self.audio.currentTime >= self.audioEndTime) {
          self.pause();
          self.audio.currentTime = 0;
          self.playOnDemand = false;
        }
      } else {
        if (self.splittedWord != undefined) {
          var time = self.audio.currentTime, j = 0, word;
          var originalFont;
          //originalFont = $('#' + 0).css('font-size')
          self.originalFontColor = (($('#sentence-style')) != undefined) ? $('#sentence-style').css('color') : 'black'
  
          for (j = 0; j < self.splittedWord.length; j++) {
  
            word = self.splittedWord[j]
  
            if (word.highlighted == undefined) {
              word.highlighted = false
            }
            if (time > word['startDuration'] && time < word['endDuration']) {
              if (!word.highlighted) {
  
                word.highlighted = true;
                if (self.parent != undefined) {
  
                  $('.h5p-current').each(function () {
                    $(this).find('#' + j).css({
                      "color": self.highlightingColor,
                      // "font-size": ((Number(originalFont.slice(0, originalFont.length - 2)) +3).toString() + 'px'),
                    })
  
                  });
                }
                else {
                  $('#' + j).css({
                    "color": self.highlightingColor,
                    // "font-size": ((Number(originalFont.slice(0, originalFont.length - 2)) +3).toString() + 'px'),
                  })
                }
              }
            }
            else if (word.highlighted) {
              if (self.parent != undefined) {
                $('.h5p-current').each(function () {
                  $(this).find('#' + j).css({
                    "color": self.originalFontColor,
                    // "font-size": ((Number(originalFont.slice(0, originalFont.length - 2)) +3).toString() + 'px'),
                  })
  
                });
              }
              else {
                $('#' + j).css({
                  "color": self.originalFontColor,
                  // "font-size": ((Number(originalFont.slice(0, originalFont.length - 2)) +3).toString() + 'px'),
                })
              }
              word.highlighted = false;
            }
          }
        }
      }
    });

    this.$audioButton = audioButton;
    //Scale icon to container
    self.resize();
  };

  /**
   * Resizes the audio player icon when the wrapper is resized.
   */

  C.prototype.resize = function () {
    // Find the smallest value of height and width, and use it to choose the font size.
    if (this.params.fitToWrapper && this.$container && this.$container.width()) {
      var w = this.$container.width();
      var h = this.$container.height();
      if (w < h) {
        this.$audioButton.css({ 'font-size': w / 2 + 'px' });
      }
      else {
        this.$audioButton.css({ 'font-size': h / 2 + 'px' });
      }
    }
  };

  return C;
  
})(H5P.jQuery);
/**
 * Wipe out the content of the wrapper and put our HTML in it.
 *
 * @param {jQuery} $wrapper Our poor container.
 */
H5P.CRAudio.prototype.attach = function ($wrapper) {
  $wrapper.addClass('h5p-audio-wrapper');
  // Check if browser supports audio.
  var audio = document.createElement('audio');
  if (audio.canPlayType === undefined) {
    // Try flash
    this.attachFlash($wrapper);
    return;
  }
  // Add supported source files.
  if (this.params.files !== undefined && this.params.files instanceof Object) {
    for (var i = 0; i < this.params.files.length; i++) {
      var file = this.params.files[i];
      if (audio.canPlayType(file.mime)) {
        var source = document.createElement('source');
        source.src = H5P.getPath(file.path, this.contentId);
        source.type = file.mime;
        audio.appendChild(source);
      }
    }
  }
  if (!audio.children.length) {
    // Try flash
    this.attachFlash($wrapper);
    return;
  }
  if (this.endedCallback !== undefined) {
    audio.addEventListener('ended', this.endedCallback, false);
  }
  audio.className = 'h5p-audio';
  audio.controls = this.params.controls === undefined ? true : this.params.controls;
  audio.preload = 'auto';
  audio.style.display = 'block';
  if (this.params.fitToWrapper === undefined || this.params.fitToWrapper) {
    audio.style.width = '100%';
    if (!this.isRoot()) {
      // Only set height if this isn't a root
      audio.style.height = '100%';
    }
  }
  this.audio = audio;
  if (this.params.playerMode === 'minimalistic') {
    audio.controls = false;
    this.addMinimalAudioPlayer($wrapper, false);
  }
  else if (this.params.playerMode === 'transparent') {
    audio.controls = false;
    this.addMinimalAudioPlayer($wrapper, true);
  }
  else {
    audio.autoplay = this.params.autoplay === undefined ? false : this.params.autoplay;
    $wrapper.html(audio);
  }
  // Set time to saved time from previous run
  if (this.oldTime) {
    this.seekTo(this.oldTime);
  }
};

/**
 * Attaches a flash audio player to the wrapper.
 *
 * @param {jQuery} $wrapper Our dear container.
 */
H5P.CRAudio.prototype.attachFlash = function ($wrapper) {
  if (this.params.files !== undefined && this.params.files instanceof Object) {
    for (var i = 0; i < this.params.files.length; i++) {
      var file = this.params.files[i];
      if (file.mime === 'audio/mpeg' || file.mime === 'audio/mp3') {
        var audioSource = H5P.getPath(file.path, this.contentId);
        break;
      }
    }
  }
  if (audioSource === undefined) {
    $wrapper.addClass('h5p-audio-not-supported');
    $wrapper.html(
      '<div class="h5p-audio-inner">' +
      '<div class="h5p-audio-not-supported-icon"><span/></div>' +
      '<span>' + this.params.audioNotSupported + '</span>' +
      '</div>'
    );
    if (this.endedCallback !== undefined) {
      this.endedCallback();
    }
    return;
  }
  var options = {
    buffering: true,
    clip: {
      url: window.location.protocol + '//' + window.location.host + audioSource,
      autoPlay: this.params.autoplay === undefined ? false : this.params.autoplay,
      scaling: 'fit'
    },
    plugins: {
      controls: null
    }
  };
  if (this.params.controls === undefined || this.params.controls) {
    options.plugins.controls = {
      fullscreen: false,
      autoHide: false
    };
  }
  if (this.endedCallback !== undefined) {
    options.clip.onFinish = this.endedCallback;
    options.clip.onError = this.endedCallback;
  }
  this.flowplayer = flowplayer($wrapper[0], {
    src: "http://releases.flowplayer.org/swf/flowplayer-3.2.16.swf",
    wmode: "opaque"
  }, options);
};
/**
 * Stop the audio. TODO: Rename to pause?
 *
 * @returns {undefined}
 */
H5P.CRAudio.prototype.stop = function () {
  if (this.flowplayer !== undefined) {
    this.flowplayer.stop().close().unload();
  }
  if (this.audio !== undefined) {
    this.audio.pause();
  }
};
/**
 * Play
 */
H5P.CRAudio.prototype.play = function () {
  if (this.flowplayer !== undefined) {
    this.flowplayer.play();
  }
  if (this.audio !== undefined) {
    this.audio.play();
  }
};
/**
 * @public
 * Pauses the audio.
 */
H5P.CRAudio.prototype.pause = function () {
  if (this.audio !== undefined) {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
};
/**
 * @public
 * Seek to audio position.
 *
 * @param {number} seekTo Time to seek to in seconds.
 */
H5P.CRAudio.prototype.seekTo = function (seekTo) {
  if (this.audio !== undefined) {
    this.audio.currentTime = seekTo;
  }
};
/**
 * @public
 * Get current state for resetting it later.
 *
 * @returns {object} Current state.
 */
H5P.CRAudio.prototype.getCurrentState = function () {
  if (this.audio !== undefined) {
    const currentTime = this.audio.ended ? 0 : this.audio.currentTime;
    return {
      currentTime: currentTime
    };
  }
};
/**
 * @public
 * Disable button.
 * Not using disabled attribute to block button activation, because it will
 * implicitly set tabindex = -1 and confuse ChromeVox navigation. Clicks handled
 * using "pointer-events: none" in CSS.
 */
H5P.CRAudio.prototype.disableToggleButton = function () {
  this.toggleButtonEnabled = false;
  if (this.$audioButton) {
    this.$audioButton.addClass(Audio.BUTTON_DISABLED);
  }
};
/**
 * @public
 * Enable button.
 */
H5P.CRAudio.prototype.enableToggleButton = function () {
  this.toggleButtonEnabled = true;
  if (this.$audioButton) {
    this.$audioButton.removeClass(Audio.BUTTON_DISABLED);
  }
};
/**
 * @public
 * Check if button is enabled.
 * @return {boolean} True, if button is enabled. Else false.
 */
H5P.CRAudio.prototype.isEnabledToggleButton = function () {
  return this.toggleButtonEnabled;
};
/** @constant {string} */
H5P.CRAudio.BUTTON_DISABLED = 'h5p-audio-disabled';