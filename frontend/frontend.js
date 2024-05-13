const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askUser() {
  let exit = false;
  while (!exit) {
    const answer = await askForInput(
      "Escolha a ação desejada:\n1. Criar conta\n2. Conferir saldo\n3. Debitar de uma conta\n4. Creditar em uma conta\n5. Transferir entre contas\n6. Rendimento de juros\n7. Sair\nEscolha o número da opção: "
    );

    switch (answer) {
      case "1":
        const createNumber = await askForInput(
          "Digite o número da conta que deseja criar: "
        );
        const accountType = await chooseAccountType();
        const balance = await insertBalance();
        createAccount(createNumber, accountType, balance);
        break;
      case "2":
        const checkNumber = await askForInput(
          "Digite o número da conta que deseja conferir o saldo: "
        );
        getAccountBalance(checkNumber);
        break;
      case "3":
        const debitNumber = await askForInput(
          "Digite o número da conta que deseja debitar: "
        );
        const debitAmount = await askForInput(
          "Digite o valor a ser debitado: "
        );
        debitFromAccount(debitNumber, debitAmount);
        break;
      case "4":
        const creditNumber = await askForInput(
          "Digite o número da conta que deseja creditar: "
        );
        const creditAmount = await askForInput(
          "Digite o valor a ser creditado: "
        );
        creditToAccount(creditNumber, creditAmount);
        break;
      case "5":
        const fromNumber = await askForInput(
          "Digite o número da conta de origem: "
        );
        const toNumber = await askForInput(
          "Digite o número da conta de destino: "
        );
        const transferAmount = await askForInput(
          "Digite o valor a ser transferido: "
        );
        transfer(fromNumber, toNumber, transferAmount);
        break;
      case "6":
        const interestRate = await askForInput("Digite a taxa de juros: ");
        yieldInterest(interestRate);
        break;
      case "7":
        exit = true;
        console.log("Saindo...");
        rl.close();
        break;
      default:
        console.log("Opção inválida.");
    }
  }
}

function askForInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function chooseAccountType() {
  const accountType = await askForInput(
    "\nEscolha o tipo de conta:\n1. Conta Corrente\n2. Conta Bônus\n3. Conta Poupança\nEscolha o número da opção: "
  );
  switch (accountType) {
    case "1":
      return "Default";
    case "2":
      return "Bonus";
    case "3":
      return "Saving";
    default:
      console.log("Tipo de conta inválido.");
      return null;
  }
}

async function insertBalance() {
  const balance = await askForInput("Digite o saldo inicial: ");
  return balance;
}

async function createAccount(number, type, balance) {
  try {
    const response = await axios.post("http://localhost:3000/accounts", {
      number,
      type,
      balance,
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error creating account:", error.response.data.message);
  }
}

async function getAccountBalance(number) {
  try {
    const response = await axios.get(
      `http://localhost:3000/accounts/${number}/balance`
    );
    console.log(response.data);
  } catch (error) {
    console.error(
      "Error getting account balance:",
      error.response.data.message
    );
  }
}

async function debitFromAccount(number, amount) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/accounts/${number}/debit`,
      { amount }
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error debiting from account:", error.response.data.message);
  }
}

async function creditToAccount(number, amount) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/accounts/${number}/credit`,
      { amount }
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error crediting to account:", error.response.data.message);
  }
}

async function transfer(fromNumber, toNumber, amount) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/accounts/${fromNumber}/transfer`,
      { toNumber, amount }
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error transferring amount:", error.response.data.message);
  }
}

async function yieldInterest(interestRate) {
  try {
    const response = await axios.patch(
      "http://localhost:3000/accounts/yield-interest",
      { interestRate }
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error yielding interest:", error.response.data.message);
  }
}

askUser();
