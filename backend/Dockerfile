# Base
FROM python:3.10-slim

# Env
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE config.settings

# Workdir
WORKDIR /app

# Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary

# Code
COPY . .

# Entrypoint
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
