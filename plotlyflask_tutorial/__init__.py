"""Initialize Flask app."""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager

db = SQLAlchemy()
DB_NAME = 'database.db'

def init_app():
    """Construct core Flask application with embedded Dash app."""
    app = Flask(__name__, instance_relative_config=False)
    app.config['SECRET_KEY'] = 'AK ndaJK NJN CAJN'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    from plotlyflask_tutorial.auth import auth

    app.register_blueprint(auth, url_prefix='/')

    from plotlyflask_tutorial.models import User, Note
    create_database(app)

    

    with app.app_context():
        from . import routes

        from .routes import init_dashboard
        app = init_dashboard(app)

        login_manager = LoginManager()
        login_manager.login_message = False
        login_manager.login_view = '/log-in'
        login_manager.init_app(app)

        @login_manager.user_loader
        def load_user(id):
            return User.query.get(id)

        return app

def create_database(app):
    if not path.exists('website/' + DB_NAME):
        db.create_all(app=app)
        print('Created Database!')