const aws = require("aws-sdk");
const thingEndpoint = process.env.ENDPOINT;
const thingName = process.env.THINGNAME;

const iotdata = new aws.IotData({
    endpoint: thingEndpoint
});

// ************** HELPER FUNCTIONS  ************** //

const getParams = {
    thingName
};

function updateShadow(state) {
    const updateParams = {
        payload: JSON.stringify({
            state: {
                desired: {
                    flashing: state
                }
            }
        }),
        thingName
    };
    
    iotdata.updateThingShadow(updateParams, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log("Shadow updated to require beacon to flash");
    });
}

exports.handler = (event, context, callback) => {
// ************** GETTING AND UPDATING THE SHADOW  ************** //

    updateShadow(true);
    callback(null, "shadow updated");
};