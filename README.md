## 環境構築
1. イメージのビルド

    ```bash
    docker compose build
    ```

1. コンテナの起動

    ```bash
    docker compose up -d
    ```

1. 依存関係のインストール

    ```bash
    docker compose exec app bash -c "npm install"
    ```

1. 従業員検索 migration実行

    ```bash
    docker compose exec app bash -c "node src/migration.js"
    ```

1. 従業員検索 CLI起動

    ```bash
    docker compose exec app bash -c "node src/index.js"
    ```