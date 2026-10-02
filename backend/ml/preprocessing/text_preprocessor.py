import re


class TextPreprocessor:
    @staticmethod
    def clean_text(text):
        if not text:
            return ""

        text = str(text).lower()

        text = re.sub(r"http\S+", "", text)

        text = re.sub(r"www\S+", "", text)

        text = re.sub(r"[^a-zA-Z\s]", " ", text)

        text = re.sub(r"\s+", " ", text)

        return text.strip()