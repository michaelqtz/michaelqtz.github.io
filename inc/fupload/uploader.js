/**
 * Class that creates upload widget with drag-and-drop and file list
 * @inherits qq.FineUploaderBasic
 */
qq.FineUploader = function(o){
    // call parent constructor
    qq.FineUploaderBasic.apply(this, arguments);

    // additional options
    qq.extend(this._options, {
        element: null,
        listElement: null,
        fileTemplate: '<div class="progress"><span class="progress-input"></span><div class="progress-bar"></div><div class="progress-result"></div></div>',
        classes: {
            list: 'loader',
            progressBar: 'progress-bar',
            progressResult: 'progress-result',
            input: 'progress-input'
        },
        messages: {
            tooManyFilesError: "You may only drop one file"
        },
        showMessage: function(message){
            setTimeout(function() {
                alert(message);
            }, 0);
        }
    }, true);

    // overwrite options with user supplied
    qq.extend(this._options, o, true);
    this._wrapCallbacks();

    this._element = this._options.element;
    this._listElement = this._options.listElement || this._element;
    this._classes = this._options.classes;
    if (!this._button) {
        this._button = this._createUploadButton(this._find($(document)[0], 'button'));
    }
};

// inherit from Basic Uploader
qq.extend(qq.FineUploader.prototype, qq.FineUploaderBasic.prototype);

