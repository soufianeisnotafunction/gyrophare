const Gpio = require('onoff').Gpio;
const aws = require("aws-sdk");
const isRPi = process.env.IS_RPI || true;

const ON = 0;
const OFF = 1;

if (isRPi === true) {
	const gyrophare = new Gpio(18, 'out');
	gyrophare.writeSync(OFF);	
}

process.env.AWS_ACCESS_KEY_ID = "AKIAIZV4BA4NCQ26OXQA";
process.env.AWS_SECRET_ACCESS_KEY = "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";

const thingEndpoint = "a3e6rc2fumc5un.iot.eu-west-1.amazonaws.com";
const thingName = "gyrophare";

aws.config.update({
	region: "eu-west-1"
});

const iotdata = new aws.IotData({
	endpoint: thingEndpoint
});

const getParams = {
	thingName
};

function getShadow(params) {
	return new Promise((resolve, reject) => {
		iotdata.getThingShadow(params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				console.log(JSON.parse(data.payload));
				var data = JSON.parse(data.payload);

				if (data.state.delta === undefined)
					return resolve(data.state.reported.flashing);

				var state = data.state.delta.flashing;

				updateShadow(state);

				console.log(`Delta flashing state: ${state}`);
				resolve(state);
			}
		});
	});
}

function updateShadow(state) {
    iotdata.updateThingShadow({
		payload: JSON.stringify({
			state: {
				reported: {
					flashing: state
				}
			}
		}),
		thingName
	}, function (err, data) {
		if (err) 
			console.log(err, err.stack);
		else 
			console.log("Shadow updated");
    });
}

function shutdownFlash() {
	console.log('Shutdown flash');
	if (isRPi === true)
		gyrophare.writeSync(OFF);
	
	iotdata.updateThingShadow({
		payload: JSON.stringify({
			state: {
				desired: {
					flashing: false
				},
				reported: {
					flashing: false
				}
			}
		}),
		thingName
	}, function (err, data) {
		if (err) 
			console.log(err, err.stack);
		else 
			console.log("Shadow updated");
    });
}

function main() {
	getShadow(getParams).then((state) => {
		console.log(`Gyrophare flashing state: ${state}`);
		if (isRPi === true)
			gyrophare.writeSync(state === true ? ON : OFF);
		if (state === true)
			setTimeout(shutdownFlash, 6000);
	}, (err) => {
		console.error(err.message);
	});
}

setInterval(main, 5000);