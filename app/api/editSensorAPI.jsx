var axios = require('axios');

const EDIT_SENSOR_URL = 'http://devfour.sence.io/backend/edit-sensor.php';

module.exports = {

    editSensor: function(inputMac, inputRegion, inputLocationLevel, inputLocationID, inputBuilding) {

        var data = {
          MAC: inputMac,
          "geo-region": inputRegion,
          "sensor-location-level": inputLocationLevel,
          "sensor-location-id": inputLocationID,
          "building": inputBuilding
        }

        return $.ajax({
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            },
            url: EDIT_SENSOR_URL,
            data: data,
            success: function(response) {
                console.log("Que pasar?", response);
                // if(response.status != 200) {
                //   throw new Error(response.error);
                // }
            }
        });
    }
}
