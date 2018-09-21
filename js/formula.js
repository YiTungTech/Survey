//計算
//1. -----Type_0_4-----0.4總
//2. -----Type_1_1-----1.1供
//3. -----Type_1_2-----1.2供評
var uiValue = []; //要呈現在UI，各項「分數」
function calculateSingleAverage_Type(config) {
    console.log('calculateSingleAverage_Type()');
    var uiWording = []; //要呈現在UI，各項「wording」
    var uiTotalValue; //要呈現在UI，總「分數」
    var tempSumTotalValue = 0; //計算過程中暫存，將5大類分數累加
    var tempTotalValues = [];

    $.each(config.session, function(i, item_session) {
        var valueArray = []; //所有的值
        var sumValue = 0; //加總
        $.each(item_session.question, function(j, item_question) {
            var score = valueToScore(parseInt(item_question.value));
            sumValue += score;
            valueArray.push(score);
        });

        //最大值
        var valueMax = Math.max.apply(null, valueArray);
        // console.log('Type_1_1_' + i + '_最大值=' + valueMax);

        //平均值
        var valueAverage = sumValue / item_session.question.length;
        // console.log('Type_1_1_' + i + '_平均值=' + valueAverage);

        //1.綜合平均值 2.取4捨5入到小數第1位
        var temp = (valueMax + valueAverage) / 2;
        // console.log('temp=' + temp);
        tempSumTotalValue += temp;
        tempTotalValues.push(temp);
        uiValue.push(Math.round(temp * 10) / 10);




    });

    // console.log('uiValue=' + uiValue.toString());

    //mapping文字
    $.each(uiValue, function(i, value) {
        uiWording.push(ScoreToWording_Type_1_1(i, uiValue[i]));
    });
    // console.log('uiWording=' + uiWording.toString());

    //-----換算成「總」Type_0_4 -----
    var tempValueMax = Math.max.apply(null, tempTotalValues);
    var tempValueAverage = (tempSumTotalValue / config.session.length);
    //1.綜合平均值 2.取4捨5入到小數第1位
    uiTotalValue = (tempValueMax + tempValueAverage) / 2;
    uiTotalValue = Math.round(uiTotalValue * 10) / 10;
    // console.log('uiTotalValue=' + uiTotalValue);
    //-----換算成「總」Type_0_4 -----

    //-----update UI-----
    $.each(uiValue, function(i, value) {
        $('#Type_1_1_' + i).append(value);
    });

    $.each(uiWording, function(i, value) {
        $('#Type_1_2_' + i).append(value);
    });

    $('#Type_1_0_4').append(uiTotalValue);
    //-----update UI-----


}

//(模組)分算換算
function valueToScore(value) {
    switch (value) {
        case 1:
            return 0;
        case 2:
            return 2.5;
        case 3:
            return 5;
        case 4:
            return 7.5;
        case 5:
            return 10;
    }
}

//取得wording ----- Type_1_1 ----- 1.2供評
function ScoreToWording_Type_1_1(session, value) {
    if (session == 0) {
        if (2 >= value) { return "您沒有供氧能力不足的現象。"; }
        if (4 >= value && value > 2) { return "輕度供氧能力不足。"; }
        if (7 >= value && value > 4) { return "供氧能力不佳，容易發生缺氧。"; }
        if (10 >= value && value > 7) { return "嚴重的供氧障礙，經常性缺氧。"; }
    }
    if (session == 1) {
        if (2 >= value) { return "您沒有能量透支的現象。"; }
        if (4 >= value && value > 2) { return "輕度能量透支。"; }
        if (7 >= value && value > 4) { return "中度能量透支，消耗器官儲備。"; }
        if (10 >= value && value > 7) { return "嚴重能量透支，易形成缺氧病灶。"; }
    }

}

