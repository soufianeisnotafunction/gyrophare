const config = require('./config/config').config;
const awsIot = require('aws-iot-device-sdk');
const Gyrophare = require('./Gyrophare').Gyrophare;

const thingName = config.THING_NAME;

var thingShadows = awsIot.thingShadow({
    keyPath: config.KEY_PATH,
    certPath: config.CERT_PATH,
    caPath: config.CA_PATH,
    clientId: thingName,
    host: config.THING_ENDPOINT
});

var isSetup = false;

thingShadows.on('connect', function() {
    var gyrophare = new Gyrophare(thingName, thingShadows);

    console.log('Connect');
    thingShadows.register(thingName, {}, function () {
        thingShadows.get(thingName);
    });

    thingShadows.on('delta', function(thingNameDelta, stateObject) {
        gyrophare.updateStates(stateObject.state, thingShadows);
    });

    thingShadows.on('status', function(name, status, clientToken, stateObject) {
        console.log('Status: ', stateObject.state.desired || stateObject.state.reported);
        if (isSetup === true)
           return;
        
        gyrophare.updateStates(stateObject.state.desired, thingShadows);
        isSetup = true;
    });
});
