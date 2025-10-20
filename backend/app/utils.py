# utils.py
import pandas as pd
import pdfkit
from datetime import datetime

def generate_excel_report(data, file_path):
    df = pd.DataFrame(data)
    df.to_excel(file_path, index=False)

def generate_pdf_report(html_content, file_path):
    pdfkit.from_string(html_content, file_path)
