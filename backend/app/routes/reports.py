from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Expense, Category
from sqlalchemy import func
from flask_jwt_extended import jwt_required, get_jwt_identity

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/category-totals', methods=['GET'])
@jwt_required()
def category_totals():
    user_id = request.args.get('user_id') or get_jwt_identity()
    start = request.args.get('start')  # optional YYYY-MM-DD
    end = request.args.get('end')
    q = db.session.query(Category.name, func.sum(Expense.amount).label('total')) \
        .join(Expense, Expense.category_id == Category.id) \
        .filter(Expense.user_id == int(user_id))

    if start:
        q = q.filter(Expense.date >= start)
    if end:
        q = q.filter(Expense.date <= end)

    q = q.group_by(Category.name)
    rows = q.all()
    return jsonify([{ "category": r[0], "total": float(r[1] or 0)} for r in rows])
