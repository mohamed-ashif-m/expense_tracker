from flask import Blueprint, request, jsonify
from ..models import Category
from ..extensions import db

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
def list_categories():
    cats = Category.query.order_by(Category.name).all()
    return jsonify([{"id":c.id, "name":c.name} for c in cats])

@categories_bp.route('', methods=['POST'])
def create_category():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"msg":"missing name"}), 400
    if Category.query.filter_by(name=name).first():
        return jsonify({"msg":"exists"}), 400
    c = Category(name=name)
    db.session.add(c)
    db.session.commit()
    return jsonify({"id":c.id, "name":c.name}), 201
