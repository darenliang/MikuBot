FROM python:3.7-buster
COPY ./ ./
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y ffmpeg

CMD ["python", "client.py"]