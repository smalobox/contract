const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = "enable south social permit fantasy solution canal fresh prize leave volcano seven";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/PCx3uNGj3ABrJ38Cdl4Q");
      },
      network_id: 3
    }
  }
};
