from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
)


class JWTHelper:
    @staticmethod
    def generate_tokens(user):
        """
        Generate access and refresh tokens.
        """

        claims = {
            "role": user.role,
        }

        # NOTE: identity must be a string. The installed PyJWT version
        # enforces that the "sub" claim is a string and raises
        # InvalidSubjectError("Subject must be a string") otherwise,
        # which flask-jwt-extended surfaces as a generic "invalid token"
        # error on every protected route (register/login would still
        # succeed, but every @jwt_required() endpoint, i.e. all
        # dashboards, would 401). Callers must convert back with
        # int(get_jwt_identity()) when they need the numeric user id.
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=claims,
        )

        refresh_token = create_refresh_token(
            identity=str(user.id),
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }


def generate_token(user):
    """
    Generate a single JWT access token for a user.

    routes/auth_routes.py expects a `generate_token(user)` function
    that returns one token string (it does `token = generate_token(user)`
    and sends `{"token": token}` to the frontend, which reads
    `data.token` in Login.jsx). Only JWTHelper.generate_tokens()
    existed before, so the import was failing at startup.
    """
    return JWTHelper.generate_tokens(user)["access_token"]