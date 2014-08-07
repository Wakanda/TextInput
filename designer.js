(function(TextInput) {
    "use strict";

    TextInput.setWidth(92);
    TextInput.setHeight(22);

    TextInput.addLabel();

    var showAutocomplete = function() {
        if(this.value.boundDatasource()) {
            this.autocomplete.show();
        } else {
            this.autocomplete.hide();
        }
    };

    TextInput.doAfter('init', function() {
        showAutocomplete.call(this);
        this.value.onChange(showAutocomplete);
        this.subscribe('datasourceBindingChange', 'value', showAutocomplete, this);

    });
});
