import crypto from 'crypto';

export function encryptPassword(password: string): string {
  const secretKey = process.env.PASSWORD_SECRET_KEY;

  if (!secretKey) {
    throw new Error('PASSWORD_SECRET_KEY is missing');
  }

  const md5 = crypto.createHash('md5').update(secretKey, 'utf8').digest();

  const key = Buffer.concat([md5, md5.subarray(0, 8)]);

  const cipher = crypto.createCipheriv('des-ede3', key, null);

  const encrypted = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ]);

  const result = encrypted.toString('base64');
  console.log('Encrypted password:', result);

  return result;
}
