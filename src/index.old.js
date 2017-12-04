const config = require('./config/config').config;
const flashUtils = require('./flashUtils');
const awsIot = require('aws-iot-device-sdk');

const thingName = config.THING_NAME;

var thingShadows = awsIot.thingShadow({
    keyPath: config.KEY_PATH,
    certPath: config.CERT_PATH,
    caPath: config.CA_PATH,
    clientId: thingName,
    host: config.THING_ENDPOINT
});

var isSetup = false;
var interval = null;

flashUtils.setState(flashUtils.getState(false));

thingShadows
 .on('connect', function() {
    console.log('connect');
    thingShadows.register(thingName, {}, function () {
        console.log(thingShadows.get(thingName));
    });
    
    thingShadows.on('delta', function(thingNameDelta, stateObject) {
        flashUtils.setState(flashUtils.getState(stateObject.state.flashing));
        thingShadows.update(thingName, {"state": {"reported": {"flashing": stateObject.state.flashing}}});
       
        if (stateObject.state.flashing === true) {
            if (interval !== null) {
                clearInterval(interval);
                console.log("Clear interval");
            }

            interval = setTimeout(function() {
                flashUtils.setState(flashUtils.getState(false));
                thingShadows.update(thingName, {"state": {"desired": {"flashing": false}, "reported": {"flashing": false}}});
                console.log("Shutdown flash");
            }, stateObject.state.flashingDelay * 1000);

            console.log("Shutdown flash in " + stateObject.state.flashingDelay + "s");
        }
        console.log('delta received delta on '+thingNameDelta+': '+
                   JSON.stringify(stateObject));
    });

    thingShadows.on('status', function(name, status, clientToken, stateObject) {
        if (isSetup === true)
            return;

        console.log('STATUS:', name, status, clientToken, JSON.stringify(stateObject), 'END STATUS');

        console.log(stateObject.state.reported.flashing);
        var state = false;

        if (stateObject.state.delta !== undefined)
            state = stateObject.state.delta.flashing;
        else
            state = stateObject.state.reported.flashing || false;

        console.log("setup : " + state);

        flashUtils.setState(flashUtils.getState(state));
        thingShadows.update(thingName, {"state": {"reported": {"flashing": state}}});

        if (state === true) {
            setTimeout(function() {
                flashUtils.setState(flashUtils.getState(false));
                thingShadows.update(thingName, {"state": {"desired": {"flashing": false}}});
            }, 1000);
        }

        isSetup = true;
    });
});
