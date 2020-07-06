const qs = require("qs");
const axios = require("axios");
const crypto = require("crypto");

const key = "WINGSITCODEAPP@#WINGSITCODEAPP@#";

// json para ser enviado
let SObjectType = "Case";
let json = {
  Subject: "Ajuda com Salesforce",
  Description: "Preciso de uma API criptografada",
};

// Dados para autenticação
// substituir informações de login aqui
const data = {
  grant_type: "password",
  client_id: "<<client_id>>",
  client_secret: "<<client_secret>>",
  username: "<<login>>",
  password: "<<senha>>",
};

// função para encriptar dados
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
}

let token = null;

console.log("Chamando api para obter token");

// chamada para obter token
axios({
  url: "https://elocartoes--dev.my.salesforce.com/services/oauth2/token",
  method: "post",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  data: qs.stringify(data),
})
  .then((response) => {
    console.log("Resposta api");
    console.log(response.data);
    console.log();
    token = response.data.access_token;

    if (!token) return;

    console.log("Token Obtido: " + token + "\n");

    // gera dado criptografado
    let criptografado = encrypt(JSON.stringify(json));
    console.log("Dado enviado");
    console.log(json);
    console.log();
    console.log("Dado criptografado");
    console.log(criptografado);
    console.log();

    console.log("Chamando api criptografada");

    // chama api passando dados criptografados
    axios({
      url: `https://elocartoes--dev.my.salesforce.com/services/apexrest/crypto/${SObjectType}`,
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      data: criptografado,
    })
      .then((response) => {
        console.log("Resposta api");
        console.log(response.data);
        token = response.data.access_token;
        console.log("\n");
      })
      .catch((error) => {
        console.log("Não foi possível realizar a chamada criptografada");
        console.log("Resposta api");
        console.log(error.response.data);
        console.log("\n");
      });
  })
  .catch((error) => {
    console.log("Não foi possível realizar login no Salesforce");
    console.log("Resposta api");
    console.log(error.response.data);
    console.log("\n");
  });
