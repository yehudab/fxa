import { hexToUint8, uint8ToHex } from './utils';

// Ref: https://en.wikipedia.org/wiki/Base32#Crockford.27s_Base32
const ALPHABET_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const encoder = new TextEncoder();

export class RecoveryKey {
  private keyMaterial: Uint8Array;
  private uid: string;
  constructor(uid: string) {
    this.keyMaterial = crypto.getRandomValues(new Uint8Array(32));
    this.keyMaterial[0] = 0x41; // A
    this.uid = uid;
  }

  get base32() {
    return Array.from(this.keyMaterial)
      .map((b) => ALPHABET_BASE32[b & 0x1f])
      .join('');
  }

  private async getRecoveryKey() {
    const salt = hexToUint8(this.uid);
    const keyInfo = encoder.encode('fxa recovery encrypt key');
    const kidInfo = encoder.encode('fxa recovery fingerprint');
    const key = await crypto.subtle.importKey(
      'raw',
      this.keyMaterial,
      'HKDF',
      false,
      ['deriveBits', 'deriveKey']
    );
    const kid = uint8ToHex(
      new Uint8Array(
        await crypto.subtle.deriveBits(
          {
            name: 'HKDF',
            salt,
            // @ts-ignore
            info: kidInfo,
            hash: 'SHA-256',
          },
          key,
          128
        )
      )
    );
    const recoveryKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        salt,
        // @ts-ignore
        info: keyInfo,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    return {
      kid,
      recoveryKey,
    };
  }

  async bundleKeys(keys: { kA: string; kB: string }) {
    const { kid, recoveryKey } = await this.getRecoveryKey();
    const bundle = await crypto.subtle.encrypt();
  }
}
