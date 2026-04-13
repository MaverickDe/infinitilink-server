import crypto,{ constants, generateKeyPairSync, privateDecrypt, publicEncrypt } from "crypto";

export const generateCustomKeyPair = ()=>{

       const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048, // length of key in bits
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
    return {publicKey,privateKey};
}

export const savebodysecretprocessenv = ()=>{

let {publicKey, privateKey}=  generateCustomKeyPair()
if(!process.env.BODYPRIVATEKEY){
    process.env.BODYPRIVATEKEY = privateKey
}

if(!process.env.BODYPUBLICKEY){

    process.env.BODYPUBLICKEY = publicKey
}

console.log(publicKey,"\n",privateKey)
}




// /**
//  * Encrypt a message with RSA public key (OAEP)
//  */
export async function encryptMessageFromKeyPair({
  message,
  publicKey: publicKeyPem,
}: {
  message: string;
  publicKey: string;
}): Promise<{ encrypted: string }> {
  const encryptedBuffer = publicEncrypt(
    {
      key: publicKeyPem,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256", // must match what browser uses
    },
    Buffer.from(message, "utf8")
  );

  return { encrypted: encryptedBuffer.toString("base64") };
}

/**
 * Decrypt message with RSA private key (OAEP)
 */
export async function decryptMessageFromKeyPair({
  encrypted: encryptedBase64,
privateKey:privateKeyPem=process.env.BODYPRIVATEKEY
}: {
  encrypted: string;
  privateKey?: string;
}): Promise<{ decrypted: string }> {
  const decryptedBuffer = privateDecrypt(
    {
      key: privateKeyPem,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256", // must match encryption
    },
    Buffer.from(encryptedBase64, "base64")
  );

  return { decrypted: decryptedBuffer.toString("utf8") };
}

// "SFk04rHtGRVOV5rmYfP6+9K+QY3/MJfy7Vbb19hm8C3R7RCijI2shkV8jltOFiDwEiqd/fP6LZI5iV5S0yVfg14Vz81RYXAxEdECvYj2OkWjDSB4TH01CjkPbwNbQ01LUlZ1oyFOk2/6FYG5/3X0jkO6stPddg+leNXOva2UAPreql2BAcGm3PGINqjYTNaEsMmOFMyEFvvSjLR78ocru7Yj1J/9NTMz2gV4g0TA38R3dlXg0ixAxvAMFuPKQjINLL1iItwka0mIaguyCHWdYE0YLe3YloXEQw3H//5BthMHaodMG7QjGH4Erk7+j+WOwo3Ah8rrXpGDmgw6+LlDzA=="
// import { scryptSync, createDecipheriv } from "crypto";

// // derive AES-GCM key using scrypt (same params as subtle version)
// function deriveKey(passphrase: string, salt: Uint8Array): Buffer {
//   return scryptSync(passphrase, salt, 32); // 32-byte key
// }

// export function handleDecrypt({
//   encrypted: encryptedData,
//   passphrase,
// }: {
//   encrypted: any;
//   passphrase: string;
// }): string {
//   let { salt: saltHex, iv: ivHex, authTag: tagHex, encrypted, ciphertext } =
//     encryptedData;

//   const cipherHex = encrypted || encryptedData?.key ||ciphertext; // fallback

//   const salt = Buffer.from(saltHex, "hex");
//   const iv = Buffer.from(ivHex, "hex");
//   const tag = Buffer.from(tagHex, "hex");
//   const ciphertextBytes = Buffer.from(cipherHex, "hex");

//   // derive key
//   const key = deriveKey(passphrase, salt);

//   // setup decipher (AES-256-GCM)
//   const decipher = createDecipheriv("aes-256-gcm", key, iv);
//   decipher.setAuthTag(tag);

//   // decrypt
//   const decrypted = Buffer.concat([
//     decipher.update(ciphertextBytes),
//     decipher.final(),
//   ]);

//   return decrypted.toString("utf8");
// }

// import crypto, { constants, privateDecrypt } from "crypto";

const ALGORITHM = "aes-256-gcm";

