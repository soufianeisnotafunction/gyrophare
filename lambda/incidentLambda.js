const aws = require("aws-sdk");
const thingEndpoint = process.env.ENDPOINT;
const delay = process.env.DELAY || 120 * 1000;

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
    iotdata.updateThingShadow({
        payload: JSON.stringify({
            state: {
                desired: {
                    flash: state,
                    shutdownAt: Date.now() + parseInt(delay)
                }
            }
        }),
        thingName: name
    }, function (err, data) {
        if (err) 
            console.log(err, err.stack);
        else 
            console.log("Shadow updated");
    });
}

exports.handler = (event, context, callback) => {
// ************** GETTING AND UPDATING THE SHADOW  ************** //
    iot.listThings({thingTypeName: 'gyrophare-gyrophare'}, function(err, data) {
        var things = [];
        if (err) {
            console.log(err);
            return (callback("error list things", null));
        } else
            things = data.things;

        if(event.clickType){
            things.forEach((thing) => {
                updateShadow(thing.thingName, false);
            });
        } else {
            things.forEach((thing) => {
                updateShadow(thing.thingName, true);
            });
        }
        
        callback(null, "shadow updated"); 
    }); 
};