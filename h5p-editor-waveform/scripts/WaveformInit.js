
import Parent from 'h5p-parent'
import { jQuery as $ } from '../globals';
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
  this.container;
  this.audioParams = this.parent.parent.parent.params.params;
  this.startTime = this.parent.params.startDuration != undefined ? this.parent.params.startDuration :  0;
  this.endTime = this.parent.params.endDuration != undefined ? this.parent.params.endDuration :  1;
  var self = this;

  $(document).ready(() => {
    console.log("ready!");
    var wavesurfer = WaveSurfer.create({
      container: self.container[0],
      waveColor: 'violet',
      progressColor: 'purple',
      fillParent: false,
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': '#000',
            color: '#fff',
            padding: '23px',
            'font-size': '10px',
          }
        }),
        RegionsPlugin.create({
          regionsMinLength: 0.1,
          maxRegions: 1,
          regions: [
            {
              start: self.startTime,
              end: self.endTime,
              loop: false,
              color: 'hsla(400, 100%, 30%, 0.5)'
            }
          ],
          dragSelection: {
            slop: 5
          }
        })
      ]
    });

    let region;
    self.crAudioIndex = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields.length;
    // let path = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex- 1].params.files ? H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].params.files[0].path : undefined;
    let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[0].parent.params.subContentId;
    let path = self.audioParams.files ? self.audioParams.files[0].path : undefined;
    // let id =  self.parent.parent.parent.params.subContentId;
    if (path != undefined && id != undefined ) {
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


    wavesurfer.on('ready', function () {
      region = Object.values(wavesurfer.regions.list)[0];
      wavesurfer.params.minPxPerSec = self.parent.parent.parent.parent.cp/Math.floor(wavesurfer.getDuration());
      wavesurfer.drawBuffer();
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

    $(self.container).parent().parent().find('.field-name-startDuration').find('input').focusout(function (e) {
      if (region != undefined) {
        let value = e.target.value;
        console.log(value)
        if (!isNaN(value)) {
          let inputStartTime = parseFloat(value);
          let inputEndTime = self.end < parseFloat(value) ? parseFloat(value) + 1 : self.end;
          params = {
            start: inputStartTime.toFixed(4),
            end: inputEndTime.toFixed(4)
          }
          region.update(params)
        } else {
          $(this).parent().find('.h5p-errors').append("<p>The entered value must be Number not alphabet</p>")
        }
      }
    });

    $(self.container).parent().parent().find('.field-name-endDuration').find('input').focusout(function (e) {
      if (region != undefined) {
        let value = e.target.value;
        console.log(value)
        console.log(self.start)
        if (!isNaN(value)) {
          let inputStartTime = value < region.start ? region.start + 0.3 : self.start
          let inputEndTime = parseFloat(value);
          params = {
            start: inputStartTime.toFixed(4),
            end: inputEndTime.toFixed(4)
          }
          region.update(params)
        } else {
          $(this).parent().find('.h5p-errors').append("<p>The entered value must be Number not alphabet</p>")
        }
      }
    });
    
    wavesurfer.on('region-updated', (event) => {
      this.start = event.start;
      this.end = event.end;
      this.$startinput = $('#' + this.id).parent().parent().find('.field-name-startDuration').find('input');
      this.$endinput = $('#' + this.id).parent().parent().find('.field-name-endDuration').find('input')
      this.$startinput.val(this.start.toFixed(4));
      this.$endinput.val(this.end.toFixed(4));
      this.setValue(this.findField("startDuration", this.parent.field.fields), "" + this.start.toFixed(4));
      this.setValue(this.findField("endDuration", this.parent.field.fields), "" + this.end.toFixed(4));
    });

    $(self.container).parents('.h5p-craudio-editor').find(".h5p-add-file").parent().find('ul').on('DOMSubtreeModified',
      function () {
        // let path = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex- 1].params.files ? H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].params.files[0].path : undefined;
        let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].parent.params.subContentId;
        let path = self.audioParams.files ? self.audioParams.files[0].path : undefined;
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
      });

      if (this.id != null) {
        let regionId = this.id + "playRegion";
        let $playRegionButton = $('<button id = '+ regionId +' class = "playRegion">Play</button>');
        $(self.container).parent('div').append($playRegionButton)
        $($playRegionButton).on('click', function () {
          if (region != undefined) {
            region.play()
          }
        })
      }
  });
}

WaveformInit.prototype = Object.create(Parent.prototype);
WaveformInit.prototype.constructor = WaveformInit;

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
  let wordText=''
  $wrapper.append('<h1 class="test"> Waveform</h1>')
  // $wrapper.append('<label class="h5peditor-label"><input id="field-words-125" type="checkbox">Will Do Animation</label>')
  let checkBoxElementForWord=$wrapper.append(this.getSentence(self.parent.parent.parent.parent.cp.slides,self.parent.parent.parent.parent.cp.currentSlideIndex))
  self.$item.appendTo($wrapper);
  self.container = self.$item.find('#' + this.id);
  $(checkBoxElementForWord).on('change',function(event){
    if($('#'+event.target.id).is(':checked')) {
      wordText=wordText+' '+event.target.value+' '
      this.$word = $('#' +id).parent().parent().find('.field-name-text').find('input');
       this.$word.val((wordText.trim()).replace(/  +/g, ' '))
      self.setValue(self.findField("text",self.parent.field.fields),"" + wordText.replace(/  +/g, ' '));
      //WaveformInit.self2.setValue(H5PEditor.CuriousReader.findField("text",self2.parent.field.fields),"Sam-ple data")
    } else {
      let tempWordText=wordText.replace(event.target.value,'')
      wordText=tempWordText
      this.$word = $('#' +id).parent().parent().find('.field-name-text').find('input');
      self.setValue(self.findField("text",self.parent.field.fields),"" + wordText.replace(/  +/g, ' '));
      this.$word.val((wordText.trim()).replace(/  +/g, ' '))
    }
  })
};

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

WaveformInit.prototype.getSentence=function(slides,slideIndex){
  var sentenceWords=[];
  for(let i=0;i<slides[slideIndex].elements.length;i++)
  {
    if(slides[slideIndex].elements[i].action.library.split(' ')[0]=="H5P.AdvancedText")
    {
      var checkBoxWord=''
      sentenceWords=$(slides[slideIndex].elements[i].action.params.text)[0].innerText.split(' ')
      for(let j=0;j<sentenceWords.length;j++)
      {
        if(sentenceWords[j].replace(/  +/g, ' ')!='')
        checkBoxWord=checkBoxWord+'<label class="h5peditor-label id ='+this.id+j+'"><input id='+this.id+j+' type="checkbox" value="'+sentenceWords[j]+'">'+sentenceWords[j]+'</label>'
      }
     
    }
  }
  return checkBoxWord;
}

WaveformInit.prototype.remove = function () { };

export default WaveformInit;