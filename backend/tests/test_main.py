from app.main import app


def test_create_and_login(client):
    # create account
    response = client.post("/create-account", json={"email": "a@b.com", "password": "pass"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["allowed_sites"] or data.get("user")

    # login with same credentials
    resp2 = client.post("/login", json={"email": "a@b.com", "password": "pass"})
    assert resp2.status_code == 200
    assert resp2.json()["user"]["email"] == "a@b.com"


def test_sites_endpoint(client):
    resp = client.get("/sites")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_login_helper(db_session):
    # directly exercise login.login_user without HTTP
    from app import login, models
    # add a user
    user = models.User(email="hi@there", hashed_password=login.auth.get_password_hash("x"), site_name="shared", allowed_sites="shared")
    db_session.add(user)
    db_session.commit()
    ok, msg = login.login_user("hi@there", "x")
    assert ok
    assert "successful" in msg.lower()
    ok2, msg2 = login.login_user("hi@there", "wrong")
    assert not ok2
