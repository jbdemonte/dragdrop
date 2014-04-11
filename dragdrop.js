/*!
 *  Drag and drop plugin for jQuery 
 *  Version   : 2.0
 *  Date      : 2014-04-11
 *  Licence   : MIT
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 */
(function ($) {
    /**
     * Floating value while dragging
     * @type {*}
     */
    var target, value = null;

    /**
     * jQuery disable drag plugin
     * @returns {jQuery}
     */
    $.fn.nodrag = function () {
        this.each(function (_, element) {
            element.draggable = false;
        });
        this.on("dragstart mousedown", function (event) {
            event.preventDefault();
            return false;
        });
        return this;
    };

    /**
     * jQuery.drag plugin
     * store data in scoped "value"
     * @param data {*|Function} data or callback to forge data to store
     * @return {jQuery}
     */
    $.fn.drag = function (data) {
        var args;
        if (typeof data === "function") {
            args = Array.prototype.slice.call(arguments, 1);
        }
        this.each(function () {
            var item = $(this);
            if (item.attr("draggable")) { // remove previous handlers
                item.off("dragstart");
                item.off("dragend");
            } else {
                item.attr("draggable", true);
            }
            item.on("dragstart", function (event) {
                if (args) {
                    value = data.apply(this, args);
                } else {
                    value = data;
                }
                target = event.target;
                event.originalEvent.dataTransfer.effectAllowed = "move";
                event.originalEvent.dataTransfer.setData("Text", this.id || "");
                if (event.originalEvent.dataTransfer.setDragImage) {
                    event.originalEvent.dataTransfer.setDragImage(event.target, 0, 0);
                }
            });
            item.on("dragend", function () {
                value = null;
            });
            item = null;
        });
        return this;
    };

    /**
     * jQuery.drop
     * Handle drop zone (file OR dom element)
     * @param options {Function|Object}
     *          if {Function} drop callback
     *          if {Object}
     *              .enter {Function} dragenter callback (optional)
     *              .leave {Function} dragleave callback (optional)
     *              .over {Function} dragover callback (optional)
     *              .drop {Function} drop callback
     *              .file {Object} (optional)
     *                  .multiple {Boolean} Allow multiple file
     *                  .extension {String|Array<String>} filter on extensions allowed (optional)
     * @return {jQuery}
     */
    $.fn.drop = function (options) {
        var extensions = false;

        if (typeof options === "function") {
            options = {drop: options};
        }

        // forge extensions list ({ext => true})
        if (options.file) {
            if (options.file.extension) {
                if (typeof options.file.extension === "string") {
                    options.file.extension = [options.file.extension];
                }
                if (options.file.extension.length) {
                    extensions = {};
                    $.each(options.file.extension, function (i, extension) {
                        extensions[extension.toLowerCase()] = true;
                    });
                }
            }
        }

        /**
         * Return file extension in lower case
         * @param filename {String}
         * @return {String}
         */
        function getExtension(filename) {
            return (filename.split(".").pop() || "").toLowerCase();
        }

        // loop on each element in jQuery set
        this.each(function () {
            var latest = null,
                item = $(this),
                actions = [
                    {
                        bind: "dragenter",
                        name: "enter",
                        preProcess: function (event) {
                            var result = latest === null;
                            latest = event.target;
                            return result;
                        }
                    },
                    {
                        bind: "dragleave",
                        name: "leave",
                        preProcess: function (event) {
                            var result = event.target === latest;
                            if (result) {
                                latest = null;
                            }
                            return result;
                        }
                    },
                    {
                        bind: "dragover",
                        name: "over",
                        force: true,
                        postProcess: function (event, isSet, result) {
                            if (!isSet || result) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                            if (options.file && event.dataTransfer) {
                                event.dataTransfer.dropEffect = "copy";
                            }
                            return result;
                        }
                    },
                    {
                        bind: "drop",
                        name: "drop",
                        preProcess: function (event) {
                            var files, i, result = value !== null;
                            latest = null;
                            if ($(this).has(target).length) {
                                // drop on the same source, so, force to ignore it
                                event.preventDefault();
                                event.stopPropagation();
                                return false;
                            }
                            if (options.file) {
                                files = event.originalEvent.dataTransfer.files;
                                result = files.length < 2 || options.file.multiple;
                                if (result) {
                                    if (extensions) {
                                        for (i = 0; i < files.length; i += 1) {
                                            result = result && Boolean(extensions[getExtension(files[i].fileName || files[i].name || "")]);
                                        }
                                    }
                                }
                            }
                            // avoid browser opening drop files
                            if (result || (files && files.length)) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                            return result;
                        }
                    }
                ];

            // attach classic events
            $.each(actions, function (_, action) {
                if (action.force || options.hasOwnProperty(action.name)) {
                    item.on(action.bind, function (event) {
                        var result = Boolean(value !== null) !== Boolean(options.file),
                            $this = $(this);
                        if (result) {
                            if (action.preProcess) {
                                result = action.preProcess.call($this, event);
                            }
                            if (result && options[action.name]) {
                                result = options[action.name].call($this, event, options.file ? event.originalEvent.dataTransfer.files : value);
                            }
                            if (result && action.postProcess) {
                                result = action.postProcess.call($this, event, Boolean(options[action.name]), result);
                            }
                        }
                        return result;
                    });
                }
            });
            item = null;
        });

        return this;
    };
}(jQuery));