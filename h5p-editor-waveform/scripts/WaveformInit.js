
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


  this.changes = [];

  $(document).ready(function () {
    console.log("ready!");

    var wavesurfer = WaveSurfer.create({
      // wavesurfer options ...
      container: '.waveform',
      waveColor: 'violet',
      progressColor: 'purple',
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': '#000',
            color: '#fff',
            padding: '2px',
            'font-size': '10px'
          }
        }),
        RegionsPlugin.create({
          regionsMinLength: 0.5,
          maxRegions: 1,
          regions: [
            {
              start: 1,
              end: 3,
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
    wavesurfer.on('region-updated', (event) => {
      this.start = event.start;
      this.end = event.end;
      // console.log(this.start, ' regiofdxdv ', event.id);

      // console.log(' divs ', $('Region[data-id=' + event.id + ']').parent().parent().parent().find('.field-name-startDuration').find('input'))
      this.$startinput = $('Region[data-id=' + event.id + ']').parent().parent().parent().find('.field-name-startDuration').find('input')
      this.$endinput = $('Region[data-id=' + event.id + ']').parent().parent().parent().find('.field-name-endDuration').find('input')
      this.$startinput.val(this.start)//attr("value", this.start)
      this.$endinput.val(this.end)//.attr("value", this.end)
    });

    $(document).find(".h5p-add-file").parent().find('ul').on('DOMSubtreeModified',
      function () {
        console.log('UL content changed!!!');
        // update URL for rendering
        wavesurfer.load('https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav');
      });

    console.log("loaded")
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
  // var html = H5PEditor.createFieldMarkup(this.field, '<div class="waveform id="' + id + '" class="h5p-color-picker">', id);
  var html = H5PEditor.createFieldMarkup(this.field, '<input id="' + id + '" class="h5p-color-picker">', id);
  self.$item = H5PEditor.$(html);

  $wrapper.append('<h1 class="test"> Waveform</h1>')
  $wrapper.append('<div class="waveform"></div>')

  self.$item.appendTo($wrapper);
};


/**
 * Validate the current values.
 */
WaveformInit.prototype.validate = function () {
  // this.hide();
  // return (this.params !== undefined && this.params.length !== 0);
};

WaveformInit.prototype.remove = function () { };

export default WaveformInit;