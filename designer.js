(function(TextInput) {
    "use strict";

    TextInput.setWidth(92);
    TextInput.setHeight(22);

    TextInput.addEvents({ 
        'name':'action' 
    },{ 
        'name':'blur',
        'Focus':'Focus Events'
    },{ 
        'name':'focus',
        'Focus':'Focus Events'
    },{ 
        'name':'click', 
        'category':'Mouse Events' 
    },{ 
        'name':'dblclick', 
        'category':'Mouse Events'
    },{ 
        'name':'mousedown', 
        'category':'Mouse Events'
    },{ 
        'name':'mouseout',
         'category':'Mouse Events'
    },{ 
        'name':'mouseover',
        'category':'Mouse Events'
    },{ 
        'name':'mouseup',
        'category':'Mouse Events'
    },{ 
        'name':'keydown',
        'category':'Keyboard Events'
    },{ 
        'name':'keyup',
        'category':'Keyboard Events'
    },{ 
        'name':'select',
        'category':'Keyboard Events'
    },{ 
        'name':'touchstart',
        'category':'Touch Events'
    },{ 
        'name':'touchend',
        'category':'Touch Events'
    },{ 
        'name':'touchcancel',
        'category':'Touch Events'
    });

    TextInput.addLabel();

    TextInput.customizeProperty('editValue', { display: false, sourceDisplay: false });
    TextInput.customizeProperty('displayValue', { display: false, sourceDisplay: false });

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

        this.defaultValue.onChange(function(){
            if(!this.value()){
                this.value(this.defaultValue());
            }
        });
    });

    TextInput.setPanelStyle({
        'fClass': true, //This property is for the design panel
        'text': true,
        'textShadow': true,
        'dropShadow': true, 
        'innerShadow': true,
        'background': true,
        'border': true,
        'sizePosition': true,
        'label': true,
        'disabled': ['border-radius']
    });
});
