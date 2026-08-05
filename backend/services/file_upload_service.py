import os
import uuid

from werkzeug.utils import (
    secure_filename,
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