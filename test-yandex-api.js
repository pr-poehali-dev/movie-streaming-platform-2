// Тестовый скрипт для проверки Yandex API
const API_KEY = "AQVN2NkwIbIbaxpzOt69x6LwHbW0awD-GGrOpvh4";
const FOLDER_ID = "b1gle8hanhvqojataqaq";
const ENDPOINT = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

async function testYandexAPI() {
  console.log("=== Тест Yandex API ===\n");
  console.log("Endpoint:", ENDPOINT);
  console.log("Folder ID:", FOLDER_ID);
  console.log("API Key:", API_KEY.substring(0, 10) + "...\n");

  const requestBody = {
    modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite/latest`,
    completionOptions: {
      stream: false,
      temperature: 0.6,
      maxTokens: 2000
    },
    messages: [
      {
        role: "user",
        text: "Расскажи кратко о фильме Матрица"
      }
    ]
  };

  console.log("Отправка запроса...\n");
  console.log("Тело запроса:", JSON.stringify(requestBody, null, 2));
  console.log("\n" + "=".repeat(60) + "\n");

  try {
    const startTime = Date.now();
    
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("РЕЗУЛЬТАТ ЗАПРОСА:\n");
    console.log("Статус код:", response.status);
    console.log("Статус текст:", response.statusText);
    console.log("Время выполнения:", duration + "ms");
    console.log("\nЗаголовки ответа:");
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const data = await response.json();
    
    console.log("\n" + "=".repeat(60));
    console.log("ТЕЛО ОТВЕТА:");
    console.log("=".repeat(60) + "\n");
    console.log(JSON.stringify(data, null, 2));
    console.log("\n" + "=".repeat(60) + "\n");

    if (response.ok) {
      console.log("✅ API РАБОТАЕТ УСПЕШНО!");
      
      if (data.result?.alternatives && data.result.alternatives.length > 0) {
        const text = data.result.alternatives[0].message?.text;
        console.log("\nОтвет от YandexGPT:");
        console.log("-".repeat(60));
        console.log(text);
        console.log("-".repeat(60));
      }

      if (data.result?.usage) {
        console.log("\nИспользование токенов:");
        console.log("  Входные токены:", data.result.usage.inputTextTokens);
        console.log("  Токены ответа:", data.result.usage.completionTokens);
        console.log("  Всего токенов:", data.result.usage.totalTokens);
      }
    } else {
      console.log("❌ ОШИБКА API!");
      
      if (data.error) {
        console.log("\nДетали ошибки:");
        console.log("  HTTP код:", data.error.httpCode);
        console.log("  HTTP статус:", data.error.httpStatus);
        console.log("  Сообщение:", data.error.message);
        console.log("  Код ошибки:", data.error.errorCode);
        console.log("  Тип ошибки:", data.error.errorType);
      }
    }

  } catch (error) {
    console.log("❌ ОШИБКА ВЫПОЛНЕНИЯ ЗАПРОСА!\n");
    console.error("Тип ошибки:", error.constructor?.name || typeof error);
    console.error("Сообщение:", error.message || String(error));
    
    if (error.stack) {
      console.error("\nСтек вызовов:");
      console.error(error.stack);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Тест завершен");
  console.log("=".repeat(60));
}

// Запуск теста
testYandexAPI();
