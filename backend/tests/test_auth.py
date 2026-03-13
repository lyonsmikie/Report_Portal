from app import auth
import jwt

def test_password_hash_and_verify():
    pwd = "secret"
    h = auth.get_password_hash(pwd)
    assert auth.verify_password(pwd, h)
    assert not auth.verify_password("wrong", h)


def test_token_roundtrip():
    data = {"sub": "user@example.com"}
    token = auth.create_access_token(data)
    decoded = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
    assert decoded["sub"] == "user@example.com"
