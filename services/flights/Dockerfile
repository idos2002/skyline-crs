FROM python:3.10 AS export-requirements
WORKDIR /tmp

RUN pip install poetry~=1.1

COPY pyproject.toml poetry.lock* ./
RUN poetry export -f requirements.txt -o requirements.txt --without-hashes

FROM python:3.10-slim
WORKDIR /app

COPY --from=export-requirements /tmp/requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY flights .

CMD ["python", "main.py"]
