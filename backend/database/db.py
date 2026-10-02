from flask_sqlalchemy import SQLAlchemy

# -----------------------------------------------------------
# Shared SQLAlchemy instance.
#
# All models and services import `db` from this module so that
# there is a single SQLAlchemy() instance bound to the Flask app
# in app.py (via db.init_app(app)). This file was missing from
# the project even though every model/service/app.py referenced
# it, which caused the backend to fail immediately on startup
# with: ModuleNotFoundError: No module named 'database'
# -----------------------------------------------------------

db = SQLAlchemy()
