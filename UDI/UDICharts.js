/* !
   * Must include G2.js, Jquery.js
   * Lincensed under MIT
   * Produced by NTU_CSIE_Lab303 Paul Chen in 2018
   * See more at https://github.com/ntupcchen/UDI-charts
-- */
var UDICharts = function () {

    /* -------------- public used --------------- */

    this.init = function (inputData, inputDiv,UDI_loc) {

        this.nowDoingID = nowDoingChartType;
        this.udiFilter = {};
        this.udiHighlight = ['', [], []];
        this.udiFilterTTIX = {};
        this.slider_filter = {};
        this.slider_dv = {};
        this.plotClickWaitLock = false;
        this.clickCount = 0;
        

        this.divDetailGraphic_address = divDetailGraphic_address;
        this.choosenArgument = choosenArgument; // 檢查用

        udiSelf = this;
        this.inputDiv = inputDiv;
        this.inputData = inputData || [
            { month: 'Jan', Tokyo: 7.0, London: 3.9 },
            { month: 'Feb', Tokyo: 6.9, London: 4.2 },
            { month: 'Mar', Tokyo: 9.5, London: 5.7 },
            { month: 'Apr', Tokyo: 14.5, London: 8.5 },
            { month: 'May', Tokyo: 18.4, London: 11.9 },
            { month: 'Jun', Tokyo: 21.5, London: 15.2 },
            { month: 'Jul', Tokyo: 25.2, London: 17.0 },
            { month: 'Aug', Tokyo: 26.5, London: 16.6 },
            { month: 'Sep', Tokyo: 23.3, London: 14.2 },
            { month: 'Oct', Tokyo: 18.3, London: 10.3 },
            { month: 'Nov', Tokyo: 13.9, London: 6.6 },
            // { month: 'Dec', Tokyo: 9.6, London: 4.8 },
            { month: 'Dec', Tokyo: 9, London: 4 }
        ];

        this.inputData = convertStr2Num(this.inputData);
        
        if(UDI_loc){
            UDI_addrss = UDI_loc;
        }else{
            UDI_folder_address = 'UDI'; //default設定UDI資料夾位於html檔的相同資料夾
        }

        // load popup html
        var s = "<p><a href='javascript:void(0)' id='makeNewUDI'>Click to insert interactive charts!</a></p>";
        s += '<p><button class="btn btn-warning " id="udiReset_button" style="padding: 3px;margin: 3px">重置條件</button></p>';
        s += '<p><span class="badge badge-secondary" id="udiFilterDisplayBox">圖組篩選:</span></p>';
        s += '<p><span class="badge badge-light" id="udiHLDisplayBox">圖組強調:</span></p>';
        $('#' + inputDiv).append(s);
        $("#" + inputDiv).append('<div id="divUDIhtml" class="divPopupMakeCharts"></div>');
        $("#" + inputDiv).append('<div id="divCharts"></div>');
        $("#" + inputDiv).append('<div id="divChartsBottons"></div>');
        $("body").append('<div id="divFade" class="black_overlay1"></div>');

        $.get(UDI_folder_address+'/udiPopup.html', function (data) {
            $('#divUDIhtml').html(data);
            console.log(data);
            getKeysName(udiSelf.inputData);
            setSelectList(0);

            var s = '#' + inputDiv;
            $(s + ' #makeNewUDI').click(udiSelf.makeNewClick);
            $(s + ' #buttonMakePreview').click(function () { divDetailGraphic_address = makeGraphic('divDetailGraphic') });

            $(s + ' #icon_Gback').click(function () { divToggle(0); setSelectList(0); });
            $(s + ' #icon_Gexit').click(popDownMakeCharts);
            $(s + ' #icon_Gconfirm').click(function () { popDownMakeCharts(); saveArgument(); });
            $(".udiIconShowDetail").click(function (e) { showDetailDiv(e.target.id) });
            $(".udiDetailCancel").click(function (e) { hideDetailDiv(e.target.value) });
            $(".udiDetailConfirm").click(function (e) { trueCheckboxByBtn(e.target.value); });
            $(s + ' #udiReset_button').click(function () { $(document).trigger('data_start'); })
            // $("#udiSaveFoldCheck").click(function(e){ saveFoldCheck();hideDetailDiv(e.target.value);});


            for (i = 1; i < chartType.length; i++) {
                $("#divSelectChartType").append("<div id=\"chartType_" + chartType[i].id + "\" class=divChartType></div>");
                $("#chartType_" + chartType[i].id).prepend("<div>" + chartType[i].name + "       "
                    + "<img src='"+UDI_folder_address+"/icons/icon_goDetail.svg' id=\"udiB_" + chartType[i].id + "\" title='See More' class=udiIconToDetail width=35px height=35px></div>");
                $("#chartType_" + chartType[i].id).append("<div class='divChartType_Ex'>"
                    + "<img src='"+UDI_folder_address+"/png/chartEx_" + chartType[i].id + ".png' id=\"chartType_Ex_" + chartType[i].id + "\" title='' class=chartType_Ex  height=250px></div><br>");
            }

            $('.chartType_Ex').css('width', '95%');
            $('.chartType_Ex').css('hight', '95%');
            // $(".chartType_Ex").click(function(){seeMoreclick();});
            $(document).on("click", ".chartType_Ex", seeMoreClick);
            $(document).on("click", ".udiIconToDetail", seeMoreClick);
            $(document).keyup(function (e) {
                if (e.keyCode == 27) { // escape key maps to keycode `27`
                    popDownMakeCharts();
                }
            });
            popDownMakeCharts();
        });

        filterDisplay();
        
    }

    // renew public filters and highlights
    $(document).on("data_start", function (event) {
        udiSelf.udiFilter = {};
        udiSelf.udiHighlight = ['', [], []];
        udiSelf.udiFilterTTIX = {};
        smFilt ={};
        smFiltIX = [];

    })

    this.inputChanged = function (inputData) {
        this.inputData = inputData;
        getKeysName(this.inputData);
        this.inputData = convertStr2Num(this.inputData);
    }

    this.popDownMakeCharts = function () {
        document.getElementById('divUDIhtml').style.display = 'none';
        document.getElementById('divFade').style.display = 'none';
    }

    this.SMused = function (bool) {
        if (bool == true) {
            state = share_model.state;
            SMused = true;
            return this;
        }
        if (bool == false) {
            state = true;
            SMused = false;
            return this;
        }
    }

    this.loadCharts = function (str_argument) {
        choosenArgument = JSON.parse(str_argument);

        udiSelf.makeNewClick();
        popDownMakeCharts();

        for (var i in choosenArgument) {
            console.log(i);
            if (!choosenArgument[i]) { continue; }
            loadArgument(i);
            saveArgument();
        }
        return true;
    }

    this.getChartsArguments = function () {
        var copy_choosen = choosenArgument.slice();

        for (var i in copy_choosen) {
            delete copy_choosen[i].chart_address;
        }

        return JSON.stringify(copy_choosen);
    }

    this.stateReset = function(){
        $(document).trigger('data_start');   
    }

    this. makeNewClick = function() {
        // console.log('makeNew');
        revising = -1;
        nowDoingChartType = 0;
        divToggle(0);
        setSelectList(0);
        $('#divUDISelectList').css('width', '30%');
        popUpMakeCharts();
    }


    /* -------------- private used --------------- */
    const chartType = [
        {
            name: "Make Charts", id: "-1", dim1: 'x軸', dim2: 'y軸', dim3: 'z軸',
            dim1Guide: "", dim2Guide: "", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gcolor", "Gh", "GRadius", "GIRadius", "Gsize", "Gth"]
        },
        {
            name: "pointChart", id: "1", geom: "point", dim1: ' x軸', dim2: ' y軸', coord: "rect",
            dim1Guide: "", dim2Guide: "", dim3Guide: "", statOnXZ: false, coreDim: ['x', 'y'],
            hideSelection: ["Gyy", "Gz", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "barChart", id: "2", geom: "interval", dim1: ' x軸', dim2: ' y軸', coord: "rect",
            dim1Guide: "適合使用-Category", dim2Guide: "適合使用-number", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "AreaChart", id: "3", geom: "point", dim1: ' x軸', dim2: ' y軸', coord: "rect",
            dim1Guide: "適合使用-number", dim2Guide: "適合使用-number", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "Gcolor", "Gsize", "GRadius", "GIRadius"]
        },
        {
            name: "pieChart", id: "4", geom: "intervalStack", dim1: '類別依據', dim2: '  角度依據', coord: "theta",
            dim1Guide: "partition", dim2Guide: "必須是數字型態", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gcolor", "Gz", "Gsize"]
        },
        {
            name: "分組柱狀圖", id: "5", geom: "interval", dim1: "X軸", dim2: "y軸", dim3: '組間分色依據', coord: "rect",
            dim1Guide: "(必須為類別)", dim2Guide: "", dim3Guide: "(必須為類別)", statOnXZ: true, coreDim: ['x', 'z'],
            hideSelection: ["Gcolor", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "柱狀分面樹圖", id: "6", geom: "interval", dim1: "x軸", dim2: "y軸", dim3: '分面依據', coord: "rect",
            dim1Guide: "選取類別", dim2Guide: "選取數量", dim3Guide: "選取類別", statOnXZ: true, coreDim: ['x', 'z'],
            hideSelection: ["GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "roseChart", id: "7", geom: "interval", dim1: '類別', dim2: '高度', coord: "polar",
            dim1Guide: "使用Category", dim2Guide: "使用-number", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "Gcolor", "Gsize", "GRadius"]
        },
        {
            name: "linesChart", id: "8", geom: "line", dim1: 'x軸', dim2: 'y軸', coord: "rect",
            dim1Guide: "適合使用-number", dim2Guide: "適合使用-number", dim3Guide: "", statOnXZ: false, coreDim: ['c'],
            hideSelection: ["Gz", "Gsize", "GRadius", "GIRadius"]
        },
        {
            name: "堆叠柱狀圖", id: "9", geom: "interval", dim1: "X軸", dim2: "y軸", dim3: '組間分色依據', coord: "rect",
            dim1Guide: "(必須為類別)", dim2Guide: "", dim3Guide: "(必須為類別)", statOnXZ: true, coreDim: ['x', 'z'],
            hideSelection: ["Gcolor", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "時間事件圖", id: "10", geom: "interval", dim1: ' 事件 ', dim2: '開始值', dim3: '結束值', coord: "rect",
            dim1Guide: "適合使用-Category", dim2Guide: "適合使用-時間,數值", dim3Guide: "適合使用-時間,數值", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gyy", "GRadius", "GIRadius", "Gsize"]
        }
        ,
        {
            name: "詞雲", id: "11", geom: "point", dim1: ' 字詞 ', dim2: '參考數量', dim3: '', coord: "rect",
            dim1Guide: "適合使用-Category", dim2Guide: "使用-數值", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "直方圖", id: "12", geom: "interval", dim1: 'X軸', dim2: 'Y軸', dim3: '', coord: 'rect',
            dim1Guide: "<br>使用數值維度，使用加入功能-數據分箱", dim2Guide: "<br>請使用統計值做y軸", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "Gcolor", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "角度限定玫瑰圖", id: "13", geom: "interval", dim1: '類別', dim2: '高度', coord: "polar",
            dim1Guide: "使用Category", dim2Guide: "使用-number", dim3Guide: "", statOnXZ: false, coreDim: ['x'],
            hideSelection: ["Gz", "Gsize", "GRadius"]
        },
        {
            name: "氣泡圖", id: "14", geom: "point", dim1: ' x軸', dim2: ' y軸', coord: "rect",
            dim1Guide: "使用數值", dim2Guide: "使用數值", dim3Guide: "", statOnXZ: false, coreDim: ['x', 'y'],
            hideSelection: ["Gz", "GRadius", "GIRadius"]
        },
        {
            name: "色塊圖", id: "15", geom: "polygon", dim1: ' x軸', dim2: '顏色依據', dim3: 'y軸', coord: "rect",
            dim1Guide: "使用類別型態", dim2Guide: "分色依據建議選用數字型態，統計值將作'顏色依據'，色調建議使用單色調", dim3Guide: "使用類別型態", statOnXZ: true, coreDim: ['x', 'z'],
            hideSelection: ["Gcolor", "GRadius", "GIRadius", "Gsize"]
        },
        {
            name: "堆疊面積圖", id: "16", geom: "area", dim1: ' x軸', dim2: ' y軸', dim3: '顏色(堆疊)依據', coord: "rect",
            dim1Guide: "適合使用-number", dim2Guide: "適合使用-number", dim3Guide: "請使用-Categorical", statOnXZ: false, coreDim: ['x', 'z'],
            hideSelection: ["Gcolor", "Gsize", "GRadius", "GIRadius"]
        }
    ];



    const makeChartSelections = ["Gx", "Gy", "Gyy", "Gz", "Gcolor", "Gh", "GRadius", "GIRadius", "Gsize"];
    //for hide the selections when need

    const Detail_checkBoxs_id = ["Cbx_udiPrivateFilter", "Cbx_udiDvSort", "Cbx_udiSlider", "Cbx_udiDeBin", "udi_dvSort_Radio1", "udi_dvSort_Radio2"];
    const Detail_inputs_id = ['udi_title_Text', 'udi_DeSize_selectList', 'udi_DeSize_Text', "dvSort_selectList", 'udi_slider_selectList', "udi_DeBin_selectList", 'udi_DeBin_Text'];

    const toneArray = [null, 'G2.Global.colors_pie_16', '#c6dbef-#3182bd', '#fdd0a2-#e6550d', '#c7e9c0-#31a354', '#dadaeb-#756bb1'];
    const toneMonoArray = ['#1f77b4', '#ffc000', '#6baed6', '#fd8d3c', '#74c476', '#9e9ac8']

    var nowDoingChartType = 0;
    var choosenArgument = [];   //array of obj, used to save choosen charts
    var revising = -1;  //-1 for create new graphic, graphID for revising

    //geom: point path line  area interval polygon edge schema contour heatmap
    // 'this' object used have to acheive through input self

    var x, y, z, c, h, radi, iradi, siz, sta;
    var y0; //以y=sta時，暫存y值
    var udiSelf;
    var SMused = false;
    var state = true;
    var isDetailMaking = 0;
    var smFilt ={}; //title: ,state: ;
    var smFiltIX = []; //來自Shared model的filter

    var divDetailGraphic_address;  //[chart, slider]
    var UDI_folder_address;


    function popUpMakeCharts() {
        document.getElementById('divUDIhtml').style.display = 'block';
        document.getElementById('divFade').style.display = 'block';
    }

    function popDownMakeCharts() {
        document.getElementById('divUDIhtml').style.display = 'none';
        document.getElementById('divFade').style.display = 'none';
    }

    function getKeysName(data) {

        var keyArr = [];    //存放表格的第一列
        for (var i in data) {
            var val = data[i];
            for (var j in val) {
                var sub_key = j;
                keyArr.push(sub_key);
            }
            break;
        }

        var str = "<option value='udi_x'> 第一維度</option>";
        str += "<option value='udi_y'>第二維度</option>";


        for (i = 0; i < keyArr.length; i++) {
            document.myFormG.Gy.options[i] = new Option(keyArr[i], keyArr[i]);
            document.myFormG.Gy.length = keyArr.length;

            document.myFormG.Gx.options[i] = new Option(keyArr[i], keyArr[i]);
            document.myFormG.Gx.length = keyArr.length;

            document.myFormG.Gz.options[i] = new Option(keyArr[i], keyArr[i]);
            document.myFormG.Gz.length = keyArr.length;

            document.myFormG.Gcolor.options[i] = new Option(keyArr[i], keyArr[i]);
            document.myFormG.Gcolor.options[i + 1] = new Option('單色', 'mono');
            document.myFormG.Gcolor.length = keyArr.length + 1;

            document.myFormG.Gsize.options[i] = new Option(keyArr[i], keyArr[i]);
            document.myFormG.Gsize.options[i + 1] = new Option("0", 0);
            document.myFormG.Gsize.options[i + 2] = new Option(4, 4);
            document.myFormG.Gsize.options[i + 3] = new Option(8, 8);
            document.myFormG.Gsize.length = keyArr.length + 3;

            str += "<option value='" + keyArr[i] + "'>" + keyArr[i] + "</option>";
        };
        $('#udi_slider_selectList').html(str);

        setPF_CheckboxList(data);
    }

    // set private filter checkbox list
    function setPF_CheckboxList(data) {
        $('#udiDeCardText_PrivateFilter').html('');

        var obj = countEachContent(data);
        // { 月:{ A:1, B:1 }, Jap:{ 7:2 } }

        var c = 0;
        for (var key in obj) {

            var str = '';
            str += '<div class="udiDePFKey">';

            str += '<li >' + key;
            str += '<ol>';
            for (var k2 in obj[key]) {
                str += '<li data-name="' + key + '" data-value="' + k2 + '">';
                str += k2 + '  (' + obj[key][k2] + ')';
                str += '</li>';
            }

            str += '</ol>';
            str += '</li>';
            str += '</div>';
            c++

            $('#udiDeCardText_PrivateFilter').append(str);

            // treeview        
        }

        $('#divUDIhtml .udiDePFKey').bonsai({
            expandAll: false,
            checkboxes: true,
            createInputs: 'checkbox'
        });

    }



    function seeMoreClick(evt) {
        // window.alert(evt.target.id);
        console.log(event.target);
        divToggle(1);
        nowDoingChartType = (evt.target.id).replace("chartType_Ex_", "").replace("udiB_", "");
        setSelectList(nowDoingChartType);
    }


    function divToggle(boo) {
        // 0=>Select ChartType　1=> Preview Chart
        if (boo == 0) {
            $("#divSelectChartType").show("normal");
            $("#divUDISelectList").show("normal");
            $("#divDetailGraphic").hide("normal");
        } else if (boo == 1) {
            $("#divSelectChartType").hide("normal");
            $("#divUDISelectList").show("normal");
            $("#divDetailGraphic").show("normal");
        }
    }

    function setSelectList(chartTypeIndex) {
        /*hide the buttons */
        if (chartTypeIndex == 0) {
            $("#divUDISelectList").width('45%');
            $('#icon_Gback').css("display", "none");
            $('#icon_Gconfirm').css('display', "none");
            $('#buttonTryItG').css("display", "initial");
            $("#buttonMakePreview").css("display", "none");
            // document.getElementById("Gh").value = 200;
            setDetail_default();
        }
        else {
            $('#divUDISelectList').width('23%');
            $('#icon_Gback').css("display", "initial");
            $('#icon_Gconfirm').css('display', "initial");
            $('#buttonTryItG').css("display", "none");
            $("#buttonMakePreview").css("display", "initial");
            // document.getElementById("Gh").value = 400;
        }

        /* set selection list title*/
        nowDoingChartType = chartTypeIndex;
        $("#divUDIhtml #SelectListTitle").text(chartType[nowDoingChartType].name);

        /* hide selection when need */
        for (i = 0; i < makeChartSelections.length; i++) {
            var s = makeChartSelections[i].replace("G", "") + "P"
            $("#divUDIhtml " + '#' + s).css("display", "initial");
        }

        for (i = 0; i < chartType[nowDoingChartType].hideSelection.length; i++) {
            var s = (chartType[nowDoingChartType].hideSelection[i]).replace("G", "") + "P";

            // if sta is not uesd, init it.
            if (s == 'yyP') {
                $('#Gyy').val('null');
            }

            $("#divUDIhtml " + '#' + s).css("display", "none");

        }

        /* 調整維度名稱、Guide */
        $("#fontSelectorX").text(chartType[nowDoingChartType].dim1 + "：");
        $("#fontSelectorY").text(chartType[nowDoingChartType].dim2 + "：");
        $("#fontSelectorZ").text(chartType[nowDoingChartType].dim3 + "：");

        document.getElementById("guideX").innerHTML = chartType[nowDoingChartType].dim1Guide;
        document.getElementById("guideY").innerHTML = chartType[nowDoingChartType].dim2Guide;
        document.getElementById("guideZ").innerHTML = chartType[nowDoingChartType].dim3Guide;
    }

    function setDetail_default() {
        const Detail_checkBoxs_id = ["Cbx_udiPrivateFilter", "Cbx_udiDvSort", "Cbx_udiSlider", "Cbx_udiDeBin", "udi_dvSort_Radio1", "udi_dvSort_Radio2"];
        const Detail_inputs_id = ['udi_title_Text', 'udi_DeSize_selectList', 'udi_DeSize_Text', "dvSort_selectList", 'udi_slider_selectList', "udi_DeBin_selectList", 'udi_DeBin_Text'];

        for (var i in Detail_checkBoxs_id) {
            $('#' + Detail_checkBoxs_id[i]).prop('checked', false);
        }

        $('#udi_title_Text').val('Chart_Title_');
    }

    function getSelectList() {

        x = $('#divUDIhtml #Gx').val();
        y = $('#divUDIhtml #Gy').val();
        z = $('#divUDIhtml #Gz').val();
        c = $('#divUDIhtml #Gcolor').val();
        h = $('#divUDIhtml #Gh').val();
        radi = $('#divUDIhtml #GRadius').val();
        iradi = $('#divUDIhtml #GIRadius').val();
        siz = $('#divUDIhtml #Gsize').val();
        sta = $('#divUDIhtml #Gyy').val();
        // typeOf => string
    }

    function showDetailDiv(iconID) {
        if (!isDetailMaking) {
            $('#divDetailGraphic').width('45%');
            $('#UDIdetailDivs').show('normal');
        }
        var detailDivID = "#" + iconID.replace('icon', 'detail');
        $(detailDivID).show('normal');
        isDetailMaking++;
    }

    function hideDetailDiv(value) {
        var detailDivID = '#detail_' + value;
        $(detailDivID).hide('normal');
        isDetailMaking--;
        // console.log(isDetailMaking);
        if (!isDetailMaking) {
            $('#divDetailGraphic').width('70%');
            $('#UDIdetailDivs').hide('normal');
        }
    }

    function trueCheckboxByBtn(value) {
        var Cbx = '#Cbx_' + value;
        $(Cbx).prop('checked', true);
    }

    /* checkedValue=[ '男性人口', ' 女性人口' ] */
    function saveFoldCheck() {
        var checkedValue = [];
        var inputElements = document.getElementsByClassName('udiFoldList');
        var str = '';

        for (var i = 0; i < inputElements.length; i++) {
            if (inputElements[i].checked) {
                str = str + inputElements[i].value + ';'
                checkedValue.push(inputElements[i].value);
            }
        }
        document.getElementById('udiNowFolding').innerHTML = str;
        document.getElementById('#udiCBFold').checked = true;
        return checkedValue;
    }



    function makeGraphic(divID, udiId) {

        var isActive = (typeof (udiId) != 'undefined');

        if (divID == 'divDetailGraphic') {
            if (divDetailGraphic_address) {
                divDetailGraphic_address.destroy();
                // if (divDetailGraphic_address[1]) { divDetailGraphic_address[1].destroy() };
            }
        }

        getSelectList();
        var coor = chartType[nowDoingChartType].coord;

        $('#' + udiSelf.inputDiv + " #" + divID).empty();

        const ds = new DataSet({
            state: {
                highlight: [],
                filter: []
            }
        });


        const dv = ds.createView().source(udiSelf.inputData);


        h = getDetailSize(h, isActive, divID);

        var chart = new G2.Chart({
            id: divID,
            forceFit: true,
            height: h,
            // plotCfg: {
            //     margin: [20, 90, 60, 80]
            // },
            padding: (function () {
                // if (nowDoingChartType == '11') { return 0 }
                // else 
                return 'auto';
            })()
        });



        chart.coord(coor, {
            radius: radi,// 设置饼图的大小
            innerRadius: iradi
        });


        setPrivateFilter(dv, divID);
        stepFilter(ds, dv);
        // console.log(nowDoingChartType);
        if (nowDoingChartType == '12') { c = 'mono'; $('#Cbx_udiDeBin').prop('checked', true); }
        // 直方圖使用數據分箱
        if (nowDoingChartType == '3') { c = 'mono'; }
        // Area chart
        stepDeBin(dv); //小心內涵 x => udiBin_x ;

        stepDataTransfer(chart, dv);


        if (sta == "null") { }
        else {
            y0 = y;
            y = sta;
        }

        setDvSort(dv);

        if ($('#Cbx_udi_DeTranspose').prop('checked') == true) { chart.coord().transpose(); }
        chart.source(dv);

        chart.tooltip({
            showTitle: false
        });

        var geometry = stepGeom(chart, dv, sta, x, y, z, c, siz, nowDoingChartType);



        stepSetOpa(ds, geometry, x);

        chart.render();

        // try {
        //     chart.render();
        // } catch (err) {
        //     console.log(err.name + err.message);
        // }

        setSlider(ds, dv, divID, x, y, isActive, chart);

        var geom = chartType[nowDoingChartType].geom;
        var tmpState;

        /* add interactivity on final chart */
        if (isActive) {
            console.log(divID, udiId);
            $(document).on("data_start", function (event) {
                ds.setState('highlight', []);
                ds.setState('filter', []);
                $("#udiFilterDisplayBox").html("圖組篩選狀態: ;");
                $("#udiHLDisplayBox").html("圖組強調狀態: ;");
            });

            // pie chart(interval stack), rose chart(interval)
            if (nowDoingChartType == (4 || 7)) {
                geom = 'interval';
            }

            chart.on(geom + ':dblclick', ev => {
                /*
                if(!ev.isSelect){ev.isSelect='false';}
                    getNewFilter=geom's IDs
                  selfFilter=selFilter || newFilter;
                  AllFilter = selFilter && selFilters
                  trigger Filter
                  ev.isSelect=true
                 */

                if (!ev.isSelect) { ev.isSelect = false; }
                setChartFilter(ev, udiId);
                var condition = setMyCondition(ev, divID, udiSelf.udiFilterTTIX[udiId]);
                state = true
                if (SMused) { var s = share_model.state; share_model.state = true; setTimeout(function () { share_model.state = s; }, 280); }
                $(document).trigger('data_filter', condition);
                console.log("dbclick_udiID:" + udiId);

            })

            chart.on(geom + ':click', ev => {
                udiSelf.clickCount++;

                // 0.3秒內clickcount==1就highlight
                setTimeout(function () {
                    console.log('click');
                    // console.log(ev);
                    if (udiSelf.clickCount != 1) { setTimeout(function () { udiSelf.clickCount = 0 }, 250); return -1; }
                    if (udiSelf.clickCount == 1) {
                        console.log('B');
                        udiSelf.clickCount = 0;
                        setUdiHighlight(ev, udiId);
                        var condition = setMyCondition(ev, divID, udiSelf.udiHighlight[1]);
                        state = false;
                        if (SMused) { var s = share_model.state; share_model.state = false; setTimeout(function () { share_model.state = s; }, 280); }
                        $(document).trigger('data_filter', condition);

                    }
                }, 300);


            })

            chart.on('plotclick', ev => {
                if (udiSelf.plotClickLock == true) {
                    return 0;
                }
                udiSelf.plotClickLock = true;
                setTimeout(function () {
                    if (udiSelf.clickCount == 0) {
                        // console.log('Do Plotclick.');
                        var condition = [{ source: divID, val: {}, type: 'equal' }];
                        udiSelf.udiHighlight = ['', [], []];
                        if (SMused) { var s = share_model.state; share_model.state = false; setTimeout(function () { share_model.state = s; }, 280); }
                        $(document).trigger('data_filter', condition);
                    }
                }, 250)
                udiSelf.plotClickLock = false;
            });


            /*
                hightlight = global.hight[] + selFilter
            */

            $(document).on("data_filter", function (event, input) {

                /*
                    if(SMused){}
                    Filter = AllFilter - selFilter
                */

                if (SMused && input.source.split('_')[0] != 'divUDIchart') {
                    if (state) {
                        smFilt.title = input.source;
                        smFilt.state = input.val[0]; // item1: ["歐洲"], place: ["西班牙"]
                        smFiltIX = share_model.getResult(share_model.condition[0]);
                    } else {
                        udiSelf.udiHighlight[0] = input.source;
                        udiSelf.udiHighlight[1] = share_model.getResult(share_model.condition[0]);
                        for (i = 0; i < udiSelf.udiHighlight[1].length; i++) {
                            udiSelf.udiHighlight[1][i]--  //sID => Index
                        }
                        var h2 = []
                        for (var key in input.val[0]) {
                            for (var i in input.val[0].key) {
                                h2.push({ key: input.val[0].key[i] });
                            }
                        }
                        udiSelf.udiHighlight[2] = h2;
                    }
                }


                if (input.source == divID && state) {
                    // 對自己的Filter以Highlight呈現
                    var filt2highlight = [];
                    filt2highlight = udiSelf.udiFilterTTIX[udiId];

                    var arr = unionOfArr(udiSelf.udiHighlight[1], filt2highlight);
                    ds.setState('highlight', arr);
                } else if (state) {
                    var gFilt = getUDIFilter(udiId);
                    ds.setState('filter', gFilt);
                } else if (!state) {
                    var filt2highlight = [];
                    filt2highlight = udiSelf.udiFilterTTIX[udiId];

                    var arr = unionOfArr(udiSelf.udiHighlight[1], filt2highlight);
                    ds.setState('highlight', arr);
                } else {
                    console.log("error situation!")
                }
            });
        }

        return chart;
    }

    function getDetailSize(h, isActive, divID) {

        if (isActive) {
            $('#' + divID).css('width', $('#udi_DeSize_selectList').val());
        }

        if ($('#udi_DeSize_Text').val() == 0) {
            return h;
        } else {
            return $('#udi_DeSize_Text').val();
        }

    }

    function getUDIFilter(udiId) {
        var gFilt = [];
        gFilt = filtUdi(udiId);
        // console.log(gFilt);

        if (SMused == true) {
            if (share_model.state == true) {
                console.log('I filt Shared model');
                // smFiltIX = share_model.getResult(share_model.condition[0]);
                for (i = 0; i < smFiltIX.length; i++) {
                    smFiltIX[i]--  //sID => Index
                }
                gFilt = interSectionOfArr(gFilt, smFiltIX);
                console.log(gFilt)
            }

        }

        var isFiltering;
        if (gFilt.length) { isFiltering = true; }
        var sldArr = udiSelf.slider_filter[udiId];
        if (sldArr) { console.log(sldArr); }
        gFilt = interSectionOfArr(gFilt, sldArr);
        // console.log('gFilt-');
        // console.log(gFilt);

        //Slider filter 交集 gFilt may be empty
        if ((!gFilt.length) && isFiltering) { gFilt = [-1]; }
        return gFilt;
    }

    function setPrivateFilter(dv, divID, isActive) {
        if (!$('#Cbx_udiPrivateFilter').prop('checked')) {
            return dv;
        }

        var f = {}
        // { 地名:[山西, 東北], 時間:[1990] }
        $("#divUDIhtml ol.bonsai input:checkbox:checked").each(function () {
            console.log(this);
            val = $(this).val();
            id = $(this).parent().attr('data-name');

            f[id] = f[id] || [];
            f[id].push(val);
        });

        var privateF_IX = [];

        for (var key in f) {
            var geomFilterArr = [];
            for (var index in f[key]) {
                var obj = {};
                obj[key] = f[key][index];
                geomFilterArr.push(obj);
            }
            privateF_IX = interSectionOfArr(geomFilt2IndexType(geomFilterArr), privateF_IX);
        }

        console.log(privateF_IX);

        dv.transform({
            type: 'filter',
            callback(row) { // 判断某一行是否保留，默认返回true

                if (privateF_IX == 0) { return true; }
                for (i = 0; i < privateF_IX.length; i++) {
                    if (privateF_IX[i] == row.sID - 1) {
                        return true;
                    }
                }
                return false;
            }
        });

    }

    /* dv新增一欄分箱字串,並取代 x or z */
    function stepDeBin(dv) {
        if (!$('#Cbx_udiDeBin').prop('checked')) {
            return dv;
        }
        var dim;
        console.log($('#udi_DeBin_selectList').val());
        if ($('#udi_DeBin_selectList').val() == '1') {
            dim = x;
            x = 'udiBin_' + x;
        } else {

            dim = z;
            z = 'udiBin_' + z;
        }

        var max = min = dv.rows[0][dim];
        for (var i in dv.rows) {
            var tmp = dv.rows[i][dim];
            if (tmp > max) { max = tmp; }
            if (tmp < min) { min = tmp; }
        }

        var k = ((max - min) / $('#udi_DeBin_Text').val()).toFixed(4);

        dv.transform({
            type: 'map',
            callback(row) {
                var k_th;
                k_th = Math.ceil((row[dim] - min) / k);
                if (!k_th) { k_th = 1 }; //min點: 第0組 => 第一組
                if (k_th != 1) { row['udiBin_' + dim] = (min + k * (k_th - 1)) + '~' + (min + k * k_th); }
                else { row['udiBin_' + dim] = (min - 0.1 + k * (k_th - 1)) + '~' + (min + k * k_th); }
                return row;
            }
        });

        dv.transform({
            type: 'sort-by',
            fields: [dim], // 根据指定的字段集进行排序，与lodash的sortBy行为一致
            order: 'ASC'        // 默认为 ASC，DESC 则为逆序
        });

    }

    function setDvSort(dv) {
        if (!$('#Cbx_udiDvSort').prop('checked')) {
            return dv;
        }

        var fld;
        if ($('#dvSort_selectList').val() == 'first') {
            fld = x;
        } else {
            fld = y;
        }

        console.log('sortR');
        console.log($('input[name="DvSort_Radio"]:checked').val());
        console.log(fld);

        dv.transform({
            type: 'sort-by',
            fields: [fld], // 根据指定的字段集进行排序，与lodash的sortBy行为一致
            order: $('input[name="DvSort_Radio"]:checked').val()   // 默认为 ASC，DESC 则为逆序
        })

        console.log(dv);
    }

    function setSlider(ds, dv, divID, x, y, isActive, chart) {
        if (!$('#Cbx_udiSlider').prop('checked')) {
            return 0;
        }

        $('#' + divID).append('<div id="' + divID + '_slider"></div>');
        var udiId = divID.replace('divUDIchart_', '');

        var slct = $('#udi_slider_selectList').val();
        var ctl_dim;
        if (slct == 'udi_x') {
            ctl_dim = x;
        } else if (slct == 'udi_y') {
            ctl_dim = y;
        } else {
            ctl_dim = slct;
        }

        if (isActive) {
            udiSelf.slider_dv[udiId] = [];
            for (var i = 0; i < dv.rows.length; i++) {
                var obj = udiSelf.slider_dv[udiId][i] = {};
                obj[ctl_dim] = dv.rows[i][ctl_dim];
                obj['sID'] = dv.rows[i]['sID'];
            }
        }

        var lock = true, used = false;
        var startValue, endValue;

        // var slider = new Slider
        chart.interact('slider', {
            container: divID + '_slider',
            width: 'auto',
            height: 35,
            // start: ds.state.start, // 和状态量对应
            // end: ds.state.end,
            xAxis: ctl_dim,
            yAxis: y,
            data: dv,
            backgroundChart: {
                type: chartType[nowDoingChartType]['geom']
                // ,color: 'rgba(0, 0, 0, 0.3)'
            },

            onChange: function onChange(_ref) {
                startValue = _ref.startValue; endValue = _ref.endValue;
                if (!lock) {
                    return 0
                };

                lock = false;

                var a = 0;
                while (used) { console.log('USED!!!'); if (a++ > 10) { console.log('Error!'); break; }; sleep(250); }

                setTimeout(function () {
                    console.log("slider setTimeout run.");
                    lock = true;
                    used = true;
                    var s = startValue, e = endValue;
                    var sldDv = udiSelf.slider_dv[udiId];
                    var sldArrIX = [];

                    if (!isActive) {
                        console.log('Slider is not Active' + divID);
                        for (var index in dv.rows) {
                            if (dv.rows[index][ctl_dim] >= s && dv.rows[index][ctl_dim] <= e) {
                                sldArrIX.push(dv.rows[index].sID - 1);
                            }
                        }

                        ds.setState('filter', sldArrIX);
                        used = false;
                        return 0
                    }

                    for (var index in sldDv) {
                        if (sldDv[index][ctl_dim] >= s && sldDv[index][ctl_dim] <= e) {
                            sldArrIX.push(sldDv[index].sID - 1);
                        }
                        sldArrIX.sort(function (a, b) { return a - b; })
                        //the intersectionOfArrs need the array to be ASR
                    }

                    udiSelf.slider_filter[udiId] = sldArrIX;
                    var gFilt = getUDIFilter(udiId);

                    ds.setState('filter', gFilt);
                    used = false;

                }, 700);
            }
        })
        // };
        // slider.render();

        // return slider;
    }

    function stepSetOpa(ds, geometry, x) {


        if (geometry == 'facet' || geometry == 'area') {
            return 0;
        }


        var core = getCoreDim(nowDoingChartType, x, y, z, c); //ex: ['height',''weight']
        var s = arr2StingConnected(core); // 'height*weight'

        geometry.opacity(s, (a, b, c) => {
            /* Or => make a [geomFilter], geom2Index(), isIndexInArr
                寫起來更漂亮更好懂，但目前來講不會比較快 */

            // x=height a=180,山西
            var hlArry = ds.state.highlight;
            // udiSelf.har = ds.state.highlight;
            var equal = 0;
            if (nowDoingChartType == 14 || nowDoingChartType == 16) { var isBob = true; }

            if (hlArry.length == 0) {
                // console.log(chartType[nowDoingChartType].name);

                if (isBob) {

                    return 0.7;
                }

                return 1;
            }

            for (i = 0; i < hlArry.length; i++) {

                if (a == udiSelf.inputData[hlArry[i]][core[0]]) {
                    if (!b) { if (!c) { equal = 1; } }

                    if (b) {
                        if (b == udiSelf.inputData[hlArry[i]][core[1]]) { if (!c) { equal = 1 }; }

                        if (c) {
                            if (c == udiSelf.inputData[hlArry[i]][core[2]]) { equal = 1; }
                        }
                    }
                }
                if (equal) { return 0.92; }
            }

            /* if core[0]==udiBin_幸福指數 */
            if (core[0].match(/udiBin/g) != null) {
                var tmp_start_end = a;
                var tmp_dimName = core[0].replace('udiBin_', '');
                if (typeof (tmp_start_end) == "string") { tmp_start_end = tmp_start_end.split('~'); }
                console.log(tmp_start_end);
                for (i = 0; i < hlArry.length; i++) {
                    if (tmp_start_end[0] < udiSelf.inputData[hlArry[i]][tmp_dimName] &&
                        tmp_start_end[1] >= udiSelf.inputData[hlArry[i]][tmp_dimName]) {
                        if (!b) { if (!c) { equal = 1; } }

                        if (b) {
                            if (b == udiSelf.inputData[hlArry[i]][core[1]]) { if (!c) { equal = 1 }; }

                            if (c) {
                                if (c == udiSelf.inputData[hlArry[i]][core[2]]) { equal = 1; }
                            }
                        }
                    }
                    if (equal) { return 0.92; }
                }
            }

            if (core[1] && (core[1].match(/udiBin/g) != null)) {
                var tmp_start_end = a;
                var tmp_dimName = core[1].replace('udiBin_', '');
                if (typeof (tmp_start_end) == "string") { tmp_start_end = tmp_start_end.split('~'); }
                for (i = 0; i < hlArry.length; i++) {
                    if (a == udiSelf.inputData[hlArry[i]][core[0]]) {
                        if (!b) { if (!c) { equal = 1; } }

                        if (b) {
                            if (tmp_start_end[0] < udiSelf.inputData[hlArry[i]][tmp_dimName] &&
                                tmp_start_end[1] >= udiSelf.inputData[hlArry[i]][tmp_dimName]) { if (!c) { equal = 1 }; }

                            if (c) {
                                if (c == udiSelf.inputData[hlArry[i]][core[2]]) { equal = 1; }
                            }
                        }
                    }
                    if (equal) { return 0.92; }
                }
            }


            return 0.1;
        })
    }

    function stepFilter(ds, dv) {
        var index = 0;
        dv.transform({
            type: 'filter',
            callback(row) { // 判断某一行是否保留，默认返回true

                if (ds.state.filter.length == 0) { return true; }
                for (i = 0; i < ds.state.filter.length; i++) {
                    if (ds.state.filter[i] == row.sID - 1) {
                        return true;
                    }
                }
                return false;
            }
        });
    }

    function stepGeom(chartD, dv, sta, x, y, z, c, siz, id) {

        var geometry;
        var geom = chartType[id].geom;

        var tone = $('#divUDIhtml #Gtone').val();
        if (c == 'mono') { c = toneMonoArray[tone]; }
        tone = toneArray[tone];
        if (tone == 'G2.Global.colors_pie_16') { tone = G2.Global.colors_pie_16; }
        console.log("tone:" + tone);
        // if (sta == "null") { }
        // else {
        //     y0 = y;
        //     y = sta;
        // }

        /*
            1:PointChart 2:barChart 3:AreaChart 4:pieChart 5:分組柱狀圖 6:鏡面長條圖 7:Rose 8:lines 9:stackBar
        */

        // console.log("stepGeomID:"+id);
        switch (id) {
            case "1":
                geometry = chartD[geom]().position(x + "*" + y)
                    .color(c, tone)
                    .size(8)
                    .shape('circle').tooltip(x + '*' + y);
                break;

            //柱狀圖
            case "2":
                chartD.legend(false);
                geometry = chartD[geom]().position(x + "*" + y).color(c, tone).tooltip(x + '*' + y + "*" + c);
                break;


            case "3":
                chartD.scale({
                    x: {
                        range: [0, 1]
                    }
                });

                chartD.tooltip({
                    crosshairs: {
                        type: 'cross'
                    }
                });
                chartD.area().position(x + "*" + y).opacity(0.2).color(c, tone);
                chartD.line().position(x + "*" + y).opacity(0.8).color(c, tone).size(4).shape('circle').tooltip(x + '*' + y);
                geometry = chartD.point().position(x + "*" + y).color(c, tone).size(5).shape('circle').tooltip(x + '*' + y).style({ stroke: '#fff', lineWidth: 1 });
                break;

            // Pie chart
            case "4":
                geometry = chartD[geom]().position(y).color(x, tone)
                    .label(y, { formatter: (val, item) => { return item.point[x] + ': ' + val; } })
                    .style({ lineWidth: 1, stroke: '#fff' })
                    ;
                break;

            // 分組柱狀圖
            case "5":

                geometry = chartD[geom]().position(x + '*' + y).color(z, tone).adjust([{ type: 'dodge', marginRatio: 1 / 16 }]);
                break;

            // facet長條圖
            case "6":

                geometry = chartD.facet('tree', {
                    fields: [z],
                    line: { stroke: '#c0d0e0' },
                    lineSmooth: true,
                    margin: 30,
                    eachView(view, facet) {
                        console.log(facet);
                        console.log(view);
                        console.log(view[geom]().position(x + '*' + y).color(c, tone).adjust([{ type: 'stack' }]));
                    }
                });
                console.log(geometry);
                geometry = 'facet';
                break;

            // 玫瑰圖
            case "7":
                //             chartD.coord('polar', {
                //     startAngle: Math.PI, // 起始角度
                //     endAngle: Math.PI * (3 / 2) // 结束角度
                //   });
                // chartD.axis(false);'

                // chartD.axis(false);
                geometry = chartD[geom]().position(x + '*' + y)
                    .label(x, { offset: -15 })
                    .color(x, tone)
                    .style({ lineWidth: 1, stroke: '#fff' });
                break;

            // Lines
            case "8":
                geometry = chartD[geom]().position(x + "*" + y).color(c).size(4).shape('circle').tooltip(x + '*' + y + '*' + c);
                chartD.point().position(x + "*" + y).color(c).size(4).shape('circle').style({ stroke: '#fff', lineWidth: 1 });
                break;

            // 堆疊長條圖
            case "9":

                console.log(dv.rows[0][z]);
                geometry = chartD[geom]().position(x + '*' + y).color(z, tone).adjust([{ type: 'stack' }]);
                break;

            //時間事件圖
            case "10":

                dv.transform({
                    type: 'map',
                    callback(row) {
                        row.udiRange = [row[y], row[z]];
                    }
                })
                chartD.scale({
                    'udiRange': {
                        min: 1800,
                        max: 2010
                    }
                })
                chartD.coord().transpose();
                geometry = chartD[geom]().position(x + '*udiRange').color(c, tone);
                break;

            case "11":

                var range = dv.range(y);
                var min = range[0];
                var max = range[1];
                dv.transform({
                    type: 'tag-cloud',
                    fields: [x, y],
                    size: [h, h],
                    font: 'Verdana',
                    padding: 0,
                    timeInterval: 5000, // max execute time
                    rotate: function rotate() {
                        var random = ~~(Math.random() * 4) % 4;
                        if (random == 2) {
                            random = 0;
                        }
                        return random * 90; // 0, 90, 270
                    },
                    fontSize: function fontSize(d) {
                        if (d[y]) {
                            return (d[y] - min) / (max - min) * (h/5 - h/udiSelf.inputData.length) + h/udiSelf.inputData.length+10;
                        }
                        return 0;
                    }
                });

                chartD.source(dv, {
                    x: {
                        nice: false
                    },
                    y: {
                        nice: false
                    }
                });
                chartD.legend(false);
                chartD.axis(false);
                chartD.tooltip({
                    showTitle: false
                });
                chartD.coord().reflect();

                geometry = chartD.point().position('x*y').color(c, tone).shape('cloud').tooltip(y + '*' + c);
                break;

            //直方圖
            case '12':

                dv.transform({
                    type: 'map',
                    callback(row) {
                        row[x] = row[x].split('~');
                        row[x][0] = Number(row[x][0]);
                        row[x][1] = Number(row[x][1]);
                        return row;
                    }
                })
                // chartD.legend(false);
                console.log(dv.rows);
                geometry = chartD.interval().position(x + '*' + y).tooltip(x + '*' + y).color(c, tone)
                    .style({
                        lineWidth: 5,
                        stroke: '#fff'
                    });
                break;

            // 限定角度玫瑰圖
            case '13':
                chartD.coord('polar', {
                    startAngle: Math.PI * 1, // 起始角度
                    endAngle: Math.PI * (3 / 2) // 结束角度
                });
                geometry = chartD.interval().position(x + '*' + y).color(c, tone).label(y, {
                    offset: -15,
                    label: {
                        textAlign: 'center',
                        fill: '#000'
                    }
                }).style({
                    lineWidth: 1,
                    stroke: '#fff'
                });
                break;

            //氣泡圖
            case '14':
                chartD.legend(siz, false); // 该图表默认会生成多个图例，设置不展示 Population 和 Country 两个维度的图例
                geometry = chartD.point().position(x + '*' + y).size(siz, [4, 65])
                    .color(c, tone).shape('circle').tooltip(c + '*' + siz + '*' + x + '*' + y);

                break;

            //色塊圖
            case '15':
                geometry = chartD.polygon().position(x + '*' + z).color(y, tone).label(y, {
                    offset: -2,
                    textStyle: {
                        fill: '#fff',
                        shadowBlur: 2,
                        shadowColor: 'rgba(0, 0, 0, .45)'
                    }
                }).style({
                    lineWidth: 1,
                    stroke: '#fff'
                });
                break;

            //堆疊面積圖
            case '16':
                chartD.tooltip({
                    crosshairs: {
                        type: 'line'
                    }
                });
                geometry = chartD.area().position(x + '*' + y).color(z, tone).adjust([{ type: 'stack' }]);
                chartD.lineStack().position(x + '*' + y).color(z, tone).size(2);
                break;

            default:
                geometry = chartD[geom]().position(x + "*" + y).color(c).size(siz, 35, 5).opacity(0.8).shape('circle').tooltip(x + '*' + y);
        }

        return geometry;
    }

    function stepDataTransfer(chart, dv) {

        var dim = x;
        var gB = [];
        var isAggregate;

        if (sta == 'count' || sta == 'sum' || sta == 'mean') { isAggregate = true; }
        else if (sta == 'percent' || sta == 'proportion') { isAggregate = false; }

        if (chartType[nowDoingChartType].statOnXZ == true) {
            if (!isAggregate) { gB = [x]; dim = z; }
            else if (isAggregate) { gB = [x, z]; }
        } else {
            if (!isAggregate) { gB = []; }
            else if (isAggregate) { gB = [x]; }
        }
        // console.log(dim + gB);

        switch (sta) {
            case "null":
                return dv;
                break;

            case "count":
                dv.transform({
                    type: 'aggregate',
                    fields: [x],
                    operations: ['count'],
                    as: ['count'],
                    groupBy: gB
                });
                break;

            case "percent":
                dv.transform({
                    type: 'percent',
                    field: y,
                    dimension: dim,
                    groupBy: gB,
                    as: 'percent'
                });
                chart.source(dv, {
                    percent: {
                        formatter: val => {
                            val = (val * 100).toFixed(2) + '%';
                            return val;
                        }
                    }
                });
                break;

            case "proportion":
                dv.transform({
                    type: 'proportion',
                    field: 'countingRow',
                    dimension: dim,
                    groupBy: gB,
                    as: 'proportion'
                });
                chart.source(dv, {
                    proportion: {
                        formatter: val => {
                            val = (val * 100).toFixed(2) + '%';
                            return val;
                        }
                    }
                });
                break;

            case "sum":
                dv.transform({
                    type: 'aggregate',
                    fields: [y],
                    operations: ['sum'],
                    as: ['sum'],
                    groupBy: gB
                });
                break;

            case "mean":
                dv.transform({
                    type: 'aggregate',
                    fields: [y],
                    operations: ['mean'],
                    as: ['mean'],
                    groupBy: gB
                });
                break;


            default:
                console.log("Error: Imposible to run here!");
                return dv;

        }
    }

    function getTextAttrs(cfg) {
        return _.assign({}, cfg.style, {
            fillOpacity: cfg.opacity,
            fontSize: cfg.origin._origin.size,
            rotate: cfg.origin._origin.rotate,
            text: cfg.origin._origin.text,
            textAlign: 'center',
            fontFamily: cfg.origin._origin.font,
            fill: cfg.color,
            textBaseline: 'Alphabetic'
        });
    }

    // 给point注册一个词云的shape
    G2.Shape.registerShape('point', 'cloud', {
        drawShape: function drawShape(cfg, container) {
            var attrs = getTextAttrs(cfg);
            return container.addShape('text', {
                attrs: _.assign(attrs, {
                    x: cfg.x,
                    y: cfg.y
                })
            });
        }
    });

    /*  */
    function reviseChart(evt) {
        revising = (evt.target.id).replace("iconRevise", "") //the index of choosenArgument
        popUpMakeCharts();
        divToggle(1);
        loadArgument(revising);
        setSelectList(nowDoingChartType);
        divDetailGraphic_address = makeGraphic('divDetailGraphic');
    }

    function deleteChart(evt) {
        var s = (evt.target.id).replace("iconDelete", "")
        choosenArgument[s]['chart_address'][0].destroy();
        if (choosenArgument[s]['chart_address'][1]) { choosenArgument[s]['chart_address'][1].destroy(); }
        document.getElementById("divUDIchart_" + s).innerHTML = '';
        choosenArgument[s] = null;
    }

    function saveArgument() {
        getSelectList();
        var coor = chartType[nowDoingChartType].coord;

        if (revising == -1) {
            var id = revising = choosenArgument.length;
            $("#divCharts").append("<div id=\"divUDIchart_" + revising + "\" class='divUDIcharts'></div>");
        }
        else {
            if (!$("#divUDIchart_" + revising)[0]) { $("#divCharts").append("<div id=\"divUDIchart_" + revising + "\" class='divUDIcharts'></div>"); }
            // 如果div不存在，新增 (For udiSelf.laodArgument)
            var id = revising;
        }

        var obj = {
            'Basic_arg': {
                'x': x, 'y': y, 'z': z, 'color': c, 'h': h, 'Radius': radi, 'IRadius': iradi, 'size': siz, 'yy': sta, 'coor': coor,
                'chartID': nowDoingChartType
            },
            'Detail_checkBoxs': {}, 'Detail_inputs': {}, 'udiChartID': id
        }

        for (var i in Detail_checkBoxs_id) {
            obj['Detail_checkBoxs'][Detail_checkBoxs_id[i]] = $('#' + Detail_checkBoxs_id[i]).prop('checked');
        }
        for (var i in Detail_inputs_id) {
            obj['Detail_inputs'][Detail_inputs_id[i]] = $('#' + Detail_inputs_id[i]).val();
        }
        var title = getTitle(id);

        obj['chart_address'] = makeGraphic('divUDIchart_' + id, id);
        obj['dv_x'] = x; obj['dv_y'] = y; obj['dv_z'] = z; obj['title'] = title;

        choosenArgument[revising] = obj;

        $('#divUDIchart_' + id).append(title + "       "
            + "<img src='"+UDI_folder_address+"/icons/icon_editG.svg' id=iconRevise" + id + " class='icon_revise udiIcon' title='修改圖表'  width=25px height=25px>"
            + "<img src='"+UDI_folder_address+"/icons/icon_cancel.svg' id=iconDelete" + id + " class='icon_delete udiIcon' title='刪除圖表'  width=25px height=25px>"
        );

        var s = udiSelf.inputDiv;
        $('#' + s + ' #iconRevise' + id).click(function (event) { reviseChart(event); });
        $('#' + s + ' #iconDelete' + id).click(function (event) { deleteChart(event); });

        revising = -1;
        divToggle(0);
        setSelectList(0);
        nowDoingChartType = 0;
        popDownMakeCharts();
    }

    function loadArgument(revising) {
        /* pass selected */
        // document.getElementById("Gx").value = choosenArgument[revising][x]
        for (i = 0; i < makeChartSelections.length; i++) {
            var arg = makeChartSelections[i].replace("G", "");
            document.getElementById(makeChartSelections[i]).value = choosenArgument[revising]['Basic_arg'][arg];
        }
        for (var i in Detail_checkBoxs_id) {
            $('#' + Detail_checkBoxs_id[i]).prop('checked', choosenArgument[revising]['Detail_checkBoxs'][Detail_checkBoxs_id[i]]);
        }
        for (var i in Detail_inputs_id) {
            $('#' + Detail_inputs_id[i]).val(choosenArgument[revising]['Detail_inputs'][Detail_inputs_id[i]]);
        }
        nowDoingChartType = choosenArgument[revising]['Basic_arg']["chartID"];
    }

    function loadArgumentVar(revising) {
        var obj = choosenArgument[revising]['Basic_arg'];
        x = obj.x;
        y = obj.y;
        z = obj.z;
        c = obj.c;
        h = obj.h;
        radi = obj.Radius;
        iradi = obj.IRadius;
        siz == obj.size;
        sta = obj.yy;
        coor = obj.coor;
        nowDoingChartType == obj.chartID;
    }

    function getTitle(udiId) {

        var str = $('#udi_title_Text').val();
        if (str == 'Chart_Title_') {
            return str + udiId;
        }

        return str;
    }

    function getCoreDim(chartID, x, y, z, c) {
        var core = chartType[chartID].coreDim.slice(); //shallow copy

        // if sta is used,y can't be send as condition  i.e. count, proportion, ...
        if (sta != 'null') {
            let index = core.indexOf('y');
            if (index >= 0) { core.splice(index, 1); }
        }
        for (i = 0; i < core.length; i++) {
            if (core[i] == 'x') { core[i] = x; }
            if (core[i] == 'y') { core[i] = y; }
            if (core[i] == 'z') { core[i] = z; }
            if (core[i] == 'c') { core[i] = c; }
        }
        return core;
        // ex: [x,z] 
    }

    /*  ['height','weight'] => 'height*weight'  */
    function arr2StingConnected(arr) {
        var s = arr[0];

        for (let i = 1; i < arr.length; i++) {
            s = s + '*' + arr[i];
        }
        return s;
    }


    function setMyCondition(ev, divID, arrOfIndex) {

        var value = {};
        value.sID = [];

        var cFI = arrOfIndex; //chart filter by index

        for (let i = 0; i < cFI.length; i++) {
            value.sID.push(cFI[i] + 1);
        }

        var condition = [{ source: divID, val: value, type: 'equal' }];
        return condition;
    }

    /* geom => Filter */
    function setChartFilter(ev, udiId) {
        var obj = choosenArgument[udiId]['Basic_arg'];
        var core = getCoreDim(obj.chartID, choosenArgument[udiId].dv_x, choosenArgument[udiId].dv_y, choosenArgument[udiId].dv_z, obj.color);
        var geomFilter = {};

        for (let i = 0; i < core.length; i++) {
            if (chartType[obj.chartID].geom == 'line' || chartType[obj.chartID].geom == 'area') {
                geomFilter[core[i]] = ev.data[0]._origin[core[i]];
            } else {
                geomFilter[core[i]] = ev.data._origin[core[i]];
            }
        }  //geomFilter={ 地名:山西, 高度:180 }


        /* set udiFilter[revising]= [  geomFilters ]
            如果geomFilter已在udiFilter[revising]內則刪除，不在則push
        */

        var arr1 = udiSelf.udiFilter[udiId];
        if (arr1 == undefined) { arr1 = []; }

        arr1 = renew_chartFilter_by_geomFilter(arr1, geomFilter);

        udiSelf.udiFilterTTIX[udiId] = geomFilt2IndexType(arr1);
        udiSelf.udiFilter[udiId] = arr1;


        /*
            this.udiFilter={
                revising={
                    [ { Att1:val, Att2:val },geomFilter, ]
                },
                chartFilter
            }

               udiFilterTTIX[id]=[ 2,5,10 ]  

               udiFilterIX={
                   [2,5],
                   [10]
               }
        */


    }

    /* get click_geom by ev, set udiHighlight properly */
    function setUdiHighlight(ev, udiId) {
        var obj = choosenArgument[udiId]['Basic_arg'];
        var core = getCoreDim(obj.chartID, choosenArgument[udiId].dv_x, choosenArgument[udiId].dv_y, choosenArgument[udiId].dv_z, obj.color);

        var geomFilter = {};

        for (let i = 0; i < core.length; i++) {
            if (chartType[obj.chartID].geom == 'line' || chartType[obj.chartID].geom == 'area') {
                geomFilter[core[i]] = ev.data[0]._origin[core[i]];
                console.log('data[0]_origin');
                console.log(core[i]);
            } else {
                geomFilter[core[i]] = ev.data._origin[core[i]];
            }
        }  //geomFilter={ 地名:山西, 高度:180 }
        console.log(geomFilter);


        /* set udiHighlight=[source,[index],[geomFilt]] */
        if ('divUDIchart_' + udiId != udiSelf.udiHighlight[0]) {
            udiSelf.udiHighlight[0] == udiId;
            udiSelf.udiHighlight[1] = udiSelf.udiHighlight[2] = [];
        }
        var arr1 = udiSelf.udiHighlight[2];

        arr1 = renew_chartFilter_by_geomFilter(arr1, geomFilter);

        var arr2 = geomFilt2IndexType(arr1);

        udiSelf.udiHighlight = ['divUDIchart_' + udiId, arr2, arr1];
    }

    /* geomFilter 加入/移出 chartFilter */
    function renew_chartFilter_by_geomFilter(chartFilter, geomFilter) {

        var inCF = false;

        for (let i = 0; i < chartFilter.length; i++) {
            // for each geomFilter in chartFilter
            var c = 0;
            for (var key in chartFilter[i]) {
                if (chartFilter[i][key].toString() == geomFilter[key].toString()) {
                    c++;
                }
            } if (c == Object.keys(chartFilter[i]).length) {
                chartFilter.splice(i, 1);
                inCF = true;
                break;
            }
        }

        if (!inCF) {
            chartFilter.push(geomFilter);
        }

        return chartFilter;
    }

    /* [1,4,9] [2,4,6] => [4] */
    function interSectionOfArr(arr1, arr2) {
        if (arr1 == arr2 == undefined) { return []; }
        if (!arr1 || arr1.length == 0) { return arr2 || []; }
        if (!arr2 || arr2.length == 0) { return arr1; }
        var arr3 = [];
        var k = 0;
        var j = 0;
        while (true) {
            if (arr1[k] > arr2[j]) { j++ }
            else if (arr1[k] < arr2[j]) { k++ }
            else if (arr1[k] == arr2[j]) {
                arr3.push(arr1[k]);
                j++; k++;
            }

            if (k == arr1.length || j == arr2.length) { break; }
        }

        return arr3;
    }

    function unionOfArr(arr1, arr2) {
        if (arr1 == arr2 == undefined) { return []; }
        if (!arr1 || arr1.length == 0) { return arr2 || []; }
        if (!arr2 || arr2.length == 0) { return arr1; }

        var arr3 = [];
        var k = 0;
        var j = 0;
        while (true) {
            if (arr1[k] > arr2[j]) { arr3.push(arr2[j]); j++ }
            else if (arr1[k] < arr2[j]) { arr3.push(arr1[k]); k++ }
            else if (arr1[k] == arr2[j]) { arr3.push(arr1[k]); j++; k++ }

            if (arr1.length == k) {
                while (j < arr2.length) {
                    arr3.push(arr2[j]);
                    j++;
                }
                break;
            }

            if (arr2.length == j) {
                while (k < arr1.length) {
                    arr3.push(arr1[k]);
                    k++;
                }
                break;
            }
        }
        return arr3;
    }


    function filtUdi(udiId) {
        var result_index = [];
        var filter_index = Object.assign({}, udiSelf.udiFilterTTIX);

        delete filter_index[udiId];

        for (var k in filter_index) {
            result_index = filter_index[k]; break;
        }

        for (var k in filter_index) {
            result_index = interSectionOfArr(result_index, filter_index[k]);
        }
        return result_index;

    };


    /* att=['geomFilt','geoFilt'] => output = [index,index] */
    function geomFilt2IndexType(arr1) {
        var arr2 = [];
        for (let i = 0; i < udiSelf.inputData.length; i++) {
            var pass = false;
            for (let j = 0; j < arr1.length; j++) {

                var intersection = true;
                for (var key in arr1[j]) {

                    if (key.match(/udiBin/g) != null) {

                        var tmp_dimName = key.replace('udiBin_', '');
                        var start_end_arr = arr1[j][key];

                        if (typeof (arr1[j][key]) == 'string') {
                            start_end_arr = arr1[j][key].split('~');
                        }
                        if (!(udiSelf.inputData[i][tmp_dimName] >= start_end_arr[0] &&
                            udiSelf.inputData[i][tmp_dimName] < start_end_arr[1])) { intersection = false; break; }
                        continue;
                    }

                    if (udiSelf.inputData[i][key] != arr1[j][key]) { intersection = false; break; }
                }

                if (intersection) {
                    pass = true; break;
                }

            }
            if (pass) { arr2.push(i); }
        }
        return arr2;
    }

    /* iput,output: json */
    function convertStr2Num(data) {

        for (let i = 0; i < data.length; i++) {

            for (var key in data[i]) {

                if (data[i][key].length == 0) {
                    if (typeof (data[0][key]) == "number") {
                        data[i][key] = 0; //設置為字串不會顯示，但統計處理會有問題
                        // data[i][key]='';
                    } else {
                        data[i][key] = 'Empty cell';
                    }
                }

                var a = Number(data[i][key])
                if (!(a != a)) {
                    data[i][key] = a;
                }
            }
            data[i]['sID'] = i + 1;
        }
        return data;
    }

    /* [{月:A, Jap:7},{月:B,Jap:7}] => {月:{ A:1, B:1 }, Jap:{ 7:2 }} */
    function countEachContent(json) {
        var obj = {};
        for (var key in json[0]) {
            obj[key] = {};
        }
        for (let i = 0; i < json.length; i++) {

            for (var key in json[i]) {
                if (obj[key][json[i][key]] == undefined) { obj[key][json[i][key]] = 1; }
                else { obj[key][json[i][key]]++; }
            }
        }
        return obj;
    }

    function sleep(ms) {
        var d = new Date();
        var d2 = null;
        do { d2 = new Date(); }
        while (d2 - d < ms);
    }

    var filterDisplay = function () {

        $(document).on("data_filter", function (event, input) {

            var s = "圖組篩選狀態：";

            for (var key in udiSelf.udiFilter) {
                var str_content = '';
                var title = choosenArgument[key].title;
                var attr = Object.keys(udiSelf.udiFilter[key][0])[0];

                for (var i in udiSelf.udiFilter[key]) {
                    str_content += udiSelf.udiFilter[key][i][attr];
                    str_content += ',';
                }
                s += title + ":" + attr + "-" + str_content + "; ";
            }

            if(smFiltIX.length>0){
                s+= smFilt+":";
                for (var key in smFilt[1]){
                    s+=key+"-"
                    for(var i in smFilt[1].key){
                        s+=smFilt[1].key[i]+','
                    }  
                }
            }

            if (s == "") {
                $("#udiFilterDisplayBox").hide("normal");
            } else {
                $("#udiFilterDisplayBox").show("normal");
                $("#udiFilterDisplayBox").html(s);
            }

            if (!state) {
                if (udiSelf.udiHighlight[2].length == 0) {
                    $("#udiHLDisplayBox").hide("normal");
                    return 0;
                }

                s = "圖組強調狀態：";
                var highlightSplit = udiSelf.udiHighlight[0].split('_');
                var str_content = '';
                var title;
                if (highlightSplit[0] != 'divUDIchart') {
                    title = udiSelf.udiHighlight[0];
                } else {
                    choosenArgument[Number(highlightSplit[1])].title;
                }

                var attr = Object.keys(udiSelf.udiHighlight[2][0])[0];

                for (var i in udiSelf.udiHighlight[2]) {
                    str_content += udiSelf.udiHighlight[2][i][attr];
                    str_content += ',';
                }
                s += title + ":" + attr + "-" + str_content + "; ";

                $("#udiHLDisplayBox").show("normal");
                $("#udiHLDisplayBox").html(s);


            }

        });
    }

}


