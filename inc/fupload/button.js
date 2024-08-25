qq.UploadButton = function(o){
    this._options = {
        element: null,
        multiple: false,
        acceptFiles: null,
        name: 'file',
        onChange: function(input){},
        hoverClass: 'qq-upload-button-hover',
        focusClass: 'qq-upload-button-focus'
    };

    qq.extend(this._options, o);
    this._disposeSupport = new qq.DisposeSupport();

    this._element = this._options.element;
    
    qq(this._element).css({
        overflow: 'hidden',
        direction: 'ltr'
    });

    this._input = this._createInput();
};

qq.UploadButton.prototype = {
    /* returns file input element */
    getInput: function(){
        return this._input;
    },
    /* cleans/recreates the file input */
    reset: function(){
        if (this._input.parentNode){
            qq(this._input).remove();
        }

        qq(this._element).removeClass(this._options.focusClass);
        this._input = this._createInput();
    },
    _createInput: function(){
        var input = document.createElement("input");

        if (this._options.multiple){
            input.setAttribute("multiple", "multiple");
        }

        if (this._options.acceptFiles) input.setAttribute("accept", this._options.acceptFiles);

        input.setAttribute("type", "file");
        input.setAttribute("name", this._options.name);

        qq(input).css({
            position: 'absolute',
            right: 0,
            top: 0,
            fontFamily: 'Arial',
            fontSize: '18px',
            margin: 0,
            padding: 0,
            cursor: 'pointer',
            opacity: 0
        });

        this._element.appendChild(input);

        var self = this;
        this._disposeSupport.attach(input, 'change', function(){
            self._options.onChange(input);
        });

        this._disposeSupport.attach(input, 'mouseover', function(){
            qq(self._element).addClass(self._options.hoverClass);
        });
        this._disposeSupport.attach(input, 'mouseout', function(){
            qq(self._element).removeClass(self._options.hoverClass);
        });
        this._disposeSupport.attach(input, 'focus', function(){
            qq(self._element).addClass(self._options.focusClass);
        });
        this._disposeSupport.attach(input, 'blur', function(){
            qq(self._element).removeClass(self._options.focusClass);
        });

        // IE and Opera, unfortunately have 2 tab stops on file input
        // which is unacceptable in our case, disable keyboard access
        if (window.attachEvent){
            // it is IE or Opera
            input.setAttribute('tabIndex', "-1");
        }

        return input;
    }
};
