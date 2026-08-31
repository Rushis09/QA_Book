import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv


load_dotenv()


class StorageService:
    """Handles file operations with Neon Object Storage."""

    def __init__(self):
        endpoint = os.getenv("AWS_ENDPOINT_URL_S3")
        access_key = os.getenv("AWS_ACCESS_KEY_ID")
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        region = os.getenv("AWS_REGION")
        bucket = os.getenv("AWS_S3_BUCKET")

        if not endpoint:
            raise ValueError(
                "AWS_ENDPOINT_URL_S3 not configured."
            )

        if not access_key:
            raise ValueError(
                "AWS_ACCESS_KEY_ID not configured."
            )

        if not secret_key:
            raise ValueError(
                "AWS_SECRET_ACCESS_KEY not configured."
            )

        if not region:
            raise ValueError(
                "AWS_REGION not configured."
            )

        if not bucket:
            raise ValueError(
                "AWS_S3_BUCKET not configured."
            )

        self.bucket = bucket

        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )

    def upload_file(
        self,
        file_content: bytes,
        storage_key: str,
        content_type: str,
    ) -> None:
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=storage_key,
                Body=file_content,
                ContentType=content_type,
            )

        except (BotoCoreError, ClientError) as error:
            raise RuntimeError(
                f"File upload failed: {error}"
            ) from error

    def download_file(
        self,
        storage_key: str,
    ) -> bytes:
        try:
            response = self.client.get_object(
                Bucket=self.bucket,
                Key=storage_key,
            )

            return response["Body"].read()

        except (BotoCoreError, ClientError) as error:
            raise RuntimeError(
                f"File download failed: {error}"
            ) from error

    def delete_file(
        self,
        storage_key: str,
    ) -> None:
        try:
            self.client.delete_object(
                Bucket=self.bucket,
                Key=storage_key,
            )

        except (BotoCoreError, ClientError) as error:
            raise RuntimeError(
                f"File deletion failed: {error}"
            ) from error