qq.extend(qq.FineUploader.prototype, {
    clearStoredFiles: function() {
        qq.FineUploaderBasic.prototype.clearStoredFiles.apply(this, arguments);
        this._listElement.innerHTML = "";
    },
    getItemByFileId: function(id){
        var item = this._listElement.firstChild;
        
        // there can't be txt nodes in dynamically created list
        // and we can  use nextSibling
        while (item){
            if (item.qqFileId == id) return item;
            item = item.nextSibling;
        }
    },
    cancel: function(fileId) {
        qq.FineUploaderBasic.prototype.cancel.apply(this, arguments);
        var item = this.getItemByFileId(fileId);
        qq(item).remove();
    },
    /**
     * Gets one of the elements listed in this._options.classes
     **/
    _find: function(parent, type){
        var element = qq(parent).getByClass(this._options.classes[type])[0];
        if (!element){
            throw new Error('element not found ' + type);
        }
        return element;
    },
    _onSubmit: function(id, fileName){
        qq.FineUploaderBasic.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, fileName);
        $('div[rel='+this._options.request.name+']').find('p.help-block').remove();
        $('.loader .has-error').remove();
    },
    // Update the progress bar & percentage as the file is uploaded
    _onProgress: function(id, fileName, loaded, total){
        qq.FineUploaderBasic.prototype._onProgress.apply(this, arguments);

        var item = this.getItemByFileId(id);
        var progressBar = this._find(item, 'progressBar');
        var percent = Math.round(loaded / total * 100);

        qq(progressBar).css({display: 'block', width: percent + '%'});
        $(progressBar).html(percent + '%');
    },
    _onComplete: function(id, fileName, result, xhr){
        qq.FineUploaderBasic.prototype._onComplete.apply(this, arguments);
        var item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');
        $(progressBar).parent().attr('rel',id);
        progressResult = this._find(item, 'progressResult');
        if (this._options.request.callback) {
            return window[this._options.request.callback](result);
        }
        else {
            if (result.success) {
                var input = this._find(item, 'input');
                if (this._options.request.title == 'post_pics') {
                    $(input).html('<input type="hidden" name="pics" class="input" rel="'+this._options.request.rel+'" value="'+result.file+'"><input type="hidden" name="id" class="input" rel="'+this._options.request.rel+'" value="0">');
                    $(progressBar).hide();
                    var txt = '<a class="lodedpic fancybox" href="/media/blog/com/'+result.file+'"><img src="/media/blog/com/_252/'+result.file+'"></a>';
                    txt += '<span class="lodedpicinf">';
                    txt += '<a href="javascript:;" class="pics_del" onClick="pics_del('+id+')"><i class="fa fa-times fa-fw"></i></a>';
                    txt += '<input type="text" name="title" rel="'+this._options.request.rel+'" class="input input-sm form-control" placeholder="Описание" value="" onKeyDown="if (event.keyCode==13) return sform(this)">';
                    if (this._options.request.rel == 6) {
                        txt += '<span class="picactions"><i class="fa fa-plus odtip" title="Вставить в пост"></i> &nbsp;<div class="btn-group">';
                        txt += '<a class="btn btn-xs btn-default odtip" href="javascript:;" onClick="pics_add_post('+id+',\''+result.file+'\',1,'+result.width+')" title="Вставить в пост: оригинальные размеры">оригинал</a> ';
                        txt += '<a class="btn btn-xs btn-default odtip" href="javascript:;" onClick="pics_add_post('+id+',\''+result.file+'\',0,'+result.width+')" title="Вставить в пост: превью">превью</a> ';
                        txt += '<a class="btn btn-xs btn-default odtip" href="javascript:;" onClick="pics_add_post('+id+',\''+result.file+'\',2,'+result.width+')" title="Вставить в пост: на 100% ширины экрана">панорама</a>';
                        txt += '</div></span>';
                    }
                    else {
                        txt += '<span class="picactions"><i class="fa fa-plus odtip" title="Вставить в коммент"></i> &nbsp;<div class="btn-group">';
                        txt += '<a class="btn btn-xs btn-default odtip" href="javascript:;" onClick="pics_add(\'/media/blog/com/'+result.file+'\')" title="Вставить в коммент: оригинальные размеры">оригинал</a> ';
                        txt += '</div></span>';
                    }
                    txt += '<b class="picshow"><input type="checkbox" name="hide" rel="'+this._options.request.rel+'" class="input" value="1" checked> Показывать</b>';
                    txt += '</span>';
                    $(progressResult).html(txt);
                }
                else {
                    $(input).html('<input type="hidden" name="'+this._options.request.name+'" class="input" rel="'+this._options.request.rel+'" value="'+result.file+'">');
                    $(progressBar).html('<a'+(result.crop > 0 ? ' data-toggle="popover" data-content="<img src='+result.url+'_'+result.crop+'/'+result.file+'>"' : '')+' href="'+result.url+result.file+'">'+result.txt+'</a>');
                }
            }
            else {
                $(progressBar).html(result.err);
                /*var err = {};
                err[this._options.request.name] = result.error;
                form_error('update',err);
                $(progressBar).parent().addClass('has-error');*/
            }
        }
    },
    _onUpload: function(id, fileName){
        qq.FineUploaderBasic.prototype._onUpload.apply(this, arguments);
        var item = this.getItemByFileId(id);
    },
    _addToList: function(id, fileName){
        var item = qq.toElement(this._options.fileTemplate);
        item.qqFileId = id;
        if (!this._options.multiple) this._clearList();
        this._listElement.appendChild(item);
    },
    _clearList: function(){
        this._listElement.innerHTML = '';
        this.clearStoredFiles();
    },
    _error: function(code, fileName){
        var message = qq.FineUploaderBasic.prototype._error.apply(this, arguments);
        this._options.showMessage(message);
    }
});

