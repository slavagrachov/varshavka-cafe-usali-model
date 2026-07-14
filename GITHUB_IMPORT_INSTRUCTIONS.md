# Публикация в GitHub

Целевой репозиторий:

`slavagrachov/varshavka-cafe-usali-model`

Видимость: `private`.

## Через GitHub Desktop

1. Создайте пустой private-репозиторий `slavagrachov/varshavka-cafe-usali-model` без README.
2. Клонируйте его в GitHub Desktop.
3. Скопируйте всё содержимое этого каталога в локальную папку репозитория.
4. Commit message: `chore: initialize operational financial model v0.1.0`.
5. Push to `main`.
6. Создайте Tag `v0.1.0`.
7. Создайте Release и приложите Excel-файл из `models/`.

## Через терминал

```bash
git init -b main
git add .
git commit -m "chore: initialize operational financial model v0.1.0"
git remote add origin git@github.com:slavagrachov/varshavka-cafe-usali-model.git
git push -u origin main
git tag v0.1.0
git push origin v0.1.0
```
