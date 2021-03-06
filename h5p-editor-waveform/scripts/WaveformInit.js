import Parent from 'h5p-parent';
import {
  jQuery as $
} from '../globals';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";

let WaveformInit = function (parent, field, params, setValue) {
  this.parent = parent;
  this.field = field;
  this.params = params;
  this.setValue = setValue;

  this.id = null;
  this.crAudioIndex = 0;
  this.container = null;
  this.audioParams = this.parent.parent.parent.params.params;
  this.startTime = this.parent.params.startDuration != undefined ? this.parent.params.startDuration : 0;
  this.endTime = this.parent.params.endDuration != undefined ? this.parent.params.endDuration : 0.2;
  this.audioDuration;
}

WaveformInit.prototype = Object.create(Parent.prototype);
WaveformInit.prototype.constructor = WaveformInit;

WaveformInit.pageBasedWordIndicesUsedInSentence = {};

/**
 * Initialize the waveform editor.
 * @param {*} $wrapper 
 */
WaveformInit.prototype.init = function () {
  var self = this;
  if (!self.container || (self.container && self.container.length == 0)) return;
  var wavesurfer = WaveSurfer.create({
    container: self.container[0],
    waveColor: 'green',
    progressColor: 'grey',
    fillParent: true,
    responsive: true,
    barHeight: 8,
    plugins: [
      RegionsPlugin.create({
        regionsMinLength: 0.1,
        maxRegions: 1,
        regions: [{
          start: self.startTime,
          end: self.endTime,
          loop: false,
          color: 'rgba(250, 203, 110, 0.5)'
        }],
        dragSelection: {
          slop: 5
        }
      })
    ]
  });

  $('.wavesurfer-handle').css("width", "4px");
  $('.wavesurfer-handle').css("background-color", "#707070");

  this.region = undefined;

  self.crAudioIndex = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields.length;
  // let path = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex- 1].params.files ? H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].params.files[0].path : undefined;
  let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[0].parent.params.subContentId;
  let path = self.audioParams.files ? self.audioParams.files[0].path : undefined;
  // let id =  self.parent.parent.parent.params.subContentId;
  if (path != undefined && id != undefined) {
    let file = H5P.getPath(path, id);
    $.get(file).done(function () {
      setTimeout(function () {
        wavesurfer.load(file);
      }, 1000)
    }).fail(function () {
      let id = H5PEditor.contentId;
      let file = H5P.getPath(path, id);
      setTimeout(function () {
        wavesurfer.load(file);
      }, 1000)
    })
  }


  wavesurfer.on('ready', () => {
    this.region = Object.values(wavesurfer.regions.list)[0];
    let width = self.parent.parent.parent.parent.cp.width + (self.parent.parent.parent.parent.cp.width * 0.25);
    self.audioDuration = wavesurfer.getDuration();
    // wavesurfer.params.minPxPerSec = width / wavesurfer.getDuration();
    // wavesurfer.drawBuffer();

    // let regionId = self.id + "playRegion"
    // let $playRegionButton = '<button id = '+ regionId +' class = "playRegion">Play</button>'
    // $('#' + self.id).find('.wavesurfer-region').append($playRegionButton)
    // $('#' + regionId).on('click', function (e) {
    //   e.stopPropagation()
    //   if (region != undefined) {
    //     region.play()
    //   }
    // })
  });

  setTimeout(() => {
    if (self.container[0]) {
      // Add event listeners to start and end duration for this wavesurfer instance
      let waveform = self.container[0];
      let waveformParent = waveform.parentElement.parentElement;

      let startDurationField = waveformParent.querySelector('.field-name-startDuration');
      let endDurationField = waveformParent.querySelector('.field-name-endDuration');

      if (startDurationField && endDurationField) {
        let startDurationFieldInput = startDurationField.querySelector('input');
        let endDurationFieldInput = endDurationField.querySelector('input');
        
        // Add focusout event handlers
        startDurationFieldInput.addEventListener("focusout", (e) => {
          this.startDurationValueChangeHandler(e.target.value);
        });
      
        endDurationFieldInput.addEventListener("focusout", (e) => {
          this.endDurationValueChangeHandler(e.target.value);
        });

        // Set values of start duration and end duration based on previous
        // waveform if it exists
        let waveformElements = document.getElementsByClassName("waveform");
        for (let i = 0; i < waveformElements.length; i++) {
          if (waveformElements[i].id === self.container[0].id && i > 0) {
            let previousWaveformContent = waveformElements[i - 1].parentElement.parentElement;
            let previousEndDurationField = previousWaveformContent.querySelector('.field-name-endDuration');
            if (previousEndDurationField) {
              let previousEndDurationInput = previousEndDurationField.querySelector('input');

              startDurationFieldInput.value = parseFloat(previousEndDurationInput.value) + 0.001;
              endDurationFieldInput.value = parseFloat(previousEndDurationInput.value) + 0.001 + 0.1;
              
              this.startDurationValueChangeHandler(startDurationFieldInput.value);
              this.endDurationValueChangeHandler(endDurationFieldInput.value);
            }
          }
        }
      }

      // Add audio loader observer on this wavesurfer instance
      let filesField = document.getElementsByClassName("field-name-files")[0];
      if (filesField) {
        let filesListElement = filesField.querySelector('ul');

        const observerConfig = { attributes: true, childList: true, subtree: true };

        const observer = new MutationObserver((mutationsList, observer) => {
          let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].parent.params.subContentId;
          let path = self.audioParams.files ? self.audioParams.files[0].path : undefined;
          if (path != undefined && id != undefined) {
            let file = H5P.getPath(path, id);
            $.get(file).done(function () {
              setTimeout(function () {
                wavesurfer.load(file);
              }, 1000);
            }).fail(function () {
              let id = H5PEditor.contentId;
              let file = H5P.getPath(path, id);
              setTimeout(function () {
                wavesurfer.load(file);
              }, 1000);
            })
          }
          if (this.region != undefined) {
            let $startinput = $('#' + this.id).parent().parent().find('.field-name-startDuration').find('input');
            let $endinput = $('#' + this.id).parent().parent().find('.field-name-endDuration').find('input');
            $startinput.val(0);
            $endinput.val(0.2);
            this.setValue(this.findField("startDuration", this.parent.field.fields), "" + 0);
            this.setValue(this.findField("endDuration", this.parent.field.fields), "" + 0.2);
            let params = {
              start: 0,
              end: 0.2
            };
            this.region.update(params);
          }
        });

        observer.observe(filesListElement, observerConfig);

      }
    }
  }, 2000);

  wavesurfer.on('region-updated', (event) => {
    this.start = event.start;
    this.end = event.end;
    this.$startinput = $('#' + this.id).parent().parent().find('.field-name-startDuration').find('input');
    this.$endinput = $('#' + this.id).parent().parent().find('.field-name-endDuration').find('input');
    this.$startinput.val(this.start.toFixed(4));
    this.$endinput.val(this.end.toFixed(4));
    this.setValue(this.findField("startDuration", this.parent.field.fields), "" + this.start.toFixed(4));
    this.setValue(this.findField("endDuration", this.parent.field.fields), "" + this.end.toFixed(4));
  });

  if (this.id != null) {
    let regionId = this.id + "playRegion";
    let $playRegionButton = $('<button id = ' + regionId + ' class = "playRegion">Play</button>');
    $(self.container).parent('div').append($playRegionButton);
    $($playRegionButton).on('click', () => {
      if (this.region != undefined) {
        this.region.play();
      }
    })
  }
}

