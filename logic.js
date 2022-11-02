var markers = [];
function loadCss() {

    $('<link>')
        .appendTo('head')
        .attr({
            type: 'text/css',
            rel: 'stylesheet',
            href: '/css/style.css'
        });

}
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}



function loadHtml(callback) {
    var data;
    $.getJSON("/carrier-design.json" ,data,
        function (data, textStatus, jqXHR) {
            // console.log(b64_to_utf8(data.html));
            var decodedHtml = b64_to_utf8(data.html);
            $('.carrier-widget').html(decodedHtml);

            callback();

        }
    );


}



function loadCarriers(c1, c2, c3) {
    var data;
    $.getJSON("/carriers.json", data,
        function (data, textStatus, jqXHR) {

            CARRIERS = data;
            console.log(CARRIERS);
            c1();
            c2();
            c3();

        }
    );

}

function renderList() {

    var html = '';
    console.log(CARRIERS);


    CARRIERS.forEach(element => {


        html += `<div class="relay-container" id=${element.Identifier} data-name="${element.Name}" data-longitude="${element.Longitude}" data-latitude="${element.latitude}"">
        <p style="font-weight: bold;">${element.Name}</p>
        <p>${element.Address} ${element.Zipcode}</p>
        <p>${element.City}</p>
        </div>`;

    });

    $('.relay-list').html(html);

}

function popup(element) {

    var tableHtml = "";
    if (element.WorkingHours != null) {
        element.WorkingHours[0].timing.forEach((day) => {
            if (day.isClosed == 0) {
                if (day.hours.size == 1) {
                    tableHtml += `<tr> <td class="text-nowrap"> ${day.day} </td> <td class="text-nowrap">${day.hours[0].open}</td> <td class="text-nowrap">${day.hours[0].close}</td> </tr>`;
                } else {
                    tableHtml += `<tr> <td class="text-nowrap"> ${day.day} </td> <td class="text-nowrap">${day.hours[0].open} &#8209; ${day.hours[0].close}</td> <td class="text-nowrap">${day.hours[1].open} &#8209; ${day.hours[1].close} </td> </tr>`;
                }
            } else {
                tableHtml += `<tr> <td class="text-nowrap"> ${day.day} </td> <td style="text-align:center;"> - </td> <td style="text-align:center;"> - </td> </tr>`;
            }
        });
    } else {
        tableHtml += "Pas d'informations disponible";
    }
    var popupContent = `<h4>${element.Name}</h4>
    <p> ${element.City} ${element.Zipcode} </p>
    <p>${element.Address}</p>
    <a href="${element.MapLocation}" target="_blank" style="margin-bottom:2px;">Relay Location</a>

    <table>
    ${tableHtml}
    </table>
    `;
    return popupContent;
}


function renderListToMap() {

    // console.log(typeof map);
    if (typeof map !== 'undefined') {


        CARRIERS.forEach(element => {

            var marker = L.marker([element.latitude, element.Longitude]).addTo(map);
            //attach extra param to marker
            marker.id = element.Identifier;
            marker.bindPopup(popup(element));
            //add event to markers
            marker.on('click', function (e) {

                var coordinates = e.latlng;

                // map.panTo(new L.LatLng(coordinates.lat, coordinates.lng));
                handleClickMarker($("#" + this.id))

                document
                    .getElementById(marker.id)
                    .scrollIntoView({ behavior: "smooth" });



            });
            markers.push(marker);


        })
        // map.panTo(new L.LatLng(CARRIERS[0].latitude, CARRIERS[0].Longitude));

        clearInterval(myInterval);


    }


}


var myInterval = setInterval(renderListToMap, 500)


function attachEvent() {
    $('.relay-container').on('click', function () {

        var element = $(this)[0];
        var relayName = element.dataset.name;
        $('#selected-relay').text(relayName ?? "");
        $('#show-carrier-button').text('SELECTED RELAY POINT : ' + relayName.toUpperCase());
    });
}

function showDialog() {
    const favDialog = document.getElementById('dialog');
    favDialog.showModal();
}

function handleCloseButton() {
    const favDialog = document.getElementById('dialog');

    $('#close-button,.close').on('click', function () {
        favDialog.close();
    });
}
//selection section javascript
var lastSelected;


loadCss();

loadHtml(loadEvents);


function loadEvents() {


    // renderList();
    loadCarriers(renderList, handleClickRelay, renderListToMap);
    loadMap();

    handleCloseButton();
}


function handleClickMarker(element) {
    if (typeof lastSelected !== 'undefined') {
        lastSelected.removeClass('selected');
    }
    lastSelected = element;
    console.log(lastSelected);
    element.addClass('selected');
}
function markerFunction(id) {
    for (var i in markers) {
        var markerID = markers[i].id;
        if (markerID == id) {
            markers[i].openPopup();
        };
    }
}

function handleClickRelay() {
    $('.relay-container').on('click', function (e) {
        if (typeof lastSelected !== 'undefined') {
            lastSelected.removeClass('selected');
        }
        lastSelected = $(this);
        console.log(lastSelected);
        $(this).addClass('selected');
        markerFunction(lastSelected[0].id);

        // map.panTo(new L.LatLng(lastSelected[0].dataset.latitude, lastSelected[0].dataset.longitude),
        //     { 'animate': true });
    });
}

function resetCarrier() {
    // lastSelected=null;
    console.log(lastSelected);
    lastSelected.removeClass('selected');
}



function loadMap() {

    map = L.map('map').setView([33.8869, 9.5375], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on('click', function () {
        resetCarrier();
    })
    map.on('popupopen', function (e) {
        // alert('www');
        var px = map.project(e.target._popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= e.target._popup._container.clientHeight / 2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
        //    setInterval( function() {map.panTo(map.unproject(px),{animate: true})},2000) // pan to new center
        map.panTo(map.unproject(px), { animate: true });

    });

    setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
    }, 3000);
};



