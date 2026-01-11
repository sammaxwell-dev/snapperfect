# Fashion Motion Video Fix - Implementation Plan

**Branch**: `002-fashion-motion-fix`  
**Created**: 2026-01-11

## Описание проблемы

Текущая реализация `/api/fashion-motion` не работает - видео не генерируется или генерируется в формате, который не воспроизводится в браузере. 

### Причина
Согласно [официальной документации Veo 3.1](https://ai.google.dev/gemini-api/docs/video), для получения сгенерированного видео нужно использовать метод `ai.files.download()`. Текущая реализация пытается:
1. Читать `videoBytes` напрямую (устаревший/нерабочий метод)
2. Скачивать по `uri` 
3. Скачивать через REST endpoint

Всё это не соответствует официальному API.

## User Review Required

> [!IMPORTANT]
> Требуется подтверждение того, что `ai.files.download()` работает корректно в серверном окружении Next.js. По документации метод принимает `downloadPath`, что предполагает запись в файловую систему - это может не работать на serverless платформах типа Vercel.

---

## Proposed Changes

### Backend API

#### [MODIFY] [route.ts](file:///Users/dwhitewolf/Work/MVP/snapperfect/app/api/fashion-motion/route.ts)

Полностью переписываем логику получения видео:

1. **Заменить методы получения видео** на официальный `ai.files.download()`:
   ```typescript
   // Вместо текущих методов 1-3
   // Используем официальный метод
   const videoFile = operation.response.generatedVideos[0].video;
   
   // Получаем видео через download endpoint
   const downloadResponse = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/files/${videoFile.name}?alt=media&key=${apiKey}`
   );
   const videoBuffer = await downloadResponse.arrayBuffer();
   const videoBase64 = Buffer.from(videoBuffer).toString('base64');
   ```

2. **Добавить обработку ошибок download**:
   - Проверка HTTP статуса
   - Retry при временных ошибках
   - Логирование для дебага

3. **Оптимизировать таймауты**:
   - Увеличить maxPolls до 60 (10 минут) для длинных видео
   - Добавить более детальный logging

---

## Verification Plan

### Manual Verification

**Шаги ручного тестирования** (выполняет пользователь):

1. Открыть `http://localhost:3000/fashion-motion`
2. Загрузить фото модели в одежде (JPEG или PNG)
3. Выбрать aspect ratio 9:16 и duration 6s
4. Нажать "Generate Motion Video"
5. Дождаться генерации (1-5 минут)
6. **Ожидаемый результат**: Видео отображается в preview плеере
7. Нажать Play - видео должно воспроизвестись
8. Нажать Download - MP4 файл должен скачаться и воспроизводиться локально

### Console Verification

Во время генерации в консоли (`npm run dev`) должны появляться логи:
```
[Fashion Motion] Polling video generation status... (1/60)
[Fashion Motion] Video generation completed
[Fashion Motion] Downloading video from: files/...
[Fashion Motion] Video downloaded successfully, size: XXXXX bytes
[Fashion Motion] Returning video, mimeType: video/mp4
```

### Fallback Check

Если `ai.files.download()` не работает в serverless, проверить альтернативу через REST API напрямую.
