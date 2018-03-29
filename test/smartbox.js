var Smartbox = artifacts.require("./smalobox.sol");

contract('Smartbox', (accounts) => {
  it("should have the first account as owner", async () => {
    const smartbox = await Smartbox.deployed();
    const owner = await smartbox.owner();
    assert.equal(owner, accounts[0], "the owner of the smartbox is not the first account");
  });

  it("should rent the smart box, set authorized user and emit events, and a second rent should fail.", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    const tx = await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    const result = await smartbox.isUserAuthorized(accounts[1]);
    assert.equal(result, true, "the accounts[1] is not authorized");

    const duration = await smartbox.duration();
    assert.equal(duration.toNumber(), 5, "duration is wrong!");

    assert.equal(tx.logs[0].event, 'Rented', "the event rented is not emitted");
  })

  it("the box can't be rented again if the rent doesn't time out", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    try {
      await smartbox.rent({from: accounts[2], value: web3.toWei(1, "ether")});
      assert.fail('Something is wrong! The smart box can be rented again.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("only the person who rented the box can open the box", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    await smartbox.open({from: accounts[1]});

    try {
      await smartbox.open({from: accounts[2]});
      assert.fail('Something is wrong! The smart box can be opened from other people.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("the owner should be able to withdraw the ether", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();
    await smartbox.withdraw({from: accounts[0]});
    let balance = await web3.eth.getBalance(smartbox.address);
    assert.equal(balance, 0, "The balance of the smart box contract is not 0");

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether"), gas: 100000});

    const tx = await smartbox.withdraw({from: accounts[0]});

    balance = await web3.eth.getBalance(smartbox.address);
    assert.equal(balance, 0, "The balance of the smart box contract is not 0");
  })

  it("only the owner can withdraw the ether", async () => {
    const smartbox = await Smartbox.deployed();

    try {
      await smartbox.withdraw({from: accounts[1]});
      assert.fail('Something is wrong! Other peoples can withdraw the ether.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("the box should be available again after the rent times out", (done) => {
    let smartbox;
    Smartbox.deployed()
      .then((instance) => {
        smartbox = instance;
        return smartbox.returnBox();
      }).then(() => {
        return smartbox.rent({from: accounts[1], value: web3.toWei(0.001, "ether")});
    }).then(() => {
      setTimeout(() => {
        smartbox.rent({from: accounts[2], value: web3.toWei(0.001, "ether")})
          .then(() => {
            done();
          })
      }, 65000);
    });
  })

  it("should authorize other users to open the box", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    try {
      await smartbox.open({from: accounts[2]});
      assert.fail("Not authorized users can open the box");
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }

    await smartbox.authorizeUser(accounts[2], {from: accounts[1]});

    await smartbox.open({from: accounts[2]});

    await smartbox.open({from: accounts[1]});
  })

  it("The renter should be able to rate", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    const index = await smartbox.index();
    const tx = await smartbox.rate(1, index, {from: accounts[1]});

    assert.equal(tx.logs[0].event, 'Rated', "the event Rated is not emitted");
  })

  it("The stranger should not be able to rate", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    const index = await smartbox.index();
    try {
      await smartbox.rate(1, index, {from: accounts[2]});
      assert.fail('Something is wrong! Other peoples can give rating.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("The authorized user can close the box", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    await smartbox.open({from: accounts[1]});

    await smartbox.close({from: accounts[1]});
  })

  it("The not authorized users can not close the box", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    await smartbox.open({from: accounts[1]});

    try {
      await smartbox.close({from: accounts[2]});
      assert.fail('Something is wrong! Other peoples can close box.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

});
