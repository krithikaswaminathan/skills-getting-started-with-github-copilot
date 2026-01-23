from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_root_redirect():
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code in (302, 307)
    assert resp.headers.get("location") == "/static/index.html"


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Basketball" in data


def test_signup_and_remove_participant():
    activity = "Art Club"
    email = "test-participant@example.com"

    # Ensure participant not present
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert email not in data[activity]["participants"]

    # Sign up
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert resp.status_code == 200
    body = resp.json()
    assert "signed up" in body.get("message", "").lower() or "signed up" in body.get("message", "").lower()

    # Verify participant added
    resp = client.get("/activities")
    data = resp.json()
    assert email in data[activity]["participants"]

    # Remove participant
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert resp.status_code == 200
    body = resp.json()
    assert email not in body.get("participants", [])

    # Verify participant removed
    resp = client.get("/activities")
    data = resp.json()
    assert email not in data[activity]["participants"]
