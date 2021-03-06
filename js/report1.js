var gFormID = '';
var gSheetParam = {}; //google sheet所需要的參數
var config; //json格式的config設定檔
var isNeedInsert = false;
var reportLink = '';//insert google sheet的連結，不會重複insert google sheet


$(function() {
    console.log('start() ver=5');
    isNeedInsert = false;//預設不傳送sheet
    var qmconfig; //json格式的question mapping設定檔

    initLoadingAnimation();
    initGetParam();
    initConfig();
    initDownloadButton();

    function initLoadingAnimation(){
        console.log('initLoadingImage()');
        $("#report").hide();
        $('#loadingimg').imgLoad(function(){
            // 圖片讀取完成
            setTimeout(function() {
                $( "#loading" ).fadeOut( "1000", function() {//loading頁 fade out
                    $( "#report" ).fadeIn( "100", function() {});//report頁 fade in
                });
            }, 4000);
        });
    }

    function initConfig() {
        console.log('initConfig()');
        // 讀取config檔案
        $.ajax({
            cache: false,
            url: "config/config.json",
            dataType: "json",
            success: function(data) {
                config = data;
                gFormID = config.fid;
                initQuestionMapping();
            }
        });
    }

    function initQuestionMapping() {
        console.log('initQuestionMapping()');
        // 讀取config檔案
        $.ajax({
            cache: false,
            url: "config/qmconfig.json",
            dataType: "json",
            success: function(data) {
                // console.log('initQuestionMapping() success');
                qmconfig = data;
                updateConfig();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }

        });
    }


    //將user的分數塞入config檔案
    function updateConfig() {
        console.log('updateConfig()');
        $.each(config.session, function(i, item_session) {
            //跑完所有question
            $.each(item_session.question, function(j, item_question) {

                // console.log('getUrlVar='+$.getUrlVar(item_question.qid));
                // item_question.value = $.getUrlVar(item_question.qid); // json object set value

                //todo 問題還沒建立完成，所以部分item_question.qid會拿到空的qid
                var qid = getUrlVar(item_question.qid);
                if (typeof qid != 'undefined') {
                    item_question.value = getUrlVar(item_question.qid); // json object set value    
                } else {
                    item_question.value = '3'; //set default
                }
            });
        });
        // console.log('config=' + JSON.stringify(config));
        calculate();
    }


    //計算data
    function calculate() {
        console.log('calculate()');
        var A = calculate_A(config, qmconfig);
        var B_typeA = calculate_B_typeA(qmconfig);
        var B_typeB = calculate_B_typeB(qmconfig);
        var C = calculate_C(qmconfig);
        var D = calculate_D(qmconfig);

        updateUI(B_typeA);
        updateUI_B_typeB(B_typeB);
        updateUI_C(C);
        updateUI_A(A);
        updateUI_D(D);


        var gMergeParam = createGMergeParam(A, B_typeA, B_typeB, C, D);
        sendGoogleSheet(gMergeParam);

    }

    //update UI
    function updateUI_A(A) {
        $.each(A, function(index, data) {
            var outputTitle = '#ui_A_' + (index + 1) + '_1';
            var outputDetail = '#ui_A_' + (index + 1) + '_2';
            var title = A[index].title;
            var detail = A[index].detail;
            $(outputTitle).append(title);
            $(outputDetail).append(detail);
        });
    }

    function updateUI(B_typeA) {
        $.each($('.ui_B_1'), function(index, data) {
            var data_B_1 = B_typeA[0];
            if ((index >= data_B_1.length)) { $(this).hide(); return; } //超過長度
            $('#card-B-1-default').hide();
            $(this).html(data_B_1[index].title);
        });

        $.each($('.ui_B_2'), function(index, data) {
            var data_B_2 = B_typeA[1];
            if ((index >= data_B_2.length)) { $(this).hide(); return; }
            $('#card-B-2-default').hide();
            $(this).html(data_B_2[index].title);

        });
    }

    function updateUI_B_typeB(B_typeB) {

        $.each($('.ui_B_3'), function(index, data) {
            var data_B_3 = B_typeB[0];
            if ((index >= data_B_3.length)) {
                // console.log('ui_B_3 index=' + index);
                $(this).hide();
                return; //超過長度
            }
            $('#card-B-3-default').hide();
            $(this).html(data_B_3[index].title);
        });

        $.each($('.ui_B_4'), function(index, data) {
            var ui_B_4 = B_typeB[1];
            if ((index >= ui_B_4.length)) {
                $(this).hide();
                return; //超過長度
            }
            $('#card-B-4-default').hide();
            $(this).html(ui_B_4[index].title);
        });
        $.each($('.ui_B_5'), function(index, data) {
            var ui_B_5 = B_typeB[2];
            if ((index >= ui_B_5.length)) { $(this).hide(); return; } //超過長度
            $('#card-B-5-default').hide();
            $(this).html(ui_B_5[index].title);
        });
    }


    function updateUI_C(C) {
        $.each($('.ui_C_1'), function(index, data) {
            var data_C = C[0];
            if ((index >= data_C.length)) { $(this).hide(); return; } //超過長度
            $('#card-C-1-default').hide();
            $(this).html(data_C[index].title);
        });

        $.each($('.ui_C_2'), function(index, data) {
            var data_C = C[1];
            if ((index >= data_C.length)) { $(this).hide(); return; } //超過長度
            $('#card-C-2-default').hide();
            $(this).html(data_C[index].title);
        });

    }

    function updateUI_D(D) {
        $('#ui_D_1').append(D.title);
        $('#ui_D_2').append(D.detail);
    }
});


