FROM python:3.12-slim
WORKDIR /app
# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copiar todo el backend
COPY . .
# Copiar el script de espera
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
# Exponer puerto Flask
# CMD que espera a Postgres antes de arrancar Flask
CMD ["sh", "-c", "/wait-for-it.sh postgres:5432 -- python app.py"]
