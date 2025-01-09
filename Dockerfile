FROM node:22

# ワークディレクトリを指定
WORKDIR /usr/src

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# ソースコードをコンテナにコピー
COPY /app /usr/src