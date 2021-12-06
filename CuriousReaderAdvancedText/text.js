H5P.CRAdvancedText = (function ($, EventDispatcher) {

  /**
   * A simple library for displaying text with advanced styling.
   *
   * @class H5P.CRAdvancedText
   * @param {Object} parameters
   * @param {Object} [parameters.text='New text']
   * @param {number} id
   */
  function CRAdvancedText(parameters, id) {
    console.log("Advanced text");
    var self = this;
    EventDispatcher.call(this);

    var html = (parameters.text === undefined ? '<em>New text</em>' : parameters.text);

    /**
     * Wipe container and add text html.
     *
     * @alias H5P.CRAdvancedText#attach
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      $container.addClass('h5p-advanced-text').html(html);
    };
  }

  CRAdvancedText.prototype = Object.create(EventDispatcher.prototype);
  CRAdvancedText.prototype.constructor = CRAdvancedText;

  return CRAdvancedText;

})(H5P.jQuery, H5P.EventDispatcher);
