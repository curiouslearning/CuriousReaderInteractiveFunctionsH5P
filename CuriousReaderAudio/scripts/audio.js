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
    this.clickByPlayOnDemand = false;
    this.toggleButtonEnabled = true;
    // console.log(params)
    // console.log(extras)
    // console.log($(this).parent())
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
      pauseAudio: "Pause audio"
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
    self.$inner = $('<div/>', {
      'class': INNER_CONTAINER + (transparentMode ? ' h5p-audio-transparent' : '')
    }).appendTo($container);

    

    var audioButton = $('<button/>', {
      'class': AUDIO_BUTTON + " " + PLAY_BUTTON,
      'aria-label': this.params.playAudio
    }).appendTo(self.$inner)
      .click( function () {
        if (!self.isEnabledToggleButton()) {
          return;
        }

        // Prevent ARIA from playing over audio on click
        this.setAttribute('aria-hidden', 'true');

        if (self.audio.paused) {
          self.play();
        }
        else {
          self.pause();
        }
      })
      .on('focusout', function () {
        // Restore ARIA, required when playing longer audio and tabbing out and back in
        this.setAttribute('aria-hidden', 'false');
      });

    //Fit to wrapper
    if (this.params.fitToWrapper) {
      audioButton.css({
        'width': '100%',
        'height': '100%'
      });
    }

    // cpAutoplay is passed from coursepresentation
    if (this.params.autoplay) {
      self.play();
    }

    //Event listeners that change the look of the player depending on events.
    self.audio.addEventListener('ended', function () {
      audioButton
        .attr('aria-hidden', false)
        .attr('aria-label', self.params.playAudio)
        .removeClass(PAUSE_BUTTON)
        .removeClass(PLAY_BUTTON_PAUSED)
        .addClass(PLAY_BUTTON);
    });

    self.audio.addEventListener('play', function () {
      audioButton
        .attr('aria-label', self.params.pauseAudio)
        .removeClass(PLAY_BUTTON)
        .removeClass(PLAY_BUTTON_PAUSED)
        .addClass(PAUSE_BUTTON);
    });

    self.audio.addEventListener('pause', function () {
      audioButton
        .attr('aria-hidden', false)
        .attr('aria-label', self.params.playAudio)
        .removeClass(PAUSE_BUTTON)
        .addClass(PLAY_BUTTON_PAUSED);
    });

    self.audio.addEventListener('timeupdate', function () {
      if(self.clickByPlayOnDemand){
      }
      else{
      if (self.splittedWord != undefined) {
        var time = self.audio.currentTime, j = 0, word;
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
                  $(this).find('#' + self.subContentId + j).parent('div').css({
                    "transform": 'scale(1.5)',
                    'z-index': '2',
                    'text-shadow': '0px 0px 5px yellow',
                  });
                  self.parent.animation($('#img' + self.subContentId + j).parent('div').parent('div'))
                });

              }
              else {
                $('#' + j).css({
                  "color": 'red',
                })
              }
            }
          }
          else if (word.highlighted) {
            if (self.parent != undefined) {
              $('.h5p-current').each(function () {
                $(this).find('#' + self.subContentId + j).parent('div').css({
                  "transform": 'scale(1)',
                  'z-index': '1',
                  'text-shadow': '0px 0px 5px yellow',
                });
              });
            }
            else {
              $('#' + j).css({
                "color": 'red',
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
        this.$audioButton.css({'font-size': w / 2 + 'px'});
      }
      else {
        this.$audioButton.css({'font-size': h / 2 + 'px'});
      }
    }
  };

  C.prototype.playOnDemand = function (id) {
    var that=this
    if (id != ""  && !this.clickByPlayOnDemand) {
      this.clickByPlayOnDemand = true;
      const spanTagId = id;
      //const clickedIndex = spanTagId.replace(this.subContentId, "")
      const clickedIndex = spanTagId[spanTagId.length-1]
      const selectedTextColor = this.parent == undefined ? $('#' + spanTagId).css('color') : $('.h5p-current').find('#' + spanTagId).css('color');
      this.audio.currentTime = this.splittedWord[clickedIndex]['startDuration'];
      this.audioEndTime = this.splittedWord[clickedIndex]['endDuration'] - 0.23;
      this.play();
      if (this.parent != undefined) {
        // var i=0;
        $('.h5p-current >div').each(function (index,element) {
          var h5pCurrentInnerDiv=(element.children[0].children[0]!=undefined)?element.children[0].children[0]:element
           $(this).find('#' + spanTagId).parent('div').css({
            "transform": 'scale(1.5)',
            'z-index': '2',
            'color': that.highlightingColor,
            'text-shadow': '0px 0px 5px yellow',
          });
           if(h5pCurrentInnerDiv.id.substr(0,3)=='img' && h5pCurrentInnerDiv.id!=undefined)
           {
             if('img'+spanTagId==h5pCurrentInnerDiv.id)
             {
              //that.glow($(this).find('#img' + spanTagId).parent('div').parent('div'));
              that.parent.animation($(this).find('#img' +spanTagId).parent('div'))

             }
           }
         
          // console.log($(this).find('#img' + spanTagId))
          // $(this).find('#img' + spanTagId).parent('div').parent('div')
          // that.pop($('#img' + spanTagId))
        })
       
        // $('.h5p-current').each(function () {
        //   console.log(i++)
        //   $(this).find('#' + spanTagId).parent('div').css({
        //     "transform": 'scale(1.5)',
        //     'z-index': '2',
        //     'color': that.highlightingColor,
        //     'text-shadow': '0px 0px 5px yellow',
        //   });
        //   console.log($(this).find('#img' + spanTagId))
        //   $(this).find('#img' + spanTagId).parent('div').parent('div')
        //   // that.pop($('#img' + spanTagId))
        // })
        setTimeout(function () {
          $('.h5p-current').each(function () {
            $(this).find('#' + spanTagId).parent('div').css({
              "transform": 'scale(1)',
              'z-index': '1',
              'color': selectedTextColor,
              'text-shadow': '0px 0px 5px transparent'
            });
          })
        }, 1000)
      } else {
        $('#' + spanTagId).css({
          'font-size': '115%',
          'color': that.params.highlightingColor
        });
        setTimeout(function () {
          $('#' + spanTagId).css({
            'font-size': selectedFontSize,
            'color': selectedTextColor
          })
        }, 600)
      }
    }

  }


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
