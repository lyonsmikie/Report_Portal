from app import crud, models


def test_get_user_by_email(db_session):
    user = models.User(email="foo@x.com", hashed_password="h", site_name="shared", allowed_sites="shared")
    db_session.add(user)
    db_session.commit()

    result = crud.get_user_by_email(db_session, "foo@x.com")
    assert result is not None
    assert result.email == "foo@x.com"