WaveformInit.prototype.startDurationValueChangeHandler = function(value) {
  if (this.region != undefined) {
    if (!isNaN(value)) {
      if (parseFloat(value) > this.audioDuration) {
        value = 0.0;
      }
      let inputStartTime = parseFloat(value);
      let inputEndTime = this.region.end <= parseFloat(value) ? parseFloat(value) + 0.2 : this.region.end;
      let params = {
        start: inputStartTime.toFixed(4),
        end: inputEndTime.toFixed(4)
      };
      this.region.update(params);
    } else {
      $(this).parent().find('.h5p-errors').append("<p>The entered value must be Number not alphabet</p>")
    }
  }
}

WaveformInit.prototype.endDurationValueChangeHandler = function(value) {
  if (this.region != undefined) {
    if (!isNaN(value)) {
      if (parseFloat(value) > this.audioDuration) {
        value = self.audioDuration - 0.05;
      }
      let inputStartTime = parseFloat(value) <= this.region.start ? 0 : this.region.start;
      let inputEndTime = parseFloat(value);
      let params = {
        start: inputStartTime.toFixed(4),
        end: inputEndTime.toFixed(4)
      };
      this.region.update(params);
    } else {
      $(this).parent().find('.h5p-errors').append("<p>The entered value must be Number not alphabet</p>")
    }
  }
}

/**
 * Append the field to the wrapper.
 * @public
 * @param {H5P.jQuery} $wrapper
 */
