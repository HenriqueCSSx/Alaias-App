import CryptoJS from 'crypto-js';

export function encryptData(text: string, pin: string): string {
    if (!text) return '';
    try {
        return CryptoJS.AES.encrypt(text, pin).toString();
    } catch {
        return '';
    }
}

export function decryptData(cipherText: string, pin: string): string {
    if (!cipherText) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, pin);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return '';
    }
}

export function hashPin(pin: string): string {
    return CryptoJS.SHA256(pin).toString();
}
