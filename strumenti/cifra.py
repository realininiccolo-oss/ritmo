import json, os, sys, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
sys.path.insert(0, os.path.dirname(__file__))
from dati import build
passw = open(os.path.join(os.path.dirname(__file__), 'parola.txt')).read().strip().lower()
versione = sys.argv[1]; out = sys.argv[2]
salt = os.urandom(16); iv = os.urandom(12); it = 310000
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=it).derive(passw.encode())
ct = AESGCM(key).encrypt(iv, json.dumps(build(versione), ensure_ascii=False).encode(), None)
b = lambda x: base64.b64encode(x).decode()
json.dump({"v": 1, "iter": it, "salt": b(salt), "iv": b(iv), "ct": b(ct)}, open(out, 'w'))
print('ok', len(ct))
