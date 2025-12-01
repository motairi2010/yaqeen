const ENCRYPTION_KEY = 'yaqeen-secure-key-2024';

function stringToArrayBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function arrayBufferToString(buffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

async function getKey() {
  const keyMaterial = stringToArrayBuffer(ENCRYPTION_KEY);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyMaterial);

  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext) {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey();
    const encoded = stringToArrayBuffer(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return plaintext;
  }
}

export async function decrypt(encryptedData) {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const key = await getKey();

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
}

export async function secureStore(key, value) {
  try {
    const encrypted = await encrypt(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error('Secure store error:', error);
    return false;
  }
}

export async function secureRetrieve(key) {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = await decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Secure retrieve error:', error);
    return null;
  }
}

export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function obfuscate(str, length = 4) {
  if (!str || str.length <= length * 2) return str;
  const start = str.substring(0, length);
  const end = str.substring(str.length - length);
  return `${start}${'*'.repeat(str.length - length * 2)}${end}`;
}
