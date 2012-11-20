/*!
 *  Drag and drop plugin for jQuery 
 *  Version   : 1.1
 *  Date      : 2012-11-20
 *  Licence   : MIT
 *  Author    : DEMONTE Jean-Baptiste
 *  Contact   : jbdemonte@gmail.com
 *  
 *  Copyright (c) 2010-2012 Jean-Baptiste DEMONTE
 *  All rights reserved.
 */
(function ($) {
    var value;
    $.fn.drag = function (data) {
        this.each(function () {
            var item = $(this);
            item.attr("draggable", true);
            item.on("dragstart", function (event) {
                if (typeof data === "function") {
                    value = data.call(item, event);
                } else {
                    value = data;
                }
                event.originalEvent.dataTransfer.effectAllowed = 'move';
                event.originalEvent.dataTransfer.setData('Text', this.id || "");
                event.originalEvent.dataTransfer.setDragImage(event.target, 0, 0);
            });
        });
        return this;
    };
    $.fn.drop = function (fncs) {
        if (typeof fncs === "function") {
            fncs = {drop: fncs};
        }
        this.each(function () {
            var item = $(this);
            if (fncs.dragstart) {
                $(document).bind("dragstart", function (event) {
                    fncs.dragstart.call(item, event, value);
                });
            }
            if (fncs.dragend) {
                $(document).bind("dragend", function (event) {
                    fncs.dragend.call(item, event, value);
                });
            }
            if (fncs.enter) {
                item.on("dragenter", function (event) {
                    return fncs.enter.call(item, event, value);
                });
            }
            item.on("dragover", function (event) {
                if (fncs.hover) {
                    fncs.hover.call(item, event, value);
                } else {
                    event.preventDefault();
                }
            });
            if (fncs.leave) {
                item.on("dragleave", function (event) {
                    return fncs.leave.call(item, event, value);
                });
            }
            item.on("drop", function (event) {
                if (fncs.drop) {
                    fncs.drop.call(item, event, value);
                }
            });
        });
        return this;
    };
})(jQuery);