export function handleDecrypt({
  encrypted: encryptedData,
  passphrase,
}: {
  encrypted: any;
  passphrase: string;
}): string {
   if(typeof encryptedData == "string"){
    const jsonStr = Buffer.from(encryptedData, "base64").toString("utf8");
    encryptedData = JSON.parse(jsonStr)
    console.log(encryptedData,"encryptedData",passphrase)
  }
  let { salt: saltHex, iv: ivHex, authTag: tagHex, encrypted,ciphertext } = encryptedData;
  encrypted = encrypted || encryptedData?.key||ciphertext; 

  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const key = crypto.scryptSync(passphrase, salt, 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
// console.log(tag)
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  console.log(decrypted,"decrypted")
  decrypted += decipher.final("utf8");
  // return tagHex

  return decrypted;
}

export  function handleEncrypt({ data: text, passphrase: secretPhrase, stringify}:{data:any,passphrase:string,stringify?:boolean}):string|Record<string,any> {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(secretPhrase, salt); // uses your scryptSync-based deriveKey

  // IV must be 12 bytes for AES-GCM
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  let payload = {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    authTag: authTag.toString('hex'),
  };
    if(stringify){
    
        const base64String = Buffer.from(JSON.stringify(payload)).toString("base64");
      return base64String;

  }

  return payload
}

export function deriveKey(passphrase: string, salt: Buffer) {
  return crypto.scryptSync(passphrase, salt, 32);
}


export function deriveKeyString(passphrase: string, salt: string): Buffer {
  const saltBytes = Buffer.from(salt, "utf8");
  return crypto.scryptSync(passphrase, saltBytes, 32);
}

export function encryptLedegersData (data){
    let isArray = Array.isArray(data)
  if(!isArray){
    data = [data]
  }
  console.log(data)
 let dat_ =  data.map( e => {

    let accNumber =e.accountNumber
    console.log(accNumber)
    let encryptedAccNumber =  handleEncrypt({data:accNumber,passphrase:process.env.LEDGER_SECRET,stringify:true})
    console.log(encryptedAccNumber)
    e.accountNumber =encryptedAccNumber

    return e
  });
 isArray ?  null : dat_ = dat_[0]
  return dat_
}
export function decryptLedegersData (data){
  console.log(data)
  let isArray = Array.isArray(data)
  if(!isArray){
    data = [data]
  }
 let dat_ =  data.map(e => {

    let accNumber =e.accountNumber
    console.log(e,"eeeeee")
    let encryptedAccNumber = handleDecrypt({encrypted:accNumber,passphrase:process.env.LEDGER_SECRET})
    e.accountNumber =encryptedAccNumber
    return e
  });
  isArray ?  null : dat_ = dat_[0]
  return dat_

}
export function encryptPairLedegersData (data,publicKey){
    let isArray = Array.isArray(data)
  if(!isArray){
    data = [data]
  }
 let dat_ =  data.map( e => {

    let accNumber =e?.accountNumber
    console.log(accNumber)
    if(accNumber){

      let encryptedAccNumber =  encryptMessageFromKeyPair({message:accNumber,publicKey:publicKey})
      console.log(encryptedAccNumber)
      e.accountNumber =encryptedAccNumber
    }

    return e
  });
 isArray ?  null : dat_ = dat_[0]
  return dat_
}
export function decryptPairLedegersData (data, privateKey){
  console.log(data)
  let isArray = Array.isArray(data)
  if(!isArray){
    data = [data]
  }
 let dat_ =  data.map(e => {

    let accNumber =e?.accountNumber
    if(accNumber){

      console.log(e,"eeeeee")
      let encryptedAccNumber = decryptMessageFromKeyPair({encrypted:accNumber,privateKey:privateKey})
      e.accountNumber =encryptedAccNumber
    }
    return e
  });
  isArray ?  null : dat_ = dat_[0]
  return dat_

}

// let v = encryptLedegersData([{accountNumber:"123456"}

//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456"}
//   ,{accountNumber:"123456ssssss",aas:"ASas"}
// ])
// console.log(v)
// let c = decryptLedegersData(v)
// console.log(c)
