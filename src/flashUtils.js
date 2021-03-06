const config = require('./config/config').config;
const Gpio = require('onoff').Gpio;

const flash = config.IS_RPI === true ? new Gpio(config.GPIO_FLASH, 'out') : undefined;

const setState = function(state) {
    console.log('Change State: ' + (state === config.STATE_ON ? "ON" : "OFF"));

    if (flash === undefined)
        return;

    flash.writeSync(state);
};

const getState = function(isFlashing) {
    return (isFlashing === true ? config.STATE_ON : config.STATE_OFF);
}

module.exports = {
    flash: flash,
    setState: setState,
    getState: getState
};
