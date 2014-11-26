(function(TextInput) {
    "use strict";

    TextInput.setWidth(92);
    TextInput.setHeight(22);

    TextInput.addEvents('hover', 'focus', 'disabled');

    TextInput.addEvents({ 
        'name':'action' 
    },{ 
        'name':'blur',
        'category':'Focus Events'
    },{ 
        'name':'focus',
        'category':'Focus Events'
    },{ 
        'name':'click', 
        'category':'Mouse Events' 
    },{ 
        'name':'dblclick', 
        'description':'On Double Click',
        'category':'Mouse Events'
    },{ 
        'name':'mousedown', 
        'description':'On Mouse Down',
        'category':'Mouse Events'
    },{ 
        'name':'mouseout',
        'description':'On Mouse Out',
         'category':'Mouse Events'
    },{ 
        'name':'mouseover',
        'description':'On Mouse Over',
        'category':'Mouse Events'
    },{ 
        'name':'mouseup',
        'description':'On Mouse Up',
        'category':'Mouse Events'
    },{ 
        'name':'keydown',
        'description':'On Key Down',
        'category':'Keyboard Events'
    },{ 
        'name':'keyup',
        'description':'On Key Up',
        'category':'Keyboard Events'
    },{ 
        'name':'select',
        'category':'Keyboard Events'
    },{ 
        'name':'touchstart',
        'description':'On Touch Start',
        'category':'Touch Events'
    },{ 
        'name':'touchend',
        'description':'On Touch End',
        'category':'Touch Events'
    },{ 
        'name':'touchcancel',
        'description':'On Touch Cancel',
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

    TextInput.customizeProperty('readOnly', {title: 'Read Only'});

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
