var hypolist;

var map = L.map('map', {
    center: [35.66, 139.73],
    zoom: 10
});
var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '地図データ: © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer.addTo(map);

$.getJSON('eq_subdivision_area.geojson', (data) => {
    L.geoJson(data, {
        color: '#aaa'
    }).addTo(map);
});
map.attributionControl.addAttribution('<a href="https://www.data.jma.go.jp/developer/gis.html">気象庁</a>')
map.attributionControl.addAttribution('データ: <a href="https://www.data.jma.go.jp/svd/eqev/data/daily_map/index.html">気象庁 震源リスト</a>を<a href="https://github.com/iku55/hypolistjson">JSONに変換したもの</a>')

var targetDate = [new Date()];
targetDate[0].setHours(targetDate[0].getHours() - 44);
targetDate[0].setMinutes(targetDate[0].getMinutes() - 30);
targetDate[1] = (('0000'+targetDate[0].getFullYear()).slice(-4))+'/'+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+'/'+(('00'+targetDate[0].getDate()).slice(-2));
targetDate[2] = (('0000'+targetDate[0].getFullYear()).slice(-4))+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+(('00'+targetDate[0].getDate()).slice(-2));
document.getElementById('date').innerText = targetDate[1];

var prevDate = () => {
    targetDate[0].setDate(targetDate[0].getDate() - 1);
    targetDate[1] = (('0000'+targetDate[0].getFullYear()).slice(-4))+'/'+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+'/'+(('00'+targetDate[0].getDate()).slice(-2));
    targetDate[2] = (('0000'+targetDate[0].getFullYear()).slice(-4))+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+(('00'+targetDate[0].getDate()).slice(-2));
    draw(targetDate[2]);
    document.getElementById('date').innerText = targetDate[1];
}
var nextDate = () => {
    targetDate[0].setDate(targetDate[0].getDate() + 1);
    targetDate[1] = (('0000'+targetDate[0].getFullYear()).slice(-4))+'/'+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+'/'+(('00'+targetDate[0].getDate()).slice(-2));
    targetDate[2] = (('0000'+targetDate[0].getFullYear()).slice(-4))+(('00'+(targetDate[0].getMonth()+1)).slice(-2))+(('00'+targetDate[0].getDate()).slice(-2));
    draw(targetDate[2]);
    document.getElementById('date').innerText = targetDate[1];
}

// Load JSON
const draw = (date) => {
    console.log('Clearing circles');
    circlesGroup.clearLayers();

    console.log("Loading hypolist...");

    xhr = new XMLHttpRequest;
    xhr.onload = function(){
        if (xhr.status == 200) {
            var res = xhr.responseText;
            if (res.length>0) {
                hypolist = JSON.parse(res);
                console.log("Loaded "+hypolist.length+" hypocenters");
                addHypocenters();
            }
        } else if (xhr.status == 404) {
            alert('データがありません。用意されていない過去データ、まだ震源リストに掲載されていないデータ、またはエラーの可能性があります。')
        }
    };
    xhr.onerror = function(){
        alert("震源リストを読み込み中にエラーが発生しました");
    }
    xhr.open('get', "https://raw.githubusercontent.com/iku55/hypolistjson/main/data/"+date+".json", true);
    xhr.send('');
};
var circlesGroup = L.featureGroup().addTo(map);
var addHypocenters = () => {
    L.svg().addTo(map);
    for (const hypo of hypolist) {
        
        var floatDepth = parseFloat(hypo.depth);
        var depthColor;
        if (floatDepth >= 300) depthColor = '#00d';
        else if (floatDepth >= 100) depthColor = '#da0';
        else if (floatDepth >= 30) depthColor = '#dd4';
        else if (floatDepth >= 0) depthColor = '#d00';
        else depthColor = '#ddd';

        if (hypo.magnitude == null) {
            var c = L.circle([hypo.latitude, hypo.longitude], {radius: 500, color: depthColor})
            .bindPopup('<span class="hyponame">'+hypo.name+'</span><br>M<span class="hypomagnitude">'+hypo.magnitude+'</span><br>深さ<span class="hypodepth">'+hypo.depth+'</span>km<br>'+new Date(hypo.time).toLocaleString());
            circlesGroup.addLayer(c);
        } else {
            var floatM = parseFloat(hypo.magnitude);
            if (floatM <= 0) {
                var c = L.circle([hypo.latitude, hypo.longitude], {radius: 500, color: depthColor})
                .bindPopup('<span class="hyponame">'+hypo.name+'</span><br>M<span class="hypomagnitude">'+hypo.magnitude+'</span><br>深さ<span class="hypodepth">'+hypo.depth+'</span>km<br>'+new Date(hypo.time).toLocaleString());
                circlesGroup.addLayer(c);
            } else {
                console.log(floatM);
                console.log(parseInt(floatM * 5000));
                var c = L.circle([hypo.latitude, hypo.longitude], {radius: parseInt(floatM * 5000), color: depthColor})
                .bindPopup('<span class="hyponame">'+hypo.name+'</span><br>M<span class="hypomagnitude">'+hypo.magnitude+'</span><br>深さ<span class="hypodepth">'+hypo.depth+'</span>km<br>'+new Date(hypo.time).toLocaleString());
                circlesGroup.addLayer(c);
            }
        }
    }
}


draw(targetDate[2]);