//1.將http get參數存放到物件「gSheetParam」
//2.組合出google sheet url 「reportLink」
function initGetParam() {
    console.log('initGetParam()');
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    reportLink += window.location.href.split('?')[0] + '?';
    
    var hash;
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');

        var key = hash[0];
        var value = hash[1];
        if (key == KEY_INSERT) {
            //如果是非問卷題目，特殊處理
            if (value == VALUE_INSERT_TRUE) {
                //要insert google sheet
                isNeedInsert = true;
            }
        }else{
            //問卷題目
            reportLink += (key + '=' + value + '&');
            gSheetParam['entry.' + key] = decodeURIComponent(value);    
        }
    }
    //如果reportLink最後是「?」，則移除
    if (reportLink.charAt(reportLink.length - 1) == '&') {
        reportLink = reportLink.substring(0, reportLink.length - 1);
    }
    // console.log('reportLink='+reportLink);
    // console.log('initGetParam()='+JSON.stringify(gSheetParam));
}

//1. 提供method取得物件「gSheetParam」參數
function getUrlVar(name) {
    var result = gSheetParam[('entry.' + name)];
    return typeof result != 'undefined' ? result : '1';
}

//send gooogle sheet request
function sendGoogleSheet(gMergeParam) {

    if (!isNeedInsert) {
        console.log('no send google sheet');
        return false;
    }else{
        console.log('send google sheet');
    }

    //額外送出欄位1. USER優氧循環 2.USER建議清單
    var linkQid = config.systemField[0].question[0].qid; //儲存連結欄位
    var gMergeQid = config.systemField[0].question[1].qid; //google sheet plugin G-Merge所需欄位
    gSheetParam['entry.' + linkQid] = reportLink;
    gSheetParam['entry.' + gMergeQid] = gMergeParam.toString(); //toString預設就會使用comma隔開所有參數

//todo 暫時不送
    // console.log('send google sheet參數=' + JSON.stringify(gSheetParam));
    // console.log('https://docs.google.com/forms/d/e/' + gFormID + '/formResponse?' + JSON.stringify(gSheetParam));
    $.ajax({
        url: 'https://docs.google.com/forms/d/e/' + gFormID + '/formResponse',
        data: gSheetParam,
        type: "POST",
        dataType: "xml",
        statusCode: {
            0: function() {
                console.log('Success message');
            },
            200: function() {
                console.log('Success message');
            }
        }
    });
}

//組合出gMerge需要的參數，並存放在array
//因為資料來自於計算結果，因此此段程式要放後面執行。
function createGMergeParam(A, B_typeA, B_typeB, C, D) {
    var result = [];
    $.each(A, function(index, data) {
        var title = A[index].title;
        var detail = A[index].detail;
        result.push(title);
        result.push(detail);
    });

    function getUiData(uiTypeObject) {
        // console.log('getUiData()');
        //B_typeA
        $.each(uiTypeObject, function(object, data) {
            for (var index = 0; index < 3; index++) {
                if (data.length > index) {
                    //因為B_typeA[0]長度不一定有3個，因此要先判斷長度  
                    result.push(data[index].title);
                } else {
                    result.push(''); //沒有值，帶入空字串
                }
            }
        });
    }

    getUiData(B_typeA); //B_typeA
    getUiData(B_typeB); //B_typeB
    getUiData(C); //C

    //D
    result.push(D.title);
    result.push(D.detail);

    // console.log('result.toString()='+result.toString());
    return result.toString();
}

//下載檔案到local
function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        //Firefox requires the link to be in the body
        document.body.appendChild(link);
        //simulate click
        link.click();
        //remove the link when done
        // document.body.removeChild(link);//todo 測試暫時移除
    } else {
        window.open(uri);
    }
}

function initDownloadButton() {
    $("#downloadReport").on('click', function() {
        console.log('onclick_jquery_select3');

        html2canvas(document.querySelector("#capture")).then(canvas => {
            document.body.appendChild(canvas)
        });

        // html2canvas(document.querySelector("#canvas")).then(function(canvas) {
        //     saveAs(canvas.toDataURL(), '優氧循環檢驗報告.png');
        // });
        // html2canvas(document.getElementById("table_canvas")).then(function(canvas) {
        //     saveAs(canvas.toDataURL(), '優氧循環檢驗報告.png');
        // });
        // html2canvas(document.getElementById("testdiv2")).then(function(canvas) {
        //     saveAs(canvas.toDataURL(), '詳細頁面.png');
        // });
    });

    if (!isDownloadButtonShow()) {
        $("#downloadReport").hide();
    }

}

//判斷手機型號，決定是否顯示下載按鈕
function isDownloadButtonShow(){
    var deviceAgent = navigator.userAgent.toLowerCase();
    console.log('deviceAgent='+deviceAgent);
    var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
    if (agentID) {
        return false;
    }else{
        return true;
    }

}

/**
 * 當圖片讀取finish 回傳callback
 * Trigger a callback when 'this' image is loaded:
 * @param {Function} callback
 */
(function($){
    $.fn.imgLoad = function(callback) {
        return this.each(function() {
            if (callback) {
                if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
                    callback.apply(this);
                }
                else {
                    $(this).on('load', function(){
                        callback.apply(this);
                    });
                }
            }
        });
    };
})(jQuery);