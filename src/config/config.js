exports.config = {
    STATE_ON: 0,
    STATE_OFF: 1,
    GPIO_FLASH: 18,
    AWS_REGION: "eu-west-1",
    THING_ENDPOINT: "a3e6rc2fumc5un.iot.eu-west-1.amazonaws.com",
    THING_NAME: "gyrophare",
    KEY_PATH: "config/gyrophare.private.key",
    CERT_PATH: "config/gyrophare.cert.pem",
    CA_PATH: "config/root-CA.crt",
    IS_RPI: process.env.IS_RPI || true
};