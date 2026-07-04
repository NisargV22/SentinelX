const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || "SentinelXSecretKeySentinelXSecretKey";
  return crypto.scryptSync(secret, "salt", KEY_LENGTH);
};

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return {
    iv: iv.toString("hex"),
    content: encrypted,
    authTag: authTag
  };
};

const decrypt = (encryptedObj) => {
  const iv = Buffer.from(encryptedObj.iv, "hex");
  const authTag = Buffer.from(encryptedObj.authTag, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedObj.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
};

const sha256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

module.exports = {
  encrypt,
  decrypt,
  sha256
};
