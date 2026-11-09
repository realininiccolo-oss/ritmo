"""Cifra i dati del piano di Ritmo.
- data.enc.json: AES-GCM con chiave da PBKDF2 della parola chiave (letto dall'app).
- widget.enc.json: SHA-256 in modalità contatore + HMAC-SHA256 con la chiave del widget (letto dal widget di Scriptable,
  che non ha AES). Uso: python3 strumenti/cifra.py <versione> <cartella di uscita>"""
import json, os, sys, base64, hashlib, hmac
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from dati import build
versione, out = sys.argv[1], sys.argv[2]
plain = json.dumps(build(versione), ensure_ascii=False).encode()
b = lambda x: base64.b64encode(x).decode()

passw = open(os.path.join(here, 'parola.txt')).read().strip().lower()
salt = os.urandom(16); iv = os.urandom(12); it = 310000
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=it).derive(passw.encode())
ct = AESGCM(key).encrypt(iv, plain, None)
json.dump({"v": 1, "iter": it, "salt": b(salt), "iv": b(iv), "ct": b(ct)}, open(os.path.join(out, 'data.enc.json'), 'w'))

wpath = os.path.join(here, 'widget-chiave.txt')
if os.path.exists(wpath):
    wk = bytes.fromhex(open(wpath).read().strip())
    nonce = os.urandom(16)
    ks = b''.join(hashlib.sha256(wk + nonce + i.to_bytes(4, 'big')).digest() for i in range((len(plain) + 31) // 32))
    c = bytes(p ^ k for p, k in zip(plain, ks))
    tag = hmac.new(wk, nonce + c, hashlib.sha256).digest()
    json.dump({"v": 1, "n": b(nonce), "c": b(c), "t": b(tag)}, open(os.path.join(out, 'widget.enc.json'), 'w'))
print('ok', versione, len(plain), 'byte')
