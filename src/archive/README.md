# Archive & app faces

## Файлы

| Файл | Роль |
|------|------|
| `NovaDashboard.v1.onboarding.tsx` | Снимок «как было» до 2.0 |
| `BorisOnboarding.tsx` / `LoginPage.tsx` | Копии онбординга и логина |
| `../NovaDashboard.demo.tsx` | **Для рекрутера:** вход + Борис, пароль подставляется, онбординг можно пропустить |
| `../NovaDashboard.v2.tsx` | **Для доработки:** без пароля и без приветствия Бориса |

## Переключение

```bash
# разработка 2.0 (по умолчанию)
npm run dev

# демо для рекрутера локально
# PowerShell:
$env:VITE_APP_FACE="demo"; npm run dev
```

На Vercel: два проекта, в одном `VITE_APP_FACE=demo`, в другом `VITE_APP_FACE=v2` (или пусто).
