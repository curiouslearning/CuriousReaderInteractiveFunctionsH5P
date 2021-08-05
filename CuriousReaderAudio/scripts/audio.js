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
    this.splittedWord = (params.timeStampForEachText != undefined) ? params.timeStampForEachText : '';
    this.sentenceStyles = (params.sentence != undefined) ? params.sentence.params.text : '';
    this.highlightingColor = params.highlightingColor;
    this.toggleButtonEnabled = true;
    this.setAutoPlay = (this.params.cpAutoplay != undefined) ? this.params.cpAutoplay : false;
    console.log(params)
    console.log(id)
    console.log(extras)

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
  C.prototype.dummy = function () {
    console.log('Dummy function')
  }

  C.prototype.addMinimalAudioPlayer = function ($container, transparentMode) {
    var INNER_CONTAINER = 'h5p-audio-inner';
    var AUDIO_BUTTON = 'h5p-audio-minimal-button';
    var PLAY_BUTTON = 'h5p-audio-minimal-play';
    var PLAY_BUTTON_PAUSED = 'h5p-audio-minimal-play-paused';
    var PAUSE_BUTTON = 'h5p-audio-minimal-pause';
    var self =this
    this.$container = $container;
    this.clickByPlayOnDemand = false;
    
    self.$inner = $('<div/>', {
      'class': INNER_CONTAINER + (transparentMode ? ' h5p-audio-transparent' : '')
    }).appendTo($container);

    if (this.splittedWord != undefined) {
      var slideTextElement = '';
      for (let i = 0; i < this.splittedWord.length; i++) {
        console.log(self.subContentId)
        slideTextElement = slideTextElement + "<div class='divText'><span id=" + self.subContentId + i + ">" + this.splittedWord[i].text.trim() + ' </span></div>'
      }
    }
    var $elementText
    if (this.params.sentence.params.text != undefined) {
      var $elementText = $.parseHTML(this.params.sentence.params.text);
      var sentence = $($elementText)[0]
      do {
        var temp;
        if (sentence.children.length != 0) {
          sentence = sentence.children[0];
          if (sentence.children.length == 0) {
            temp = $(sentence)
            sentence.className = "sentence-style"
            sentence.innerHTML = slideTextElement;
            break;
          }
        } else {
          sentence.className = "sentence-style"
          sentence.innerHTML = slideTextElement;
          break;
        }
      } while (sentence.children.length != 0)
    }
    else{
     $elementText=$.parseHTML('<span class=sentence-style></span>');
    
     console.log($elementText)
     $elementText[0].innerHTML=slideTextElement
     //$elementText[0].append(slideTextElement)
    }
    console.log($elementText)
    var audioButton = $($elementText).appendTo(self.$inner)
      .click(function (event) {

        console.log(self)
        console.log(self.subContentId)
        console.log(event.target.id)
        if (!self.isEnabledToggleButton()) {
          return;
        }
        self.playOnDemand(event.target.id)
      });

    //Event listeners that change the look of the player depending on events.
    self.audio.addEventListener('ended', function () {
      self.clickByPlayOnDemand = false;
    });

    // self.audio.addEventListener('pause', function () {
    //   $('.h5p-element-inner').css({
    //     'color': 'black'
    //   })
    // });

    self.audio.addEventListener('timeupdate', function () {
      if (self.clickByPlayOnDemand) {
        if (self.audio.currentTime >= self.audioEndTime) {
          self.pause();
          self.audio.currentTime = 0;
          setTimeout(function () {
            self.clickByPlayOnDemand = false;
          }, 1000)
        }
      } 
      else {
        if (self.splittedWord != undefined) {
          var time = self.audio.currentTime, j = 0, word;
          self.originalFontColor = (($('.sentence-style')) != undefined) ? $('.sentence-style').css('color') : 'black'
          for (j = 0; j < self.splittedWord.length; j++) {
            console.log("Inside for loop")
            console.log(time)
            word = self.splittedWord[j]
            if (word.highlighted == undefined) {
              word.highlighted = false
            }
            if (time > word['startDuration'] && time < word['endDuration']) {
              if (!word.highlighted) {
                console.log('Inside highlight')
                word.highlighted = true;
                if (self.parent != undefined) {
                  $('.h5p-current').each(function () {
                    $(this).find('#' + self.subContentId + j).parent('div').css({
                      "transform": 'scale(1.5)',
                      'z-index': '2',
                      'text-shadow' : '0px 0px 20px yellow',
                      'color' : self.highlightingColor
                    });
                    self.glow($('#img' + self.subContentId + j).parent('div').parent('div'));
                    //this.parent.prototype.spin('#img' + self.subContentId + j)
                    //$(this).find('#img' + self.subContentId + j)
                  });
                }
                else {
                  $('#' + self.subContentId + j).css({
                    "color": self.highlightingColor,
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
                    'text-shadow' : '0px 0px 20px transparent',
                    'color' :  self.originalFontColor
                  });
                });
              }
              else {
                $('#' + j).css({
                  "color": self.originalFontColor,
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

  C.prototype.playOnDemand = function (id) {
    console.log(id)
    var that=this
    if (id != ""  && !this.clickByPlayOnDemand) {
      this.clickByPlayOnDemand = true;
      const spanTagId = id;
      //const clickedIndex = spanTagId.replace(this.subContentId, "")
      const clickedIndex = spanTagId[spanTagId.length-1]
      const selectedTextColor = this.parent == undefined ? $('#' + spanTagId).css('color') : $('.h5p-current').find('#' + spanTagId).css('color');
      console.log(this)
      console.log(this.splittedWord)
      this.audio.currentTime = this.splittedWord[clickedIndex]['startDuration'];
      this.audioEndTime = this.splittedWord[clickedIndex]['endDuration'] - 0.23;
      this.play();
      if (this.parent != undefined) {
        $('.h5p-current').each(function () {
          $(this).find('#' + spanTagId).parent('div').css({
            "transform": 'scale(1.5)',
            'z-index': '2',
            'color': that.highlightingColor,
            'text-shadow': '0px 0px 5px yellow',
          });
          console.log($('#img' + spanTagId))
          console.log(that.glow($('#img' + spanTagId).closest('h5p-element')))
          // that.pop($('#img' + spanTagId))
           that.glow($('#img' + spanTagId).parent('div').parent('div'));
        })
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
H5P.CRAudio.prototype.dummy = function () {
  console.log('Dummy function')
}
H5P.CRAudio.prototype.isEnabledToggleButton = function () {

  return this.toggleButtonEnabled;
};
/** @constant {string} */
H5P.CRAudio.BUTTON_DISABLED = 'h5p-audio-disabled';

H5P.CRAudio.prototype.glow=function(imageTobeAnimated){ 
  console.log('glowing');
  console.log(imageTobeAnimated)
  imageTobeAnimated.css({
    "transform": 'scale(1.5)',
    'z-index': '2',
    'transition':'0.5s',
    "box-shadow": "0 0 50px yellow"
  });
  // imageTobeAnimated.css("box-shadow", "0 0 50px yellow");
  // imageTobeAnimated.css("transition", "border 1s linear, box-shadow 1s linear");
  // imageTobeAnimated.css("z-index", "2");
 
  
  setTimeout(function () {
    imageTobeAnimated.css({
      "transform": 'scale(1)',
      'z-index': '1',
      "box-shadow": "0 0 50px transparent"
    });
  //     imageTobeAnimated.css("box-shadow", "0 0 50px transparent");
  //     imageTobeAnimated.css("transition", "border 1s linear, box-shadow 1s linear");
  //     imageTobeAnimated.css("z-index", "1");
   }, 
  500);
}
H5P.CRAudio.prototype.pop = function (imageTobeAnimated) {
  var interval = 100;
  console.log('i am pulsing');
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 0);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
  }, interval * 1);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 2);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
  }, interval * 3);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 4);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
  }, interval * 5);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 6);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
  }, interval * 7);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 8);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1.1, 1.1)');
  }, interval * 9);
  setTimeout(() => {
    imageTobeAnimated.css('transform', 'scale(1, 1)');
  }, interval * 10);
}