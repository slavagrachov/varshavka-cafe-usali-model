# Пользовательская инструкция по публикации файлов в GitHub

## 1. Однократная установка

Откройте Terminal в локальной копии репозитория и выполните:

```bash
cd scripts/github-artifacts
./install-macos.sh
source ~/.zprofile
```

Контроль:

```bash
publish-github-artifact --self-test
```

Успешный результат заканчивается строкой `PUBLICATION_RESULT=PASS`.

## 2. Обычная публикация

1. Утвердите файл в рабочей сессии.
2. Скачайте файл в папку `Downloads`.
3. Выполните одну команду, выданную агентом:

```bash
publish-github-artifact issue-98
```

Программа сама найдёт файл, проверит его, подготовит ветку, commit, push и draft PR, затем скачает опубликованный файл из exact head SHA и выполнит побайтовое сравнение.

## 3. Отдельная проверка

```bash
verify-github-artifact issue-98
```

Для проверки конкретного commit:

```bash
verify-github-artifact issue-98 <commit-SHA>
```

## 4. Merge и закрытие Issue

Команда допустима только после письменного разрешения владельца и обновления карточки агентом:

```bash
complete-github-artifact issue-98
```

Она проверяет согласованный head SHA, переводит PR из draft в ready, выполняет squash merge, проверяет файл в новом SHA `main` и только после PASS закрывает Issue как `completed`.

## 5. Как читать результат

Успех:

```text
PUBLICATION_RESULT=PASS
```

Блокировка:

```text
PUBLICATION_RESULT=BLOCKED
ПРОБЛЕМА: <простое объяснение>
ЧТО СДЕЛАТЬ: <одно конкретное действие>
```

Технический журнал сохраняется отдельно. Передавать длинный вывод в ChatGPT не требуется; достаточно сообщить строку `ПРОБЛЕМА` или путь к журналу.
