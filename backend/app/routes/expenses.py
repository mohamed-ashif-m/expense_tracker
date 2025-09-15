from flask import Blueprint, request, jsonify
from ..models import Expense, Category, User
from ..extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    user_id = get_jwt_identity()
    data = request.json
    amount = data.get('amount')
    category_id = data.get('category_id')
    date = data.get('date')  # expect YYYY-MM-DD
    description = data.get('description')
    # basic validation omitted
    expense = Expense(amount=amount, category_id=category_id, user_id=int(user_id), date=date, description=description)
    db.session.add(expense)
    db.session.commit()
    return jsonify({"id": expense.id}), 201

@expenses_bp.route('', methods=['GET'])
@jwt_required()
def list_expenses():
    try:
        current_user = get_jwt_identity()
        print(f"Getting expenses for user: {current_user}")
        
        expenses = Expense.query.filter_by(user_id=int(current_user)).order_by(Expense.date.desc()).all()
        
        result = []
        for e in expenses:
            result.append({
                "id": e.id,
                "amount": float(e.amount),
                "description": e.description,
                "category_id": e.category_id,
                "category_name": e.category.name if e.category else None,
                "date": e.date.isoformat(),
                "user_id": e.user_id
            })
        print(f"Returning {len(result)} expenses for user {current_user}")
        return jsonify(result)
    except Exception as ex:
        print(f"Error in list_expenses: {ex}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(ex)}), 422

@expenses_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_expense(id):
    current_user = get_jwt_identity()
    e = Expense.query.get_or_404(id)
    if e.user_id != int(current_user):
        return jsonify({"msg":"forbidden"}), 403
    data = request.json
    e.amount = data.get('amount', e.amount)
    e.description = data.get('description', e.description)
    e.category_id = data.get('category_id', e.category_id)
    e.date = data.get('date', e.date)
    db.session.commit()
    return jsonify({"msg":"ok"})

@expenses_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_expense(id):
    current_user = get_jwt_identity()
    e = Expense.query.get_or_404(id)
    if e.user_id != int(current_user):
        return jsonify({"msg":"forbidden"}), 403
    db.session.delete(e)
    db.session.commit()
    return jsonify({}), 204

@expenses_bp.route('/totals', methods=['GET'])
@jwt_required()
def get_expense_totals():
    current_user = get_jwt_identity()
    totals = db.session.query(
        Category.name,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        Expense.user_id == int(current_user)
    ).group_by(Category.name).all()
    
    result = {}
    for cat_name, total in totals:
        result[cat_name] = float(total)
    
    return jsonify(result)