const Savings = artifacts.require("Savings");
const Evil = artifacts.require("Evil");

contract("Savings", (accounts) => {
    let savingsContract = null;
    let evilContract = null;
    let savingsAccount = null;
    let evilAccount = null;

    before(async () => {
        savingsContract = await Savings.deployed();
        evilContract = await Evil.deployed();
        savingsAccount = accounts[0];
        evilAccount = accounts[1];
    });

    it("should deploy savings smart contract", () => {
        assert.notEqual(savingsContract.address, "");
        assert.notEqual(evilContract.address, "");
        assert.isNotNull(savingsAccount);
        assert.isNotNull(evilAccount);
    });

    it("should deposit savings", async () => {
        // Arrange
        let err = null;
        let balance = 0;

        // Act
        try {
            await savingsContract.deposit({ from: savingsAccount, value: 5 });
            balance = await savingsContract._savings(savingsAccount);
        } catch (error) {
            err = error;
        }

        // Assert
        assert.isNull(err);
        assert.equal(5, Number(balance));
    });

    it("should withdraw savings", async () => {
        // Arrange
        let err = null;
        let balance = -1;

        // Act
        try {
            await savingsContract.unsafeWithdraw({ from: savingsAccount });
            balance = await savingsContract._savings(savingsAccount);
        } catch (error) {
            err = error;
        }

        // Assert
        assert.isNull(err);
        assert.equal(0, Number(balance));
    });

    it("should set attack target", async () => {
        // Arrange
        let err = null;
        let attackTargetAddr = "";

        // Act
        try {
            await evilContract.setAttackTarget(savingsContract.address);
            attackTargetAddr = await evilContract._attackTargetAddr();
        } catch (error) {
            err = error;
        }

        // Assert
        assert.isNull(err);
        assert.equal(attackTargetAddr, savingsContract.address);
    });

    it("should attack target and steal savings", async () => {
        // Arrange
        let err = null;
        const deposit = 10;
        await savingsContract.deposit({ from: savingsAccount, value: deposit }); // savings that should be stolen
        const savingsBefore = Number(await savingsContract.getStoredSavings());
        const stolenSavingsBefore = Number(await evilContract.getStoredSavings());
        let savingsAfter = deposit;
        let stolenSavingsAfter = 0;


        // Act
        try {
            await evilContract.attack({ from: evilAccount, value: 1 });
            stolenSavingsAfter = await evilContract.getStoredSavings();
            savingsAfter = await savingsContract.getStoredSavings();
        } catch(error) {
            err = error;
        }

        // Assert
        // assert.isNull(err);
        assert.equal(0, Number(stolenSavingsBefore));
        assert.equal(deposit + 1, Number(stolenSavingsAfter));
        assert.equal(deposit, Number(savingsBefore));
        assert.equal(0, Number(savingsAfter));
    });

    it("should not be able to withdraw any savings after savings has been drained", async () => {
        // Arrange
        let err = null;
        let storedSavings = -1;

        // Act
        try {
            storedSavings = await savingsContract.getStoredSavings();
            await savingsContract.unsafeWithdraw({ from: savingsAccount });
        } catch(error) {
            err = error;
        }

        // Assert
        // assert.isNotNull(err);
        assert.equal(0, Number(storedSavings));
        assert.equal(err.reason, "Failed to withdraw savings");
    });


    // it("hack should fail with safeWithdraw", async () => {
    //     // Arrange
    //     let err = null;
    //     const deposit = 10;
    //     await savingsContract.deposit({ from: savingsAccount, value: deposit }); // savings that should be stolen
    //     const savingsBefore = Number(await savingsContract.getStoredSavings());
    //     const stolenSavingsBefore = Number(await evilContract.getStoredSavings());

    //     // Act
    //     try {
    //         await evilContract.attack({ from: evilAccount, value: 1 });
    //     } catch (error) {
    //         err = error;
    //     }

    //     const savingsAfter = await savingsContract.getStoredSavings();
    //     const stolenSavingsAfter = await evilContract.getStoredSavings();

    //     // Assert
    //     assert.isNotNull(err);
    //     assert.equal(0, Number(stolenSavingsBefore));
    //     assert.equal(0, Number(stolenSavingsAfter));
    //     assert.equal(deposit, Number(savingsBefore));
    //     assert.equal(deposit, Number(savingsAfter));
    // });
});