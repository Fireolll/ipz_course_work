import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={
            "user_nickname": "TestUser",
            "email": "test@kpi.ua",
            "password": "securepassword123",
            "currency": "UAH",
            "financial_period": "month"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@kpi.ua"
    assert data["user_nickname"] == "TestUser"
    assert "user_id" in data

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "user_nickname": "LoginTest",
            "email": "login@kpi.ua",
            "password": "securepassword123",
            "currency": "USD",
            "financial_period": "month"
        }
    )
    
    response = await client.post(
        "/auth/login",
        data={
            "username": "login@kpi.ua",
            "password": "securepassword123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