//計算
//1. -----B_typeA----- B-1-1,B-1-2,B-1-3 / B-2-1,B-2-2,B-2-3
function calculate_B_typeA(qmconfig) {
    console.log('calculate_B_typeA()');

    var uiResult = [];


    //todo 取出分數>5的題目，放到陣列
    $.each(qmconfig.B_typeA.session, function(i, item_session) {
        var uiAdvisementArray = [];
        var uiSingleAdvisementArray = [];
        var uiExerciseArray = [];
        // var uiTypeB = {};

        //是否需要使用「運動處方」
        var isNeedExercise = uiValue[i] > qmconfig.B_typeA.B_typeA1_exercise;

        //取得所有「生活型態建議」
        $.each(item_session.question, function(j, item_question) {
            var score = parseInt($.getUrlVar(item_question.qid));
            score = valueToScore(score);
            // console.log('item_question score=' + score);
            //分數大於config設定, 預設5 
            if (score >= qmconfig.B_typeA.B_typeA1_compare) {
                //符合條件，加入陣列
                uiSingleAdvisementArray.push(item_question);
            }
        });

        // console.log('「生活型態建議」排序前=' + JSON.stringify(uiSingleAdvisementArray));
        // 「生活型態建議」排序
        //【建議排序規則一】依照各題填答結果換算出的分數高低，由高至低排序。
        //【建議排序規則二】同分時，依照各建議優先順序設定排序。(參考表3欄位「生活排序規則2」)
        uiSingleAdvisementArray.sort(function(a, b) {
            function cmp(x, y) {
                return x > y ? 1 : (x < y ? -1 : 0); //等於的時候不要動
            }
            var scoreA = valueToScore(parseInt($.getUrlVar(a.qid)));
            var scoreB = valueToScore(parseInt($.getUrlVar(b.qid)));
            return cmp(scoreB, scoreA) || cmp(a.sort, b.sort); //return score是第一條件，sort為第2條件
        });

        // console.log('「生活型態建議」排序後=' + JSON.stringify(uiSingleAdvisementArray));//「生活型態建議」排序後=[{"qid":"299261106","title":"練習「以口吸氣，鼻用力呼氣」的深呼吸運動","sort":2},{"qid":"1848259859","title":"多利用抽風機、電風扇幫助空間換氣","sort":9},{"qid":"1221090849","title":"增加氧源，栽植室內盆栽","sort":10}]

        if (isNeedExercise) {
            //取得運動處方陣列

            $.each(item_session.exercise, function(eIndex, item_exercise) {
                uiExerciseArray.push(item_exercise);
            });

            // console.log('「運動處方建議」排序前 uiExerciseArray=' + JSON.stringify(uiExerciseArray));
            //運動處方進行排序
            //1. qidGroup內所有題目得到分數累加，由大到小排序。
            //2. 如果1.分數一致，由Sort欄位排序。
            uiExerciseArray.sort(function(a, b) {
                function cmp(x, y) {
                    return x > y ? 1 : (x < y ? -1 : 0); //等於的時候不要動
                }
                //取得加總後分數
                function sumScore(qidGroup) {
                    var totalScore = 0;

                    //將qidGroup內所有題目的分數
                    //1. 換算成分數 2.進行加總
                    $.each(qidGroup, function(qidIndex, item_qidGroup) {
                        totalScore += valueToScore(parseInt($.getUrlVar(item_qidGroup.qid)));
                    });
                    return totalScore;
                }

                var sumScoreA = sumScore(a.qidGroup);
                var sumScoreB = sumScore(b.qidGroup);
                // console.log('由大到小排序.  sumScoreA=' + sumScoreA +' sumScoreB='+sumScoreB);                        
                return cmp(sumScoreB, sumScoreA) || cmp(a.sort, b.sort); //return score是第一條件，sort為第2條件
            });
            // console.log('「運動處方建議」 排序後=' + JSON.stringify(uiExerciseArray));//「運動處方建議」 排序後=[{"qidGroup":[{"qid":"1848259859"},{"qid":"1221090849"}],"title":"加強鍛鍊胸肌、腹肌、上背肌等呼吸肌群。","sort":3},{"qidGroup":[{"qid":"299261106"}],"title":"進行脊椎、豎脊肌伸展運動。","sort":1}]
        }

        //將uiSingleAdvisementArray賽入 array
        $.each(uiSingleAdvisementArray, function(sIndex, item_singleadvisement) {

            if (sIndex >= 2 && isNeedExercise) {
                //第3項需要顯示「運動處方建議」，因此不增加「生活型態建議」

                return;
            }

            var uiTypeB = {};
            uiTypeB.title = '「生活型態建議」' + item_singleadvisement.title;
            uiAdvisementArray.push(uiTypeB);

        });

        if (isNeedExercise && uiExerciseArray.length > 0) {
            var uiTypeB = {};
            uiTypeB.title = '「運動處方建議」' + uiExerciseArray[0].title;
            uiAdvisementArray.push(uiTypeB);
        }
        uiResult.push(uiAdvisementArray);
    });

    console.log('「最終uiResult」=' + JSON.stringify(uiResult)); //「uiResult」=[[{"title":"「生活型態建議」練習「以口吸氣，鼻用力呼氣」的深呼吸運動"},{"title":"「生活型態建議」多利用抽風機、電風扇幫助空間換氣"},{"title":"「運動處方建議」加強鍛鍊胸肌、腹肌、上背肌等呼吸肌群。"}],[{"title":"「運動處方建議」紓壓打擊運動可緩減情緒緊繃。"}]]
    return uiResult;
}

//計算
//1. -----Type_1_10----- 1.10供運?
function calculateAdvisement() {
    console.log('calculateAdvisement()');
    //todo: 要可填入供2建、供3建....耗1建...
    var advisementGIDGroup = ['1848259859', '1221090849', '299261106']; //填入ID
    var uiAdvisement = '';
    for (var i = advisementGIDGroup.length - 1; i >= 0; i--) {
        var score = valueToScore(parseInt($.getUrlVar(advisementGIDGroup[i])));
        if (score >= 5) {
            uiAdvisement = "顯示供1建ＷＯＲＤＩＮＧ";
            break;
        }
    }

    //-----update UI-----
    if (uiAdvisement.length > 0) {
        $("#Type_1_10_1").append(uiAdvisement);
    }
    //-----update UI-----



}