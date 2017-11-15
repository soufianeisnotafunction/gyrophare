var aws = require("aws-sdk");
aws.config.update({
	region: "eu-west-1"
});
const thingEndpoint = "a2gobystlgr77s.iot.eu-west-1.amazonaws.com";
const shadowArn = "arn:aws:iot:eu-west-1:849565946068:thing/gyrophare";

// ************** GET SHADOW ************** //

const getParams = {
	thingName: "gyrophare" /* required */
};
const iotdata = new aws.IotData({
	endpoint: thingEndpoint
});
iotdata.getThingShadow(getParams, function(err, data) {
	if (err) console.log(err, err.stack);
	else {
		const isFlashing = JSON.parse(data.payload).state.reported.flashing;
		if (isFlashing == false) {
			const updateParams = {
				payload: JSON.stringify({
					state: { desired: { flashing: !isFlashing } }
				}),
				thingName: "gyrophare"
			};
			iotdata.updateThingShadow(updateParams, function(err, data) {
				if (err) console.log(err, err.stack);
				else console.log(data.payload);
			});
		} else {
			console.log("allready flashing");
		}
	}
});
