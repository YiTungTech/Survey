
function showPanel(row) {
        var obj = document.getElementById(row);
        if (obj.style.display == "none") {
            obj.style.display = "";
        }
        else {
            obj.style.display = "none";
        }
}

function reloadImg(id) {

    var obj = document.getElementById(id);
    var src = obj.src;
    var pos = src.indexOf('?');
    if (pos >= 0) {
        src = src.substr(0, pos);
    }
    var date = new Date();
    obj.src = src + '?v=' + date.getTime();
    return false;
} (function ($) {
    jQuery.fn.setfocus = function () {
        return this.each(function () {
            var dom = this;
            setTimeout(function () {
                try { dom.focus(); } catch (e) { }
            }, 0);
        });
    };
})

