var H5P = H5P || {};

/**
 * H5P audio module
 *
 * @external {jQuery} $ H5P.jQuery
 * 
 * 
 */

H5P.CRAudio = (function ($) {
  let splittedTextCopy;
  let self1;
  let spanNumberId
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

    this.toggleButtonEnabled = true;
    this.splittedText = this.params['Each duration and text']
    if(this.splittedText!=undefined)
    {
      for (let k = 0; k < this.splittedText.length; k++) {
        this.splittedText[k]['highlighted'] = false
      }

    }
   
    splittedTextCopy = this.splittedText
    console.log(this.splittedText)
    // Retrieve previous state
    if (extras && extras.previousState !== undefined) {
      this.oldTime = extras.previousState.currentTime;
    }
    console.log($('#headid'))
    this.params = $.extend({}, {
      playerMode: 'minimalistic',
      fitToWrapper: false,
      controls: true,
      autoplay: true,
      audioNotSupported: "Your browser does not support this audio",
      playAudio: "Play audio",
      pauseAudio: "Pause audio"
    }, params);


    this.on('resize', this.resize, this);
  }




  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;






  C.prototype.playSplittedAudios = function () {


    // if (this.audio.currentTime > splittedTextCopy[spanNumberId]['End Duration']) {
    //   console.log('entered else')
    //   console.log(this.audio.currentTime)
    //   if (this.audio !== undefined) {
    //     this.audio.pause();
    //     this.audio.currentTime = 0;
    //   }
    // }

    var time = this.audio.currentTime, j = 0, word;
    console.log("These are the words")
    console.log(time)
    console.log(this.splittedText.length)
    for (j = 0; j < this.splittedText.length; j++) {
      // console.log(word)
      word = this.splittedText[j]
      console.log(word)
      if (time >= word['Starting Duration'] && time < word['End Duration']) {
        console.log("inside if")
        if (!word.highlighted) {
          console.log("Hi Hello")
          word.highlighted = true;
          $('#splittedText' + j).css("color", "yellow");
          $('#splittedText' + j).css("font-size", "200%");
          // $(j).css('width', '300px')
          // $(j).css('height', 'auto');
        }
      }
      else if (word.highlighted) {
        $('#splittedText' + j).css("color", "black");
        $('#splittedText' + j).css("font-size", "100%");
        // $(j).css('width', '150px')
        // $(j).css('height', 'auto');
        word.highlighted = false;
      }
    }
  }


  /**
   * Adds a minimalistic audio player with only "play" and "pause" functionality.
   *
   * @param {jQuery} $container Container for the player.
   * @param {boolean} transparentMode true: the player is only visible when hovering over it; false: player's UI always visible
   */
  this.curTime = function (abc) {
    this.cTime = abc
    console.log(this.cTime)
  }

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
      'id': "Button_id",
      'aria-label': this.params.playAudio
    }).appendTo(self.$inner)
      .click(function () {
        console.log("Clicked")
        if (!self.isEnabledToggleButton()) {
          return;
        }

        // Prevent ARIA from playing over audio on click
        this.setAttribute('aria-hidden', 'true');
        this.setAttribute('id', 'aud')

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
      console.log(this.params.autoplay)
      self.play();
    }
    $(document).ready(function () {
      if((splittedTextCopy!=undefined) && ($('#headid')!=undefined))
      {
        $('#headid')[0].addEventListener('click', function (event) {
          for (let l = 0; l < splittedTextCopy.length; l++) {
            if (event.target.id != 'headid') {
              $('#splittedText' + l).css('color', 'black')
              $('#splittedText' + l).css("font-size", "20px");
              if ('#splittedText' + event.target.id.endsWith(l)) {
                spanNumberId = parseInt((event.target.id).charAt((event.target.id.length - 1)))
                self.audio.currentTime = splittedTextCopy[spanNumberId]['Starting Duration']
  
                self.play()
                //setTimeout(function(){self.pause()},splittedTextCopy[spanNumberId]['End Duration']-splittedTextCopy[spanNumberId]['Starting Duration']);
  
              }
              $('#splittedText' + spanNumberId).css('color', 'yellow')
              $('#splittedText' + spanNumberId).css("font-size", "40px");
              setTimeout(function () {
                $('#splittedText' + l).css('color', 'black')
                $('#splittedText' + l).css("font-size", "20px");
              }, 600);
            }
  
  
          }
        })
      }
      

    });
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
      console.log("Playing")
      // self.trigger('giveTime',audio.name)
      audioButton
        .attr('aria-label', self.params.pauseAudio)
        .removeClass(PLAY_BUTTON)
        .removeClass(PLAY_BUTTON_PAUSED)
        .addClass(PAUSE_BUTTON);
    });
    self.audio.addEventListener('timeupdate', this.playSplittedAudios.bind(this));
    

    self.audio.addEventListener('pause', function () {
      console.log('paused')
      audioButton
        .attr('aria-hidden', false)
        .attr('aria-label', self.params.playAudio)
        .removeClass(PAUSE_BUTTON)
        .addClass(PLAY_BUTTON_PAUSED);
    });

   

    this.$audioButton = audioButton;
    //Scale icon to container
    self1 = self
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
  //$container.append('<h2>This is heading</h2>')
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
  audio.setAttribute('id', 'aud')
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
  console.log('audio paused')
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
