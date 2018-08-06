var cores = ["rgb(0,0,0)","rgb(68,68,68)","rgb(102,102,102)","rgb(153,153,153)","rgb(204,204,204)","rgb(238,238,238)","rgb(243,243,243)","rgb(255,255,255)","rgb(255,0,0)","#rgb(255,153,0)","rgb(255,255,0)","rgb(0,255,0)","rgb(0,255,255)","rgb(0,0,255)","rgb(153,0,255)","rgb(255,0,255)","rgb(244,204,204)","rgb(252,229,205)","rgb(255,242,204)","rgb(217,234,211)","rgb(208,224,227)","rgb(207,226,243)","rgb(217,210,233)","rgb(234,209,220)","rgb(234,153,153)","rgb(249,203,156)","rgb(255,229,153)","rgb(182,215,168)","rgb(162,196,201)","rgb(159,197,232)","rgb(180,167,214)","rgb(213,166,189)","rgb(224,102,102)","rgb(246,178,107)","rgb(255,217,102)","rgb(147,196,125)","rgb(118,165,175)","rgb(111,168,220)","rgb(142,124,195)","rgb(194,123,160)","rgb(204,0,0)","rgb(230,145,56)","rgb(241,194,50)","rgb(106,168,79)","rgb(69,129,142)","rgb(61,133,198)","rgb(103,78,167)","rgb(166,77,121)","rgb(153,0,0)","rgb(180,95,6)","rgb(191,144,0)","rgb(56,118,29)","rgb(19,79,92)","rgb(11,83,148)","rgb(53,28,117)","rgb(116,27,71)","rgb(102,0,0)","rgb(120,63,4)","rgb(127,96,0)","rgb(39,78,19)","rgb(12,52,61)","rgb(7,55,99)","rgb(32,18,77)","rgb(76,17,48)"];

var visualizar = document.getElementById('visualizar');
var escolhas = document.getElementById('escolhas');
var escolhasfundo = document.getElementById('escolhasfundo');
var overlay = document.getElementById('coloroverlay');
var cor;
var previa = document.getElementById('previa');
var id = 0;
var valorpacidade = 0;
var cor_opacidade = 0;
var res = "transparent";


cores.forEach(function(cor) {
    var button = document.createElement('button');
    button.value = cor;
    button.type = 'button';
    button.style.backgroundColor = cor;
    button.setAttribute("id", "cor" + id);
    id++;
    button.addEventListener('click', handler(button));
    escolhas.appendChild(button);
});

cores.forEach(function(cor) {
    var button = document.createElement('button');
    button.value = cor;
    button.type = 'button';
    button.style.backgroundColor = cor;
    button.setAttribute("id","cor" + id);
    id++;
    button.addEventListener('click', handlerbackground(button));
    escolhasfundo.appendChild(button);
});

cores.forEach(function(cor) {
    var button = document.createElement('button');
    button.value = cor;
    button.type = 'button';
    button.style.backgroundColor = cor;
    button.setAttribute("id","cor" + id);
    id++;
    button.addEventListener('click', handleroverlaycolor(button));
    overlay.appendChild(button);
});


function handler(el) {
    return function() {
        cor = el.value;
        idfonte = el.id;    
       localStorage.setItem("fonte", cor);
        localStorage.setItem("idfonte", idfonte);
         $("#removercores").val('0');
        $('#previa').css('color', cor);
        $('#previa_overlay').css('color', cor);
        
    }
}



function handlerbackground(el) {
    return function() {
        cor = el.value;
        idfundo = el.id;
        localStorage.setItem("fundo", cor);
        localStorage.setItem("idfundo", idfundo);
         $("#removercores").val('0');
        $('#previa').css('background-color', cor);
        $('#previa_overlay').css('background-color', cor);
    }
}

function handleroverlaycolor(el) {
    return function() {
        on();
        cor = el.value;
        $valoropacidade = $("#opacity_input");
        valorpacidade = $valoropacidade.val();
        cor_opacidade = cor.substr(0,(cor.length - 1))
        res = cor_opacidade.concat("," + valorpacidade + ")");
        $('#overlay_p').css('background-color', res);
    }
}

$("#opacity_input").change(function(){
         
        $valoropacidade = $("#opacity_input");
        valorpacidade = $valoropacidade.val();
        res = cor_opacidade.concat("," + valorpacidade + ")");
        $('#overlay_p').css('background-color', res);
      });

$("#removeroverlay").on('click', function(){
    res = "transparent";
    $('#overlay').css('background-color', res); 
    var $select = $("select[name=optionoverlay]");
    var $firstOption = $select.find("option:first-child");
    $select.val($firstOption.val());
    off();

    });

$("#buttSave").on('click', function(){
        $('#overlay').css('background-color', res);
    });

function on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("overlay_p").style.display = "block";
}

function off() {
    $('#overlay_p').css('background-color', 'transparent');
    document.getElementById("overlay").style.display = "none";
    document.getElementById("overlay_p").style.display = "none";
}
