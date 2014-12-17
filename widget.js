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
            description: 'Static text or datasource value'
        }),
        editValue: widget.property({
            type: 'string'
        }),
        displayValue: widget.property({
            type: 'string'
        }),
        format: widget.property({
            type: 'string',
            description: 'Format for the Value',
            bindable: false
        }),
        autocomplete: widget.property({
            type: 'boolean',
            description: 'Autocomplete text if Value is a datasource',
            bindable: false
        }),
        placeholder: widget.property({
            type: 'string',
            description: 'Placeholder text',
            bindable: false
        }),
        readOnly: widget.property({
            type: 'boolean',
            description: 'Read only or read/write',
            bindable: false
        }),
        inputType: widget.property({
            type: 'enum',
            description: 'Type of input widget',
            values: {
                'text':               'text',
                'password':           'password',
                'search':             'search',
                'email':              'email',
                'url':                'url',
                'tel':                'telephone'
            },
            bindable: false
        }),
        maxLength: widget.property({
            type: 'integer',
            description: 'Maximum length allowed in widget',
            bindable: false
        }),
        disable: function() {
           this.$super('disable')();
           this.node.disabled = true;
        },
        enable: function() {
           this.$super('enable')();
           this.node.disabled = false;
        },
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
                            success: function(data){
                                response($.map(data, function(item){
                                    return {
                                        value: item
                                    }
                                }));
                            }
                        });
                    }
                });
            }
        },
        hasFocus: function() {
            return document.activeElement === this.node;
        },
        formatEditValue: function(value) {
            if(value == null) {
                return '';
            }
            switch(this.getType()) {
                case 'String':
                    return value;
                case 'Number':
                    return WAF.utils.formatNumber(value, { format: this.numberEditFormat() });
                default:
                    var formatter = 'format' + this.getType();
                    if (formatter in WAF.utils) {
                        return WAF.utils[formatter](value, { format: this.format() });
                    }
            }
            return '' + value;
        },
        unformatEditValue: function(value) {
            var parser = 'parse' + this.getType();
            if (parser in WAF.utils) {
                return WAF.utils[parser](value, this.format());
            }
            return '' + value;
        },
        formatDisplayValue: function(value) {
            if(value == null) {
                return '';
            }
            var formatter = 'format' + this.getType();
            if (formatter in WAF.utils) {
                return WAF.utils[formatter](value, { format: this.format() });
            }else{
                return WAF.utils.formatString(value,this.format());
            }
            return '' + value;
        },
        numberEditFormat: function() {
            // remove prefix and suffix from number format
            var result = /[^#0,.]*([#0,.%]+).*/.exec(this.format());
            if(result) {
                return result[1];
            }
            return this.format();
        },
        getType: function() {
            var binding = this.value.boundDatasource();
            if(!binding || !binding.valid) {
                return;
            }
            switch(binding.datasource.getAttribute(binding.attribute).type) {
                case "long":
                case "number":
                case "float":
                case "long":
                case "byte":
                case "word":
                case "long64":
                    return 'Number';
                case "string":
                    return "String";
                case "date":
                    return "Date";
            }
        },
        init: function() {
            // bootstrap class
            $(this.node).addClass('form-control');

            // init
            initAttribute(this, 'inputType', 'text', 'type');
            initAttribute(this, 'placeholder', '');
            initAttribute(this, 'readOnly', false);
            initAttribute(this, 'maxLength', null);
            this.value(this.displayValue());
            this.node.value = this.displayValue();
            
            var mode;

            var valueSubscriber = this.value.onChange(function() {
                valueSubscriber.pause();
                this.editValue(this.formatEditValue(this.value()));
                this.displayValue(this.formatDisplayValue(this.value()));
                valueSubscriber.resume();
            });

            this.editValue.onChange(function() {
                this.removeClass('waf-state-error');
                try {
                    if(!valueSubscriber.isPaused()) {
                        this.value(this.unformatEditValue(this.editValue()));
                    }
                    if(this.hasFocus()) {
                        this.node.value = this.editValue();
                        mode = 'edit';
                    }
                } catch(error) {
                    this.addClass('waf-state-error');
                    this.fire('error', { error: error, value: this.editValue() });
                    mode = 'error';
                }
            });

            this.displayValue.onChange(function() {
                if(!this.hasFocus()) {
                    this.value(this.displayValue());
                    this.node.value = this.displayValue();
                    $(this.node).attr('value',this.displayValue());
                    $(this.node).attr('data-value',this.displayValue());
                    $(this.node).attr('data-displayvalue',this.displayValue());
                    mode = 'display';
                }
            });

            $(this.node).on('change autocompleteselect change', function(event, ui) {
                if(ui && 'item' in ui) {
                    this.editValue(ui.item.value);
                } else {
                    if(mode === 'edit' || mode === 'error') {
                        this.editValue(this.node.value);
                    }
                }
            }.bind(this));


            // init value
            if(this.value() != null) {
                if(this.value() === this.node.getAttribute('data-value')) {
                    // the initial value come from the HTML, we asume that it's a formated value
                    this.editValue(this.value());
                } else {
                    // the initial value come from the options passed to the init, we asume it's a raw value
                    valueSubscriber.pause();
                    this.editValue(this.formatEditValue(this.value()));
                    this.displayValue(this.formatDisplayValue(this.value()));
                    valueSubscriber.resume();
                }
            }

            $(this.node).on('focus', function(event) {
                this.node.value = this.editValue();
                mode = 'edit';
            }.bind(this));

            $(this.node).on('blur', function(event) {
                if(mode === 'error') {
                    return;
                }
                this.node.value = this.displayValue();
                mode = 'display';
            }.bind(this));

            this._setupAutocomplete();
            this.subscribe('datacourseBindingChange', 'value', this._setupAutocomplete, this);
        }
    });

    TextInput.addTabIndex();
    
    return TextInput;

});