function pics_del(id) {
	$('.loader div[rel='+id+']').remove();
}
function pics_add(pic) {
	if (!editor.exportSelection()) {
    	var editableElement = document.querySelector('div.text_editor');
        editor.selectElement(editableElement);
	}
	editor.pasteHTML('<a href="'+pic.replace(/_252\//,'')+'"><img alt="'+pic+'" src="'+pic+'"></a>');
	$(e).parent().find('input[name=hide]').prop('checked',false);
}
function pics_add_post(id,pic,full,w) {
    var txt = '';
    if (full == 1) {
        if (w < 250) txt = '<img alt="'+pic+'" src="/media/blog/com/'+pic+'">';
        else txt = '<a href="/media/blog/com/'+pic+'" class="fancybox post_pic" rel="gal1"><img alt="'+pic+'" src="/media/blog/com/'+pic+'"></a>';
    }
    else if (full == 2) {
        if (w < 600) wms2('Панорамой можно делать только картинки более 600px по ширине');
        else txt = '<img alt="'+pic+'" class="content-image" src="/media/blog/com/'+pic+'">';
    }
    else {
        if (w < 250) txt = '<img src="/media/blog/com/_252/'+pic+'">';
        else txt = '<a href="/media/blog/com/'+pic+'" class="fancybox post_pre" rel="gal1"><img alt="'+pic+'" src="/media/blog/com/_252/'+pic+'"></a>';
    }
    if (txt) {
        tinyMCE.execCommand('mceInsertContent', false, txt);
        $('.loader .progress[rel='+id+']').find('input[name=hide]').prop('checked',false);
    }
}
function pics_block(pics, id) {
    var txt = '';
    for(i in pics) {
        if (pics[i].hide != '1') {
            if (!txt) txt = '<div class="flex-images pgl">';
            if (pics[i].video) {
                txt += '<a rel="gal'+id+'" href="'+pics[i].video+'" class="video" title="'+pics[i].title+'">';
                txt += '<img src="'+pics[i].pic+'">';
                if (pics[i].title) txt += '<b>'+pics[i].title+'</b>';
                txt += '</a>';
            }
            else {
                txt += '<a rel="gal'+id+'" href="'+(pics[i].remote == '0' ? '/media/blog/com/' : '')+pics[i].pic+'" class="fancybox'+(pics[i].ext == 'gif' ? ' gifed' : '')+'" title="'+pics[i].title+'">';
                txt += '<img src="'+(pics[i].remote == '0' ? '/media/blog/com/'+(pics[i].ext == 'gif' ? '_252/' : '') : '')+pics[i].pic+'">';
                if (pics[i].title) txt += '<b>'+pics[i].title+'</b>';
                txt += '</a>';
            }
        }
    }
    if (txt) txt += '</div>';
    return txt;
}
function pics_block_edit(pics, rel) {
    var txt = '';
    for(i in pics) {
        txt += '<div class="progress" rel="'+pics[i].id+'">';
        txt += '<span class="progress-input">';
        txt += '<input type="hidden" name="pics" class="input" rel="'+rel+'" value="'+pics[i].pic+'">';
        txt += '<input type="hidden" name="id" class="input" rel="'+rel+'" value="'+pics[i].id+'">';
        txt += '</span>';
        if (pics[i].video) txt += '<a href="'+pics[i].video+'" class="lodedpic video"><img src="'+pics[i].pic+'"></a>';
        else txt += '<a href="'+(pics[i].remote == '0' ? '/media/blog/com/' : '')+pics[i].pic+'" class="lodedpic fancybox"><img src="'+(pics[i].remote == '0' ? '/media/blog/com/_252/' : '')+pics[i].pic+'"></a>';
        txt += '<span class="lodedpicinf"><a href="javascript:;" class="pics_del" onClick="pics_del('+pics[i].id+')"><i class="fa fa-times fa-fw"></i></a>';
        txt += '<input type="text" name="title" rel="'+rel+'" class="input input-sm form-control" placeholder="Описание" value="'+pics[i].title+'" onKeyDown="if (event.keyCode==13) return sform(this)">';
        txt += '<span class="picactions"><i class="fa fa-plus odtip" title="Вставить в коммент"></i> &nbsp;<div class="btn-group">';
        txt += '<a class="btn btn-xs btn-default odtip" href="javascript:;" onClick="pics_add(\''+(pics[i].remote == '0' ? '/media/blog/com/' : '')+pics[i].pic+'\')" title="Вставить в коммент: оригинальные размеры">оригинал</a> ';
        txt += '</div></span>';
        txt += '<b class="picshow"><input type="checkbox" name="hide" rel="'+rel+'" class="input" value="1"'+(pics[i].hide == 0 ? ' checked' : '')+'> Показывать</b></span>';
        txt += '</div>';
    }
    return txt;
}