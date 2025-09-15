from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"msg": "missing"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "user exists"}), 400
    u = User(username=username, email=data.get('email'))
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({"id": u.id, "username": u.username}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    u = User.query.filter_by(username=username).first()
    if not u or not u.check_password(password):
        return jsonify({"msg": "bad credentials"}), 401
    token = create_access_token(identity=str(u.id))
    return jsonify({"access_token": token})
