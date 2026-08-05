# Пользовательская инструкция по публикации файлов в GitHub

## 1. Однократная установка

Откройте Terminal и выполните из локальной копии репозитория:

```bash
cd "$HOME/varshavka-cafe-usali-model"
git checkout agent/issue-100-github-artifact-publication
git pull origin agent/issue-100-github-artifact-publication
bash scripts/github-artifacts/install-macos.sh
source "$HOME/.zprofile"
```

Контроль:

```bash
publish-github-artifact --self-test
```

Успешный результат:

```text
VERSION=<версия>
PUBLICATION_RESULT=PASS
```

Установщик создаёт обычные исполняемые команды в `$HOME/bin`. Повторная установка безопасна: прежние wrapper-файлы или символические ссылки удаляются перед созданием новых.

## 2. Обычная публикация

1. Утвердите файл в рабочей сессии ChatGPT.
2. Скачайте файл в папку `Downloads`.
3. Выполните одну команду, выданную агентом:

```bash
publish-github-artifact issue-98
```

Программа сама:

- находит файл;
- проверяет формат и целостность;
- находит или клонирует репозиторий;
- подключает существующую remote tracking branch либо создаёт новую рабочую ветку;
- создаёт commit и push;
- создаёт или обновляет draft PR;
- получает опубликованный Git blob из exact head SHA;
- выполняет побайтовое сравнение, SHA-256 и Git blob SHA.

Успешный результат содержит:

```text
ISSUE=<номер>
PR=<номер>
HEAD_SHA=<exact SHA>
SIZE=<размер>
SHA256=<SHA-256>
GIT_BLOB_SHA=<blob SHA>
PUBLICATION_RESULT=PASS
```

## 3. Отдельная проверка

Проверка текущего head SHA рабочего PR:

```bash
verify-github-artifact issue-98
```

Проверка конкретного неизменяемого commit:

```bash
verify-github-artifact issue-98 <commit-SHA>
```

Для бинарных и текстовых файлов применяется один binary-safe маршрут через Git blob SHA.

## 4. Merge и закрытие Issue

Команда допустима только после письменного разрешения владельца и обновления карточки агентом:

```bash
complete-github-artifact issue-98
```

Она проверяет согласованный head SHA, переводит PR из draft в ready, выполняет merge, проверяет файл в новом SHA `main` и только после PASS закрывает Issue как `completed`.

До Owner/Merge Gate эту команду не запускать.

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

Технический журнал сохраняется в `${TMPDIR:-/tmp}/github-artifacts-logs/`.

## 6. Если команда кажется зависшей

Установщик и рабочие команды обязаны показывать этап либо итоговый статус. Если вывода нет продолжительное время:

1. остановите процесс сочетанием `Control + C`;
2. не редактируйте программы вручную;
3. передайте в ChatGPT последнюю видимую строку и путь к журналу;
4. дождитесь исправления в рабочей ветке;
5. выполните выданную короткую команду повторно.

## 7. Проверенная среда

Натурная проверка выполнена 5 августа 2026 года на macOS со штатным Bash 3.2, GitHub CLI и аккаунтом `slavagrachov`.

Подтверждены:

- установка и PATH;
- функциональный self-test;
- публикация Markdown;
- публикация ZIP;
- exact head SHA;
- размер, SHA-256 и Git blob SHA;
- сохранение испытательных PR в draft.
