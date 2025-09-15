#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"], 
     supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Mock data storage
users = {}
expenses = []
categories = [
    {"id": 1, "name": "Food & Dining"},
    {"id": 2, "name": "Transportation"},
    {"id": 3, "name": "Entertainment"},
    {"id": 4, "name": "Shopping"},
    {"id": 5, "name": "Health & Fitness"},
    {"id": 6, "name": "Bills & Utilities"},
    {"id": 7, "name": "Other"}
]

# Auth endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    if not username or not password:
        return jsonify({"msg": "missing"}), 400
    if username in users:
        return jsonify({"msg": "user exists"}), 400
    
    user_id = len(users) + 1
    users[username] = {
        "id": user_id,
        "username": username,
        "email": email,
        "password": password  # In real app, hash this
    }
    
    return jsonify({"id": user_id, "username": username}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({"msg": "bad credentials"}), 401
    
    # Simple token (in real app, use JWT)
    token = f"token-{user['id']}-{username}"
    return jsonify({"access_token": token})

# Categories endpoints
@app.route('/categories', methods=['GET'])
def list_categories():
    return jsonify(categories)

@app.route('/categories', methods=['POST'])
def create_category():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"msg": "missing name"}), 400
    
    # Check if category exists
    for cat in categories:
        if cat['name'] == name:
            return jsonify({"msg": "exists"}), 400
    
    new_id = max([c['id'] for c in categories]) + 1
    new_category = {"id": new_id, "name": name}
    categories.append(new_category)
    
    return jsonify(new_category), 201

# Expenses endpoints
@app.route('/expenses', methods=['POST'])
def create_expense():
    # Simple auth check - in real app, decode JWT
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"msg": "unauthorized"}), 401
    
    data = request.json
    amount = data.get('amount')
    category_id = data.get('category_id')
    date = data.get('date')
    description = data.get('description')
    
    # Find category name
    category_name = "Other"
    for cat in categories:
        if cat['id'] == category_id:
            category_name = cat['name']
            break
    
    expense_id = len(expenses) + 1
    expense = {
        "id": expense_id,
        "amount": float(amount),
        "category_id": category_id,
        "category_name": category_name,
        "date": date,
        "description": description,
        "user_id": 1  # Mock user ID
    }
    
    expenses.append(expense)
    return jsonify({"id": expense_id}), 201

@app.route('/expenses', methods=['GET'])
def list_expenses():
    # Simple auth check
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"msg": "unauthorized"}), 401
    
    return jsonify(expenses)

@app.route('/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"msg": "unauthorized"}), 401
    
    data = request.json
    
    # Find expense
    for expense in expenses:
        if expense['id'] == expense_id:
            expense['amount'] = float(data.get('amount', expense['amount']))
            expense['category_id'] = data.get('category_id', expense['category_id'])
            expense['date'] = data.get('date', expense['date'])
            expense['description'] = data.get('description', expense['description'])
            
            # Update category name
            for cat in categories:
                if cat['id'] == expense['category_id']:
                    expense['category_name'] = cat['name']
                    break
            
            return jsonify(expense)
    
    return jsonify({"msg": "not found"}), 404

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"msg": "unauthorized"}), 401
    
    global expenses
    expenses = [e for e in expenses if e['id'] != expense_id]
    return jsonify({"msg": "deleted"})

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    print("CORS enabled for frontend origins")
    app.run(debug=True, port=5000, host='0.0.0.0')