from app import auth

plain_password = "personal123"
hashed_password = "$2b$12$AEohoxT32gi6WhuN/XucY.hEsXqhJAoYBvG6KJVja5mekCea3cGTu"

if auth.verify_password(plain_password, hashed_password):
    print("✅ Password is correct")
else:
    print("❌ Password does NOT match")
