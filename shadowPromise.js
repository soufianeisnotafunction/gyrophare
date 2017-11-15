var aws = require("aws-sdk");
aws.config.update({
	region: "eu-west-1"
});
const thingEndpoint = "a35ua82z0kqvds.iot.eu-west-1.amazonaws.com";
const thingName = "gyrophare";

const iotdata = new aws.IotData({
	endpoint: thingEndpoint
});

// ************** HELPER FUNCTIONS  ************** //

const getParams = {
	thingName
};

function getShadow(params) {
	return new Promise(resolve => {
		iotdata.getThingShadow(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				const isFlashing = JSON.parse(data.payload).state.reported.flashing;
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
	if (state) {
		console.log("beacon allready flashing");
	} else {
		iotdata.updateThingShadow(updateParams, function(err, data) {
			if (err) console.log(err, err.stack);
			else console.log(data.payload);
		});
	}
}
// ************** GETTING AND UPDATING THE SHADOW  ************** //

getShadow(getParams).then(updateShadow());
