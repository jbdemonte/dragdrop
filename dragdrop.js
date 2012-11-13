/*!
 *  Drag and drop plugin for jQuery 
 *  Version   : 1.0
 *  Date      : 2012-11-13
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
            });
        });
        return this;
    };
    $.fn.drop = function (hover, drop) {
        if (typeof drop === "undefined") {
            drop = hover;
            hover = null;
        }
        this.each(function () {
            var item = $(this);
            item.on("dragover", function (event) {
                if (typeof hover === "function") {
                    hover.call(item, event, value);
                } else {
                    event.preventDefault();
                }
            });
            if (typeof drop === "function") {
                item.on("drop", function (event) {
                    drop.call(item, event, value);
                });
            }
        });
        return this;
    };
})(jQuery);