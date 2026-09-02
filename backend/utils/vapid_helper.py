import os
import base64
from pathlib import Path
from dotenv import load_dotenv, set_key

try:
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives import serialization
except ImportError:
    ec = None
    serialization = None

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

def generate_vapid_key_pair():
    """Generates URL-safe base64 encoded VAPID key pair using cryptography."""
    if not ec:
        raise RuntimeError("cryptography library not installed")
    
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_num = private_key.private_numbers().private_value
    priv_bytes = private_num.to_bytes(32, byteorder="big")
    b64_private = base64.urlsafe_b64encode(priv_bytes).decode("utf-8").rstrip("=")

    pub_bytes = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    b64_public = base64.urlsafe_b64encode(pub_bytes).decode("utf-8").rstrip("=")

    return b64_public, b64_private

def get_or_create_vapid_keys():
    """Fetches VAPID keys from environment or generates and writes them to .env."""
    load_dotenv(ENV_FILE)
    public_key = os.getenv("VAPID_PUBLIC_KEY")
    private_key = os.getenv("VAPID_PRIVATE_KEY")
    email = os.getenv("VAPID_CLAIM_EMAIL", "mailto:admin@sarkarinotifier.local")

    if not public_key or not private_key:
        if not ENV_FILE.exists():
            ENV_FILE.touch()
        public_key, private_key = generate_vapid_key_pair()
        set_key(str(ENV_FILE), "VAPID_PUBLIC_KEY", public_key)
        set_key(str(ENV_FILE), "VAPID_PRIVATE_KEY", private_key)
        set_key(str(ENV_FILE), "VAPID_CLAIM_EMAIL", email)
        print(f"[VAPID] Generated new VAPID keys and saved to {ENV_FILE}")

    return {
        "public_key": public_key,
        "private_key": private_key,
        "email": email
    }
