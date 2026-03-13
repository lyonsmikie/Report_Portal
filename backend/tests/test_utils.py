import os

def test_generate_excel_report(tmp_path):
    from app import utils
    data = [{"a": 1}, {"a": 2}]
    path = tmp_path / "out.xlsx"
    utils.generate_excel_report(data, str(path))
    assert path.exists()


def test_generate_pdf_report(tmp_path, monkeypatch):
    from app import utils
    called = {}

    def fake_from_string(content, path):
        called["args"] = (content, path)
        open(path, "wb").write(b"")

    monkeypatch.setattr(utils.pdfkit, "from_string", fake_from_string)
    path = tmp_path / "out.pdf"
    utils.generate_pdf_report("<p>x</p>", str(path))
    assert path.exists()
