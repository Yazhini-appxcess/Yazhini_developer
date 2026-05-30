import io
import logging
from typing import Optional
import PyPDF2
import pdfplumber
from docx import Document as DocxDocument
import openpyxl
from pptx import Presentation
import chardet

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Service for extracting text from various document types"""

    @staticmethod
    def extract_text(file_bytes: bytes, mime_type: str, file_name: str = "") -> Optional[str]:
        """
        Extract text from document bytes based on MIME type.
        Supports: PDF, Word, Excel, PowerPoint, and text files.
        """
        try:
            # PDF files
            if mime_type == "application/pdf":
                return DocumentProcessor._extract_from_pdf(file_bytes)

            # Word documents (.docx)
            elif mime_type in [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword"
            ]:
                return DocumentProcessor._extract_from_word(file_bytes)

            # Excel files (.xlsx, .xls)
            elif mime_type in [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel"
            ]:
                return DocumentProcessor._extract_from_excel(file_bytes)

            # PowerPoint files (.pptx, .ppt)
            elif mime_type in [
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-powerpoint"
            ]:
                return DocumentProcessor._extract_from_powerpoint(file_bytes)

            # Text files
            elif mime_type.startswith("text/"):
                return DocumentProcessor._extract_from_text(file_bytes)

            # Try to detect and process as text if unknown
            else:
                logger.warning(f"Unknown MIME type {mime_type}, attempting text extraction")
                return DocumentProcessor._extract_from_text(file_bytes)

        except Exception as e:
            logger.error(f"Error extracting text from {file_name} (type: {mime_type}): {e}")
            return None

    @staticmethod
    def _extract_from_pdf(pdf_bytes: bytes) -> Optional[str]:
        """Extract text from PDF files"""
        try:
            # Try pdfplumber first (better text extraction)
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                text_parts = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}, trying PyPDF2")
            try:
                # Fallback to PyPDF2
                pdf_file = io.BytesIO(pdf_bytes)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                text_parts = []
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return "\n\n".join(text_parts)
            except Exception as e2:
                logger.error(f"PyPDF2 extraction also failed: {e2}")
                return None

    @staticmethod
    def _extract_from_word(docx_bytes: bytes) -> Optional[str]:
        """Extract text from Word documents (.docx)"""
        try:
            doc = DocxDocument(io.BytesIO(docx_bytes))
            text_parts = []

            # Extract paragraphs
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)

            # Extract tables
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        text_parts.append(row_text)

            return "\n\n".join(text_parts) if text_parts else None
        except Exception as e:
            logger.error(f"Error extracting from Word document: {e}")
            return None

    @staticmethod
    def _extract_from_excel(xlsx_bytes: bytes) -> Optional[str]:
        """Extract text from Excel files (.xlsx)"""
        try:
            workbook = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=True)
            text_parts = []

            for sheet_name in workbook.sheetnames:
                sheet = workbook[sheet_name]
                text_parts.append(f"\n--- Sheet: {sheet_name} ---\n")

                for row in sheet.iter_rows(values_only=True):
                    row_text = " | ".join([str(cell) if cell is not None else "" for cell in row])
                    if row_text.strip():
                        text_parts.append(row_text)

            return "\n".join(text_parts) if text_parts else None
        except Exception as e:
            logger.error(f"Error extracting from Excel file: {e}")
            return None

    @staticmethod
    def _extract_from_powerpoint(pptx_bytes: bytes) -> Optional[str]:
        """Extract text from PowerPoint files (.pptx)"""
        try:
            prs = Presentation(io.BytesIO(pptx_bytes))
            text_parts = []

            for slide_num, slide in enumerate(prs.slides, 1):
                text_parts.append(f"\n--- Slide {slide_num} ---\n")

                # Extract text from shapes
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        text_parts.append(shape.text)

            return "\n".join(text_parts) if text_parts else None
        except Exception as e:
            logger.error(f"Error extracting from PowerPoint file: {e}")
            return None

    @staticmethod
    def _extract_from_text(text_bytes: bytes) -> Optional[str]:
        """Extract text from text files (with encoding detection)"""
        try:
            # Detect encoding
            detected = chardet.detect(text_bytes)
            encoding = detected.get("encoding", "utf-8")

            # Try to decode
            try:
                return text_bytes.decode(encoding)
            except (UnicodeDecodeError, LookupError):
                # Fallback to utf-8 with error handling
                return text_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error extracting from text file: {e}")
            return None

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[dict]:
        """
        Split text into chunks with overlap.
        Returns list of dicts with 'text', 'index', 'start_char', and 'end_char' keys.
        """
        if not text:
            return []

        chunks = []
        start = 0
        index = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                last_period = chunk_text.rfind('.')
                last_newline = chunk_text.rfind('\n')
                break_point = max(last_period, last_newline)

                if break_point > chunk_size * 0.5:  # Only break if we're at least halfway
                    chunk_text = chunk_text[:break_point + 1]
                    end = start + break_point + 1

            chunks.append({
                'text': chunk_text.strip(),
                'index': index,
                'start_char': start,
                'end_char': end
            })

            start = end - chunk_overlap  # Overlap for context
            index += 1

        return chunks

    @staticmethod
    def _passes_luhn_check(value: str) -> bool:
        digits = [int(char) for char in value if char.isdigit()]
        if not 13 <= len(digits) <= 19:
            return False

        checksum = 0
        parity = len(digits) % 2
        for index, digit in enumerate(digits):
            if index % 2 == parity:
                digit *= 2
                if digit > 9:
                    digit -= 9
            checksum += digit
        return checksum % 10 == 0

    @staticmethod
    def _has_institutional_identifier_context(context: str) -> bool:
        import re

        institutional_keywords = [
            r"\broll\s*(?:no\.?|number)\b",
            r"\bregister\s*(?:no\.?|number)\b",
            r"\bregistration\s*(?:no\.?|number)\b",
            r"\bstudent\s*id\b",
            r"\bemployee\s*id\b",
            r"\buniversity\s*id\b",
            r"\bcandidate\s*id\b",
            r"\bapplication\s*(?:no\.?|number)\b",
        ]
        return any(re.search(pattern, context, re.IGNORECASE) for pattern in institutional_keywords)

    @staticmethod
    def _has_payment_card_context(context: str) -> bool:
        import re

        payment_keywords = [
            r"credit\s*card",
            r"debit\s*card",
            r"card\s*(?:number|no)",
            r"payment\s*card",
            r"\bcvv\b",
            r"\bcvc\b",
            r"\bvisa\b",
            r"\bmastercard\b",
            r"\bamex\b",
            r"american\s*express",
        ]
        return any(re.search(pattern, context, re.IGNORECASE) for pattern in payment_keywords)

    @staticmethod
    def _is_credit_card_match(line: str, start: int, end: int, candidate: str) -> bool:
        context_start = max(0, start - 60)
        context_end = min(len(line), end + 60)
        context = line[context_start:context_end]

        if (
            DocumentProcessor._has_institutional_identifier_context(context)
            and not DocumentProcessor._has_payment_card_context(context)
        ):
            return False

        return DocumentProcessor._passes_luhn_check(candidate)

    @staticmethod
    def detect_sensitive_data(text: str) -> list[str]:
        """
        Detect sensitive data (PII, secrets) in text.
        Returns a list of warning messages with the detected content context.
        """
        import re
        warnings = []
        
        # Patterns for sensitive data
        patterns = {
            "Email Address": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            "Social Security Number (SSN)": r'\b\d{3}-\d{2}-\d{4}\b',
            "API Key / Secret": r'(?i)(?:api[_-]?key|secret[_-]?key|access[_-]?token)[\s:=]+([a-zA-Z0-9_\-]{20,})',
            # "Phone Number": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b' # Too many false positives often
        }
        credit_card_pattern = r'(?<!\d)(?:\d[ -]?){13,19}(?!\d)'
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            for label, pattern in patterns.items():
                matches = re.finditer(pattern, line)
                for match in matches:
                    # Provide snippet context
                    start = max(0, match.start() - 20)
                    end = min(len(line), match.end() + 20)
                    snippet = line[start:end].strip()
                    warnings.append(f"Line {i+1}: Potential {label} detected: '...{snippet}...'")

            for match in re.finditer(credit_card_pattern, line):
                if not DocumentProcessor._is_credit_card_match(line, match.start(), match.end(), match.group()):
                    continue
                start = max(0, match.start() - 20)
                end = min(len(line), match.end() + 20)
                snippet = line[start:end].strip()
                warnings.append(f"Line {i+1}: Potential Credit Card Number detected: '...{snippet}...'")
                    
        # Limit total warnings to avoid overwhelming response
        return warnings[:10]

