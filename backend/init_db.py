#!/usr/bin/env python3
"""
Database initialization script
"""
from app import create_app
from app.extensions import db
from app.models import Category

def init_database():
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if categories already exist
        if Category.query.count() == 0:
            # Create default categories
            default_categories = [
                'Food & Dining',
                'Transportation', 
                'Entertainment',
                'Shopping',
                'Health & Fitness',
                'Bills & Utilities',
                'Other'
            ]
            
            for category_name in default_categories:
                category = Category(name=category_name)
                db.session.add(category)
            
            db.session.commit()
            print(f"Created {len(default_categories)} default categories")
        else:
            print(f"Database already has {Category.query.count()} categories")

if __name__ == '__main__':
    init_database()