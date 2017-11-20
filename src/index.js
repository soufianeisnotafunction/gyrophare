const config = require('./config').config;

const Gpio = require('onoff').Gpio;
const aws = require("aws-sdk");
const isRPi = process.env.IS_RPI || true;

if (isRPi === true) {
	const gyrophare = new Gpio(config.GPIO_FLASH, 'out')
	gyrophare.writeSync(config.STATE_OFF);
}

const thingEndpoint = config.THING_ENDPOINT;
const thingName = config.THING_NAME;

process.env.AWS_ACCESS_KEY_ID = config.AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = config.AWS_SECRET_ACCESS_KEY;

aws.config.update({
	region: config.AWS_REGION
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
				console.log(err);
				reject(err);
			} else {
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
		gyrophare.writeSync(config.STATE_OFF);
	
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
			gyrophare.writeSync(state === true ? config.STATE_ON : config.STATE_OFF);
		if (state === true)
			setTimeout(shutdownFlash, config.DELAY_SHUTDOWN_FLASH);
	}).catch((err) => {
		console.log("main reject:");
		console.error(err);
	});
}

setInterval(main, config.DELAY_POLLING);
