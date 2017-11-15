import { getPackedSettings } from "http2";

var aws = require("aws-sdk");
aws.config.update({
	region: "eu-west-1"
});
const thingEndpoint = "a35ua82z0kqvds.iot.eu-west-1.amazonaws.com";
const thingName = "gyrophare";

const iotdata = new aws.IotData({
	endpoint: thingEndpoint
});

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
				console.log(isFlashing);
				resolve(isFlashing);
			}
		});
	});
}

getShadow(getParams).then(console.log('Allumer le gyrophare'))