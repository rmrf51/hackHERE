function getPlaces(jj, arr) {
    tmpArr = [];
    tmpArr[0] = arr.concat(arr[0]);

    var poly = turf.polygon(tmpArr);

    parsed = parseJSONForPlaces(jj, arr);
    totalJSON = getDataFromAPI(parsed);
    var n = 0;
    categs = [];
    if(jj["food"] == 'yes') {
        categs[n] = "food";//categs + food
        n++;
    }
    if(jj["social_space"] == 'yes') {
        categs[n] = "social_space";//categs + soc_spaces
        n++;
    }
    if(jj["landmark"] == 'yes') {
        categs[n] = "landmark";//categs + landmarks
        n++;
    }
    if(jj['wc'] == 'yes') {
        categs[n] = "wc";//categs + wc
        n++;
    }

    var m = totalJSON.length;

    if(jj['transport'] == 'yes') {
        m--;
        categs[n] = "transport";
    }

    totalArr = [];

    var k = 0;
    for(var i = 0; i < m; i++) {
        for(var j = 0; j < totalJSON[i]['results']['items'].length; j++){
            print(totalJSON[i]['results']['items'][j]['category']['title']);
            if(turf.booleanPointInPolygon(turf.point(totalJSON[i]['results']['items'][j]['position']), poly)){
                totalArr[k] = [totalJSON[i]['results']['items'][j]['category']['title'], totalJSON[i]['results']['items'][j]['position'], totalJSON[i]['results']['items'][j]['title'], categs[i]];
                k++;
            }
        }
    }

    if(m < totalJSON.length){
        //вхуяриваем каждую тоталджсон, в котором есть метро.
        for(var i = 0; i < totalJSON[m]['results']['items'].length; i++){
            var flag = false;
            str1 = totalJSON[m]['results']['items'][i]['category']['title'];
            str2 = totalJSON[m]['results']['items'][i]['position'];
            str3 = totalJSON[m]['results']['items'][i]['title'];//title
            str4 = totalJSON[m]['results']['items'][i]['alternativeNames'];
            if(typeof(str4) != 'undefined'){
                // console.log(str4[0]['name']);
                // console.log(typeof(str4[0]['name']));
                for(var j = 0; j < str4.length; j++){
                    if(str4[j]['name'].indexOf("Метро") != -1){
                        flag = true;
                        break;
                    }
                }
            }
            if(flag || str3.indexOf("Метро") != -1){
                if(turf.booleanPointInPolygon(turf.point(totalJSON[m]['results']['items'][i]['position']), poly)){
                    totalArr[k] = [str1, str2, str3, categs[m]];
                    print(totalArr[k]);
                    k++;
                }
            }
            // title and alternativeNames
        }
    }
    finallyTotalArray = [];
    finallyTotalArray[0] = PutPoints(totalArr)
    finallyTotalArray[1] = totalArr;
    console.log(finallyTotalArray);
    return finallyTotalArray;
}

function parseJSONForPlaces(JSON, arr) {
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minX = Infinity;
    var minY = Infinity;
    for(var i = 0; i < arr.length; i++) {
        if(arr[i][0] > maxX)
            maxX = arr[i][0];
        if(arr[i][0] < minX)
            minX = arr[i][0];
        if(arr[i][1] > maxY)
            maxY = arr[i][1];
        if(arr[i][1] < minY)
            minY = arr[i][1]; 
    }
    var categs = [];
    var n = 0;
    if(JSON["food"] == 'yes') {
        categs[n] = "eat-drink";//categs + food
        n++;
    }
    if(JSON["social_space"] == 'yes') {
        categs[n] = "going-out, leisure-outdoor, fair-convention-facility, recreation";//categs + soc_spaces
        n++;
    }
    if(JSON["landmark"] == 'yes') {
        categs[n] = "sights-museums";//categs + landmarks
        n++;
    }
    if(JSON['wc'] == 'yes') {
        categs[n] = "toilet-rest-area";//categs + wc
        n++;
    }
    if(JSON['transport'] == 'yes') {
        categs[n] = "public-transport";
        n++;
    }

    return [].concat(minY, minX, maxY, maxX, categs);
}

function getDataFromAPI() {
    var size = 10;
    totalJSON = [];
    for (var i = 0; i < arguments[0].length - 4; i++){
        var categs = arguments[0][4 + i];    
        url = "https://places.cit.api.here.com/places/v1/discover/explore?in=" + arguments[0][0] + "%2C" + arguments[0][1] + "%2C" + arguments[0][2] + "%2C" + arguments[0][3] + "&cat=" + categs + "&size=" + size + "&X-Mobility-Mode=walk&Accept-Language=ru-RU%2Cru%3Bq%3D0.9%2Cen-US%3Bq%3D0.8%2Cen%3Bq%3D0.7&app_id=PK6gxwmqZcfDtdgNFtOx&app_code=fsC4cFICJenIdqs8hlykxA"
        totalJSON[i] = JSON.parse(httpGet(url));
        print(url + '<br><br>');
    }

    //totalJSON[totalJSON.length] = 


    return totalJSON;
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}










function PutPoints(arr){

        const routesCount = Math.min(6, arr.length);    
    
        const pointsCount = 5;
    
        var routeArr = [];

        for(var i = 0; i < routesCount; i++){
            combArr = [];
            tmpElement = [];
            rndNums = generateNRandomNumbers(Math.min(pointsCount, arr.length), 0, arr.length - 1);
            for(var j = 0; j < rndNums.length; j++){
                tmpElement = tmpElement.concat(arr[rndNums[j]][1]);
                combArr[j] = arr[rndNums[j]];
            }
            currLeg = JSON.parse(httpGet(CreateURL(tmpElement)))['response']['route'][0]['leg'];
            //console.log(currLeg);

            routeArr[i] = [];
            tmpArr = [];
            for(var j = 0; j < currLeg.length; j++){
                tmpArr[tmpArr.length] = currLeg[j]['start']['mappedPosition'];
                currMan = currLeg[j]['maneuver'];
                for(var k = 0; k < currMan.length; k++){
                    tmpArr[tmpArr.length] = currMan[k]['position'];
                }
                tmpArr[tmpArr.length] = currLeg[j]['end']['mappedPosition'];
            }
            routeArr[i] = [tmpArr, combArr];
        }
        
        return routeArr;
        //console.log(routeArr);
        
    }
    
    function generateNRandomNumbers(n, min, max){
        var arr = []
        while(arr.length < n){
            var r = getRandomNumber(min, max);
            if(arr.indexOf(r) === -1) arr.push(r);
        }
        return arr;
    }
    
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }
    
    function CreateURL(arr){
        url = "https://route.api.here.com/routing/7.2/calculateroute.json?app_code=fsC4cFICJenIdqs8hlykxA&app_id=PK6gxwmqZcfDtdgNFtOx&mode=fastest;pedestrian";
        for(var i = 0; i < arr.length / 2; i++){
            url += "&waypoint" + i + "=" + arr[2 * i] + "," + arr[2 * i + 1];
        }
        return url;
    }

















/*function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);  
}
var totalJSON = [];
async function httpGet(url) {
    var tmp = [];
 
    const res = await fetch(url);
    const data = await res.json();
    console.log(data['results']['items']);
    totalJSON[totalJSON.length] = data;
}
function httpGet(url) {
    var tmp = [];
    fetch(url).then(res => {
        res.json().then(data => {
            totalJSON[totalJSON.length] = data;
        })
    }) 
}*/