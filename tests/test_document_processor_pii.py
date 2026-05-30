from app.services.document_processor import DocumentProcessor


def test_roll_number_is_not_flagged_as_credit_card():
    text = "Roll No: 4111 1111 1111 1111\nStudent name: Example Student"

    warnings = DocumentProcessor.detect_sensitive_data(text)

    assert not any("Credit Card Number" in warning for warning in warnings)


def test_registration_number_is_not_flagged_by_numeric_length():
    text = "Registration Number: 2023123456789012\nProgram: Computer Science"

    warnings = DocumentProcessor.detect_sensitive_data(text)

    assert not any("Credit Card Number" in warning for warning in warnings)


def test_luhn_valid_credit_card_is_flagged():
    text = "Credit Card Number: 4111 1111 1111 1111"

    warnings = DocumentProcessor.detect_sensitive_data(text)

    assert any("Potential Credit Card Number" in warning for warning in warnings)


def test_luhn_invalid_card_length_number_is_not_flagged():
    text = "Reference: 4111 1111 1111 1112"

    warnings = DocumentProcessor.detect_sensitive_data(text)

    assert not any("Credit Card Number" in warning for warning in warnings)


def test_existing_email_detection_still_runs():
    text = "Contact: student@example.edu"

    warnings = DocumentProcessor.detect_sensitive_data(text)

    assert any("Potential Email Address" in warning for warning in warnings)