WaveformInit.prototype.appendTo = function ($wrapper) {
  var self = this;
  const id = ns.getNextFieldId(this.field);
  var html = H5PEditor.createFieldMarkup(this.field, '<div class="waveform" id="' + id + '" class="h5p-color-picker">', id);
  self.$item = H5PEditor.$(html);
  this.setId(id);
  let wordText = (this.parent.params.text != undefined) ? this.parent.params.text : ''
  $wrapper.append('<h1 class="test">Select word(s)</h1>')
  // $wrapper.append('<label class="h5peditor-label"><input id="field-words-125" type="checkbox">Will Do Animation</label>')
  //let checkBoxElementForWord=$wrapper.append(this.getSentence(self.parent.parent.parent.parent.cp.slides,self.parent.parent.parent.parent.cp.currentSlideIndex))
  let slides = self.parent.parent.parent.parent.cp.slides;
  let slideIndex = this.parent.parent.parent.params.params.currIndex;
  let paramText = this.parent.params.text;
  let checkBoxElementForWord = $wrapper.append(this.getSentence(slides, slideIndex, paramText));
  self.$item.appendTo($wrapper);
  self.container = self.$item.find('#' + this.id);
  $(checkBoxElementForWord).on('change', function (event) {
    let isAlreadyUsed = self.checkIfWordIsUsedInOtherWaveform(slideIndex, event.target.id);
    if ($('#' + event.target.id).is(':checked')) {
      if (isAlreadyUsed) {
        document.getElementById(event.target.id).checked = false;
      } else {
        wordText = wordText + ' ' + event.target.value + ' ';
        $('#' + event.target.id).attr('checked', true);
        this.$word = $('#' + id).parent().parent().find('.field-name-text').find('input');
        this.$word.val((wordText.trim()).replace(/  +/g, ' '));
        $(this.$word).attr('checked', true);
        self.setValue(self.findField("text", self.parent.field.fields), "" + wordText.replace(/  +/g, ' '));
        WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()].push({'index': event.target.id.split('_')[1], 'id': event.target.id});
      }
    } else {
      $('#' + event.target.id).attr('checked', false);
      let tempWordText = wordText.replace(event.target.value, '');
      wordText = tempWordText;
      this.$word = $('#' + id).parent().parent().find('.field-name-text').find('input');
      self.setValue(self.findField("text", self.parent.field.fields), "" + wordText.replace(/  +/g, ' '));
      $(this.$word).attr('checked', false);
      this.$word.val((wordText.trim()).replace(/  +/g, ' '));
      WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()] = WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()].filter(function(obj) {
          return obj.id !== event.target.id;
      });
    }
  })
  self.setValue(self.findField("text", self.parent.field.fields), "" + this.parent.params.text);
  self.init();
};

WaveformInit.prototype.checkIfWordIsUsedInOtherWaveform = function (slideIndex, inputId) {
  let slideCheckboxInfo = WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()];
  let wordIndex = parseInt(inputId.split('_')[1]);
  if (slideCheckboxInfo !== null && slideCheckboxInfo !== undefined) {
    for (let i = 0; i < slideCheckboxInfo.length; i++) {
      if (parseInt(slideCheckboxInfo[i].index) === wordIndex) {
        return true;
      }
    }
  } else {
    WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()] = [];
  }
  return false;
}

WaveformInit.prototype.findField = function (name, fields) {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
};

WaveformInit.prototype.setId = function (id) {
  this.id = id;
}

WaveformInit.prototype.findField = function (name, fields) {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
};

WaveformInit.prototype.validate = function () {
  // this.hide();
  // return (this.params !== undefined && this.params.length !== 0);
};

WaveformInit.prototype.getSentence = function (slides, slideIndex, prevData) {
  var sentenceWords = [];
  var splittedPrevData = (prevData != undefined) ? prevData.split(' ') : [];
  let alreadyFoundSplittedPrevDataWord = false;

  for (let i = 0; i < slides[slideIndex].elements.length; i++) {
    if (slides[slideIndex].elements[i].action.library.split(' ')[0] == "H5P.CRAdvancedText") {
      var checkBoxWord = '';
      sentenceWords = $(slides[slideIndex].elements[i].action.params.text)[0].innerText.split(' ');
      for (let j = 0; j < sentenceWords.length; j++) {
        var def = (splittedPrevData.indexOf(sentenceWords[j]) !== -1) ? true : false;
        if (sentenceWords[j].replace(/  +/g, ' ') != '') {
          if (def && !alreadyFoundSplittedPrevDataWord && !this.checkIfWordIsUsedInOtherWaveform(slideIndex, this.id + '_' + j)) {
            checkBoxWord = checkBoxWord + '<label class="h5peditor-label"><input id=' + this.id + '_' + j + ' type="checkbox" value="' + sentenceWords[j] + '"checked>' + sentenceWords[j] + '</label>';
            alreadyFoundSplittedPrevDataWord = true;
            WaveformInit.pageBasedWordIndicesUsedInSentence[slideIndex.toString()].push({"index": j, "id": this.id + j});
          } else {
            checkBoxWord = checkBoxWord + '<label class="h5peditor-label"><input id=' + this.id + '_' + j + ' type="checkbox" value="' + sentenceWords[j] + '">' + sentenceWords[j] + '</label>';
          }
        }
      }
    }
  }
  return checkBoxWord;
}

WaveformInit.prototype.remove = function () {

};
export default WaveformInit;