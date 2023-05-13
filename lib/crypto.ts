import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './schema';

// Helper function to generate a random 256-bit key
function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

const bytesToHex = (src: Uint8Array) =>
  '\\x' + src.reduce((s, n) => s + n.toString(16).padStart(2, '0'), '');

const hexToBytes = (hex: string): Uint8Array => {
  hex = hex.replace(/^\\x/, ''); // Remove the leading '\x' if present
  const length = hex.length / 2;
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
  }
  return result;
};

// Helper function to generate a random 96-bit IV
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// Define the type for the key and IV
type KeyIVPair = {
  key: CryptoKey;
  iv: Uint8Array;
};

// Function to store a key and IV in Supabase
export async function storeKey(
  keyIV: KeyIVPair,
  path: string,
  userId: string,
  supabase: SupabaseClient,
): Promise<PostgrestError | undefined> {
  const keyData = await crypto.subtle.exportKey('jwk', keyIV.key);

  const { error } = await supabase
    .from('keys')
    .insert([
      { path, key_data: keyData, iv: bytesToHex(keyIV.iv), user_id: userId },
    ]);

  if (error) {
    return error;
  }
}

// Function to fetch a key and IV from Supabase
export async function fetchKey(
  path: string,
  supabase: SupabaseClient,
): Promise<[KeyIVPair | null, PostgrestError | null]> {
  const { data, error } = await supabase
    .from('keys')
    .select('key_data, iv')
    .eq('path', path)
    .single();

  if (error) {
    return [null, error];
  }

  if (!data) {
    return [null, null];
  }

  const key = await crypto.subtle.importKey(
    'jwk',
    data.key_data,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = hexToBytes(data.iv);
  return [{ key, iv }, null];
}

// Function to encrypt a file with AES-256
export async function encryptFile(
  file: File,
): Promise<
  [{ file: ArrayBuffer; iv: Uint8Array; key: CryptoKey } | null, unknown | null]
> {
  try {
    const key = await generateKey();
    const iv = generateIV();

    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      await file.arrayBuffer(),
    );
    return [{ file: encryptedData, iv, key }, null];
  } catch (error) {
    return [null, error];
  }
}

// Function to decrypt a blob with AES-256
export async function decryptFile(
  blob: Blob,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<[ArrayBuffer | null, unknown | null]> {
  try {
    const encryptedData = await blob.arrayBuffer();
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData,
    );

    return [decryptedData, null];
  } catch (error) {
    return [null, error];
  }
}
