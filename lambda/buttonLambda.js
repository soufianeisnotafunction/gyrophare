const aws = require("aws-sdk");
const thingEndpoint = process.env.ENDPOINT;

const endpoint = "iot.eu-west-1.amazonaws.com";

const iot = new aws.Iot({
    endpoint: endpoint,
    region: 'eu-west-1'
});

const iotdata = new aws.IotData({
    endpoint: thingEndpoint
});

// ************** HELPER FUNCTIONS  ************** //
function updateShadow(name, state) {
    console.log({
        at: Date.now(),
        name: name,
        flash: state.flash,
        shutdownAt: state.shutdownAt || 0
    });
    
    iotdata.updateThingShadow({
        payload: JSON.stringify({
            state: {
                desired: state
            }
        }),
        thingName: name
    }, function (err, data) {
        if (err) 
            console.log(err, err.stack);
    });
}

exports.handler = (event, context, callback) => {
// ************** GETTING AND UPDATING THE SHADOW  ************** //
    console.log({
        clickType: event.clickType,
        dsn: event.serialNumber
    });
    
    iot.listThings({attributeName: 'associateButton', attributeValue: event.serialNumber}, function(err, data) {
        var things = [];
        if (err) {
            console.log(err);
            return (callback("error list things", null));
        } else
            things = data.things;
        
        if(event.clickType === "SINGLE"){
            things.forEach((thing) => {
                updateShadow(thing.thingName, {flash: false});
            });
        } else if (event.clickType === "LONG") {
            things.forEach((thing) => {
                updateShadow(thing.thingName, {flash: true, shutdownAt: Date.now() + (10 * 1000)});
            });
        }
        
        callback(null, "shadow updated"); 
    }); 
};