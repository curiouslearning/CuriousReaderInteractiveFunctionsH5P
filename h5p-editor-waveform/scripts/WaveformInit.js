
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
  this.changes = [];
  this.crAudioIndex = 0;
  var self = this;

  $(document).ready(() => {
    var wavesurfer = WaveSurfer.create({
      // wavesurfer options ...
      container: '#' + this.id,
      waveColor: 'violet',
      progressColor: 'purple',
      plugins: [
        // CursorPlugin.create({
        //   showTime: true,
        //   opacity: 1,
        //   customShowTimeStyle: {
        //     'background-color': '#000',
        //     color: '#fff',
        //     padding: '23px',
        //     'font-size': '10px',
        //   }
        // }),
        RegionsPlugin.create({
          regionsMinLength: 0.1,
          maxRegions: 1,
          regions: [
            {
              start: 0,
              end: 1,
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
    let path = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex- 1].params.files ? H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].params.files[0].path : undefined;
    let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[0].parent.params.subContentId;
       
    if (path != undefined && id != undefined ) {
      let file = H5P.getPath(path, id);
        // update URL for rendering
      setTimeout(function () {
        wavesurfer.load(file);
      }, 1000)
    }

    wavesurfer.on('ready', function () {
      region = Object.values(wavesurfer.regions.list)[0];
      let regionId = self.id + "playRegion"
      let $playRegionButton = '<button id = '+ regionId +' class = "playRegion">Play</button>'
      $('#'+self.id).find('.wavesurfer-region').append($playRegionButton)
      $('#' + regionId).on('click', function (e) {
        e.stopPropagation()
        if (region != undefined) {
          region.play()
        }
      })
    })
    
    wavesurfer.on('region-updated', (event) => {
      this.start = event.start;
      this.end = event.end;
      this.$startinput = $('#' + this.id).parent().parent().find('.field-name-startDuration').find('input');
      
      this.$endinput = $('#' + this.id).parent().parent().find('.field-name-endDuration').find('input')
      this.$startinput.val(this.start)//attr("value", this.start)
      this.setValue(this.findField("startDuration", this.parent.field.fields), "" + this.start);
      this.$endinput.val(this.end)//.attr("value", this.end)
      this.setValue(this.findField("endDuration", this.parent.field.fields), "" + this.end);
      region = Object.values(wavesurfer.regions.list)[0];
    });

//This is the issue related to some of the members
    // wavesurfer.on('region-click', function (event) {
      
    // })
   

    $(document).find(".h5p-add-file").parent().find('ul').on('DOMSubtreeModified',
      function () {
        let path = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex- 1].params.files ? H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].params.files[0].path : undefined;
        let id = H5PEditor.renderableCommonFields["H5P.CRAudio 1.4"].fields[self.crAudioIndex - 1].parent.params.subContentId;
       
        if (path != undefined && id != undefined ) {
          let file = H5P.getPath(path, id);
          // update URL for rendering
          wavesurfer.load(file);
        }
      });

      if (this.id != null) {
        
        // let regionId = this.id + "playRegion"
        // let $playRegionButton = '<button id = '+ regionId +' class = "playRegion">Play</button>'
        // $('#'+this.id).parent('div').append($playRegionButton)
        // $('#' + regionId).on('click', function () {
        //   if (region != undefined) {
        //     region.play()
        //   }
        // })
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
  // console.log(this.field)
  // console.log(ns)
  // console.log(id);
  // console.log($('#'+id))
  var html = H5PEditor.createFieldMarkup(this.field, '<div class="waveform" id="' + id + '" class="h5p-color-picker">', id);
  console.log(html)
  // var html = H5PEditor.createFieldMarkup(this.field, '<input id="' + id + '" class="h5p-color-picker">', id);
  self.$item = H5PEditor.$(html);
  this.setId(id);
  let wordText=''
  $wrapper.append('<h1 class="test"> Waveform</h1>')
  // $wrapper.append('<label class="h5peditor-label"><input id="field-words-125" type="checkbox">Will Do Animation</label>')
  let checkBoxElementForWord=$wrapper.append(this.getSentence(self.parent.parent.parent.parent.cp.slides,self.parent.parent.parent.parent.cp.currentSlideIndex))
  self.$item.appendTo($wrapper);
  $(checkBoxElementForWord).on('change',function(event){

    if($('#'+event.target.id).is(':checked'))
    {
      wordText=wordText+' '+event.target.value+' '
      this.$word = $('#' +id).parent().parent().find('.field-name-text').find('input');
       this.$word.val(wordText.replace(/  +/g, ' '))
      self.setValue(self.findField("text",self.parent.field.fields),"" + wordText.replace(/  +/g, ' '));
      //WaveformInit.self2.setValue(H5PEditor.CuriousReader.findField("text",self2.parent.field.fields),"Sam-ple data")
      
    }
    else{
      let tempWordText=wordText.replace(event.target.value,'')
      wordText=tempWordText
      this.$word = $('#' +id).parent().parent().find('.field-name-text').find('input');
      self.setValue(self.findField("text",self.parent.field.fields),"" + wordText.replace(/  +/g, ' '));
      this.$word.val(wordText.replace(/  +/g, ' '))
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
/**
 * Validate the current values.
 */
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