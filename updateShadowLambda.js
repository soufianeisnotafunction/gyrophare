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

function getShadow(params) {
    return new Promise(resolve => {
        iotdata.getThingShadow(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                const isFlashing = JSON.parse(data.payload).state.reported.flashing;
                console.log(isFlashing);
                resolve(isFlashing);
            }
        });
    });
}

function updateShadow(state) {
    const updateParams = {
        payload: JSON.stringify({
            state: {
                desired: {
                    flashing: !state
                }
            }
        }),
        thingName
    };
    if (state == true) {
        console.log("beacon allready flashing");
    } else {
        iotdata.updateThingShadow(updateParams, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log("Shadow updated to require beacon to flash");
        });
    }
}
exports.handler = (event, context, callback) => {
// ************** GETTING AND UPDATING THE SHADOW  ************** //

    getShadow(getParams).then(updateShadow());
    callback(null, "Done");
};