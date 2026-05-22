import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from dotenv import load_dotenv

load_dotenv()

# Use SECRET_KEY as a salt/base for the encryption key
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-for-development")

def get_encryption_key():
    """Derives a stable 32-byte key from the SECRET_KEY for Fernet."""
    salt = b'zoho-encryption-salt' # Fixed salt for stability
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(SECRET_KEY.encode()))
    return key

_fernet = Fernet(get_encryption_key())

def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return ""
    return _fernet.encrypt(value.encode()).decode()

def decrypt_value(token: str) -> str:
    """Decrypt a string value."""
    if not token:
        return ""
    try:
        return _fernet.decrypt(token.encode()).decode()
    except Exception:
        # Fallback to plain text if decryption fails (for transition period)
        return token
