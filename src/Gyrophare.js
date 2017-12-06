const config = require('./config/config').config;
const flashUtils = require('./flashUtils');

class Gyrophare {
    constructor(thingName) {
        this.thingName = thingName;

        this.states = {
            flash: false,
            shutdownAt: 0   
        };
        
        this.interval = null;
        this.update();
    }
    
    updateStates(newStates, thingShadows) {
        this.states = Object.assign(this.states, newStates);
        console.log(this.states);
        if (thingShadows !== undefined) {
            thingShadows.update(this.thingName, {"state": {"reported": this.states, "desired": this.states}}, function() {
                console.log("Shadow updated");
            });
        }
       
        this.update(thingShadows);
    }

    update(thingShadows) {
        flashUtils.setState(flashUtils.getState(this.states.flash));
        
        if (this.states.flash === true) {
            clearInterval(this.interval);

            var delay = this.states.shutdownAt - Date.now();
            
            if (delay <= 0) {
                this.updateStates({flash: false}, thingShadows);
                return;
            }
            
            this.interval = setTimeout(function() {
                this.updateStates({flash: false}, thingShadows);
            }.bind(this), delay);
        }
    }
}

module.exports.Gyrophare = Gyrophare;