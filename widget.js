WAF.define('TextInput', ['waf-core/widget'], function(widget) {
    "use strict";

    function initAttribute(that, name, defaultValue, attribute) {
        if(defaultValue !== null || that[name]() !== null) {
            that.node[attribute || name] = that[name]() || defaultValue;
        }
        return that[name].onChange(function() {
            if(defaultValue !== null || that[name]() !== null) {
                that.node[attribute || name] = that[name]() || defaultValue;
            }
        });
    }

    function attr(name) {
        return function() {
            return this.node[attr] || null;
        };
    }

    var TextInput = widget.create('TextInput', {
        tagName: 'input',
        value: widget.property({
            type: 'string',
            defaultValueCallback: attr('value')
        }),
        autocomplete: widget.property({
            type: 'boolean'
        }),
        placeholder: widget.property({
            type: 'string',
            defaultValueCallback: attr('placeholder'),
            bindable: false
        }),
        readOnly: widget.property({
            type: 'boolean',
            defaultValueCallback: attr('readOnly'),
            bindable: false
        }),
        inputType: widget.property({
            type: 'enum',
            values: ['text', 'password'], //, 'search', 'email', 'url', 'tel'],
            defaultValueCallback: attr('type'),
            bindable: false
        }),
        maxLength: widget.property({
            type: 'integer',
            defaultValueCallback: attr('maxLength'),
            bindable: false
        }),
        _setupAutocomplete: function() {
            var bound = this.value.boundDatasource();
            if(!bound || !bound.valid || !this.autocomplete()) {
                return;
            }
            var att = bound.datasource.getAttribute(bound.attribute);
            if(att.enumeration) {
                $(this.node).autocomplete({
                    source: function(request, response){
                        response(att.enumeration.filter(function(item) {
                            return item.name.toLowerCase().indexOf(request.term.toLowerCase()) === 0;
                        }));
                    }
                });
            } else {
                $(this.node).autocomplete({
                    source: function(request, response){
                        var url = '/rest/' + bound.datasource.getDataClass().getName() + '/' + att.name;
                        $.ajax({
                            url: url,
                            data:{
                                "$distinct" : true,
                                "$top"      : 20,
                                "$filter"   : '"' + att.name + '=:1' + '"',
                                "$params"   : "'" + JSON.stringify([request.term + '*']) + "'"
                            },
                            success: function(data){ response(data); }
                        });
                    }
                });
            }
        },
        init: function() {
            initAttribute(this, 'inputType', 'text', 'type');
            initAttribute(this, 'placeholder', '');
            initAttribute(this, 'readOnly', false);
            initAttribute(this, 'maxLength', null);
            var subscriber = initAttribute(this, 'value', '');

            $(this.node).on('change autocompleteselect change', function(event, ui) {
                subscriber.pause();
                this.value(ui && 'item' in ui ? ui.item.value : this.node.value);
                subscriber.resume();
            }.bind(this));

            this._setupAutocomplete();
            this.subscribe('datacourseBindingChange', 'value', this._setupAutocomplete, this);
        }
    });

    return TextInput;

});
