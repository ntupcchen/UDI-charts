function dynamicLoadJs(url, integrity,callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    if(integrity){
        // script.integrity = integrity;
        // script.crossorigin="anonymous"
    }
    if(typeof(callback)=='function'){
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete"){
                callback();
                script.onload = script.onreadystatechange = null;
            }
        };
    }
    head.appendChild(script);
}

function dynamicLoadCss(url) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.type='text/css';
    link.rel = 'stylesheet';
    link.href = url;
    head.appendChild(link);
}

var UDIlocation="UDI" //folder UDI in html file location
dynamicLoadJs(UDIlocation+"/UDICharts.js")

dynamicLoadJs(UDIlocation+"/lib/jquery-bonsai-master/jquery.qubit.js");
dynamicLoadJs(UDIlocation+"/lib/jquery-bonsai-master/jquery.bonsai.js");
dynamicLoadJs(UDIlocation+"/lib/popper.min.js","sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49")
dynamicLoadJs(UDIlocation+"/lib/bootstrap/4.1.3/js/bootstrap.min.js","sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy")


dynamicLoadCss(UDIlocation+"/lib/bootstrap/3.3.4/css/bootstrap.min.css");
dynamicLoadCss(UDIlocation+"/lib/jquery-bonsai-master/jquery.bonsai.css");
dynamicLoadCss(UDIlocation+"/UDIstyle.css");


$.getScript(UDIlocation+'/lib/g2/3.4.10/dist/g2.min.js',function()
{   
    dynamicLoadJs(UDIlocation+"/lib/g2/data-set/0.8.7/data-set.min.js")
    udi = new UDICharts();
    udi.init(inputForUDI, 'UDI');
});


var inputForUDI;
var udi;


function ArrOfArr2Json(leo) {
    var json = [];
    for (i = 2; i < leo.length; i++) {
        var item = {};
        for (j = 0; j < leo[1].length; j++) {
            item[leo[1][j]] = leo[i][j];
            item.sID = i - 1;
        }
        json.push(item);
    }
    return json;
}



$(document).on("data_start", function (event) {
    udi.SMused(true);
    inputForUDI = ArrOfArr2Json(share_model.data.data);
    console.log('inputForUDI:');
    console.log(inputForUDI);
    udi.inputChanged(inputForUDI);
});

