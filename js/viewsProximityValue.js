/**
 * @file
 * Dynamically update Views admin UI form parts by sending POST.
 */
(function ($) {

  "use strict";

  Backdrop.behaviors.viewsProximityValue = {
    /**
     * @param array data
     */
    updateFormItem: function (data) {
      let formItemsWrapped = data[1].data;
      let formItems = $(formItemsWrapped).find('.geofield-proximity-field-wrapper');
      if (formItems.length) {
        $('.geofield-proximity-field-wrapper').replaceWith(formItems);
      }
    },
    /**
     * @return bool
     */
    formHasRange: function () {
      let checkedValue = $('#edit-options-operator').find(':checked').val();
      if (checkedValue === 'between' || checkedValue === 'not between') {
        return true;
      }
      return false;
    },
    /**
     *
     */
    attach: function (context, settings) {
      if ($('#edit-options-group-button-radios :checked').val() === 1) {
        // This behavior does not work with grouped exposed filters.
        return;
      }
      const widget = this;
      let hasRange = widget.formHasRange();
      $.ajaxSetup({
        type: 'POST',
        url: $('#edit-options-source').data('path'),
        dataType: 'json'
      });

      $('#edit-options-source').on('change', function() {
        let postData = {
          plugin: this.value
        };
        $.ajax( { data: postData } )
          .done( function (data) {
            widget.updateFormItem(data);
        });
      });

      $('#edit-options-operator').on('change', function() {
        // Only post if necessary.
        if (hasRange === widget.formHasRange()) {
          return;
        }
        let postData = {
          plugin: $('#edit-options-source').val(),
          operator: $(this).find(':checked').val()
        };
        $.ajax( { data: postData } )
          .done( function (data) {
            widget.updateFormItem(data);
            hasRange = widget.formHasRange();
        });
      });
    }
  };
})(jQuery);
