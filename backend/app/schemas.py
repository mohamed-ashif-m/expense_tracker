from .extensions import ma
from .models import User, Category, Expense

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",)

class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True

class ExpenseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Expense
        load_instance = True
    user = ma.Nested(UserSchema)
    category = ma.Nested(CategorySchema)
