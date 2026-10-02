import logging
import os
import uuid

import cloudinary
import cloudinary.uploader

from werkzeug.utils import (
    secure_filename,
)


logger = logging.getLogger(__name__)


def _cloudinary_configured():
    """True when Cloudinary credentials are present in the environment."""
    if os.getenv("CLOUDINARY_URL"):
        return True
    return all(
        os.getenv(k)
        for k in (
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        )
    )


if _cloudinary_configured():
    if os.getenv("CLOUDINARY_URL"):
        # SDK reads CLOUDINARY_URL itself
        cloudinary.config(secure=True)
    else:
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True,
        )


class FileUploadService:

    ALLOWED_EXTENSIONS = {
        "png",
        "jpg",
        "jpeg",
        "webp",
    }

    MAX_FILE_SIZE = (
        5 * 1024 * 1024
    )

    @staticmethod
    def allowed_file(
        filename,
    ):

        return (
            "." in filename
            and
            filename.rsplit(
                ".",
                1,
            )[1].lower()
            in FileUploadService
            .ALLOWED_EXTENSIONS
        )

    @staticmethod
    def generate_filename(
        filename,
    ):

        extension = (
            filename.rsplit(
                ".",
                1,
            )[1]
            .lower()
        )

        return (
            f"{uuid.uuid4()}."
            f"{extension}"
        )

    @staticmethod
    def save_file(
        file,
        upload_folder,
    ):

        if not file:

            raise ValueError(
                "No file provided"
            )

        if (
            not FileUploadService
            .allowed_file(
                file.filename
            )
        ):

            raise ValueError(
                "Invalid file type"
            )

        original_name_for_cloud = secure_filename(file.filename)

        # ---- Preferred: Cloudinary (persistent, survives redeploys) ----
        if _cloudinary_configured():

            result = cloudinary.uploader.upload(
                file,
                folder="campusai",
                resource_type="image",
            )

            return {
                "filename": result.get("public_id"),
                "originalName": original_name_for_cloud,
                "filePath": None,
                # Exact, untouched Cloudinary HTTPS URL
                "fileUrl": result["secure_url"],
                "publicId": result.get("public_id"),
                "storage": "cloudinary",
            }

        # ---- Fallback (local development only, ephemeral on Render) ----
        logger.warning(
            "Cloudinary is not configured; saving upload to local disk."
        )

        os.makedirs(
            upload_folder,
            exist_ok=True,
        )

        original_name = (
            secure_filename(
                file.filename
            )
        )

        new_filename = (
            FileUploadService
            .generate_filename(
                original_name
            )
        )

        file_path = (
            os.path.join(
                upload_folder,
                new_filename,
            )
        )

        file.save(
            file_path
        )

        return {
            "filename":
            new_filename,

            "originalName":
            original_name,

            "filePath":
            file_path,

            "fileUrl":
            f"/uploads/"
            f"{new_filename}",

            "storage": "local",
        }

    @staticmethod
    def delete_file(
        file_path,
    ):

        if (
            file_path
            and
            os.path.exists(
                file_path
            )
        ):

            os.remove(
                file_path
            )

            return True

        return False