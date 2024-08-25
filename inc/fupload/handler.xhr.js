/*globals qq, File, XMLHttpRequest, FormData*/
qq.UploadHandlerXhr = function(o, uploadCompleteCallback) {
    "use strict";
    
    var options = o,
        uploadComplete = uploadCompleteCallback,
        fileState = [],
        cookieItemDelimiter = "|",
        multipart = options.forceMultipart || options.paramsInBody,
        api;


    function createXhr(id) {
        fileState[id].xhr = new XMLHttpRequest();
        return fileState[id].xhr;
    }

    function setParamsAndGetEntityToSend(params, xhr, fileOrBlob, id) {
        var formData = new FormData(),
            protocol = options.demoMode ? "GET" : "POST",
            endpoint = options.endpointStore.getEndpoint(id),
            url = endpoint,
            name = api.getName(id),
            size = api.getSize(id);

        params[options.uuidParamName] = fileState[id].uuid;

        if (multipart) {
            params[options.totalFileSizeParamName] = size;
        }

        //build query string
        if (!options.paramsInBody) {
            params[options.inputName] = name;
            if ($('#material_type').length) params['wallpaper'] = $('#material_type input[type="radio"]:checked').val();
            if ($('#pid').length) params['pid'] = $('#pid').val();
			url = qq.obj2url(params, endpoint);
        }

        xhr.open(protocol, url, true);
        if (multipart) {
            if (options.paramsInBody) {
                qq.obj2FormData(params, formData);
            }
            formData.append(options.inputName, fileOrBlob);
            return formData;
        }
        
        return fileOrBlob;
    }

    function setHeaders(id, xhr) {
        var extraHeaders = options.customHeaders,
            name = api.getName(id),
            file = fileState[id].file;

        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("Cache-Control", "no-cache");

        if (!multipart) {
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.setRequestHeader("X-Mime-Type", file.type);
        }

        qq.each(extraHeaders, function(name, val) {
            xhr.setRequestHeader(name, val);
        });
    }

    function handleCompletedFile(id, response, xhr) {
        var name = api.getName(id),
            size = api.getSize(id);

        options.onProgress(id, name, size, size);
        options.onComplete(id, name, response, xhr);
        delete fileState[id].xhr;
        uploadComplete(id);
    }

    function isErrorResponse(xhr, response) {
        return xhr.status !== 200 || !response.success;
    }

    function parseResponse(xhr) {
        var response;
        try {
            response = qq.parseJson(xhr.responseText);
        }
        catch(error) {
            response = {};
        }
        return response;
    }

    function onComplete(id, xhr) {
        var response;
        // the request was aborted/cancelled
        if (!fileState[id]) {
            return;
        }
        response = parseResponse(xhr);
        handleCompletedFile(id, response, xhr);
    }

    function getReadyStateChangeHandler(id, xhr) {
        return function() {
            if (xhr.readyState === 4) {
                onComplete(id, xhr);
            }
        };
    }

    function handleStandardFileUpload(id) {
        var file = fileState[id].file,
            name = api.getName(id),
            xhr, params, toSend;

        fileState[id].loaded = 0;

        xhr = createXhr(id);

        xhr.upload.onprogress = function(e){
            if (e.lengthComputable){
                fileState[id].loaded = e.loaded;
                options.onProgress(id, name, e.loaded, e.total);
            }
        };

        xhr.onreadystatechange = getReadyStateChangeHandler(id, xhr);

        params = options.paramsStore.getParams(id);
        toSend = setParamsAndGetEntityToSend(params, xhr, file, id);
        setHeaders(id, xhr);

        xhr.send(toSend);
    }


    api = {
        /**
         * Adds file to the queue
         * Returns id to use with upload, cancel
         **/
        add: function(file){
            if (!(file instanceof File)){
                throw new Error('Passed obj in not a File (in qq.UploadHandlerXhr)');
            }
            var id = fileState.push({file: file}) - 1;
            fileState[id].uuid = qq.getUniqueId();

            return id;
        },
        getName: function(id){
            var file = fileState[id].file;
            // fix missing name in Safari 4
            //NOTE: fixed missing name firefox 11.0a2 file.fileName is actually undefined
            return (file.fileName !== null && file.fileName !== undefined) ? file.fileName : file.name;
        },
        getSize: function(id){
            /*jshint eqnull: true*/
            var file = fileState[id].file;
            return file.fileSize != null ? file.fileSize : file.size;
        },
        getFile: function(id) {
            if (fileState[id]) {
                return fileState[id].file;
            }
        },
        /**
         * Returns uploaded bytes for file identified by id
         */
        getLoaded: function(id){
            return fileState[id].loaded || 0;
        },
        isValid: function(id) {
            return fileState[id] !== undefined;
        },
        getUuid: function(id) {
            return fileState[id].uuid;
        },
        /**
         * Sends the file identified by id to the server
         */
        upload: function(id, retry){
            var name = this.getName(id);

            options.onUpload(id, name);

            handleStandardFileUpload(id);
        },
        cancel: function(id){
            options.onCancel(id, this.getName(id));

            if (fileState[id].xhr){
                fileState[id].xhr.abort();
            }

            delete fileState[id];
        }
    };

    return api;
};
