// Скрипт для тестирования GigaChat API через развернутую backend функцию

const BACKEND_URL = 'https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150';

async function testGigaChatAPI() {
    console.log('='.repeat(80));
    console.log('ТЕСТИРОВАНИЕ GIGACHAT API');
    console.log('='.repeat(80));
    
    try {
        console.log('\nОтправка запроса к backend функции...');
        console.log(`URL: ${BACKEND_URL}`);
        
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_secrets: [
                    "b54c49b7-df1c-45ce-a674-c40dac1ce101",
                    "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
                ],
                query: "Найди информацию о фильме 'Матрица'"
            })
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        
        console.log('\n' + '='.repeat(80));
        console.log('РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
        console.log('='.repeat(80));
        
        if (data.success && data.working_secret) {
            console.log('✓ УСПЕШНО!');
            console.log(`\nРабочий Client Secret: ${data.working_secret}`);
            console.log(`Маскированный: ${data.working_secret_masked}`);
            
            console.log('\n' + '-'.repeat(80));
            console.log('ДЕТАЛИ ТЕСТИРОВАНИЯ:');
            console.log('-'.repeat(80));
            
            data.results.forEach((result, index) => {
                console.log(`\n[${index + 1}] Client Secret: ${result.masked_secret}`);
                console.log(`    Статус: ${result.status}`);
                
                if (result.token_result) {
                    if (result.token_result.success) {
                        console.log(`    ✓ Токен получен`);
                        console.log(`      Expires at: ${result.token_result.expires_at}`);
                    } else {
                        console.log(`    ✗ Ошибка получения токена`);
                        console.log(`      Status: ${result.token_result.status_code}`);
                        console.log(`      Error: ${result.token_result.error}`);
                    }
                }
                
                if (result.api_result) {
                    if (result.api_result.success) {
                        console.log(`    ✓ API запрос успешен`);
                        console.log(`\n    ${'─'.repeat(76)}`);
                        console.log(`    ОТВЕТ GIGACHAT:`);
                        console.log(`    ${'─'.repeat(76)}`);
                        console.log(`    ${result.api_result.answer.replace(/\n/g, '\n    ')}`);
                        console.log(`    ${'─'.repeat(76)}`);
                        
                        if (result.api_result.usage) {
                            console.log(`    Использовано токенов: ${JSON.stringify(result.api_result.usage)}`);
                        }
                    } else {
                        console.log(`    ✗ Ошибка API запроса`);
                        console.log(`      Status: ${result.api_result.status_code}`);
                        console.log(`      Error: ${result.api_result.error}`);
                    }
                }
            });
            
        } else {
            console.log('✗ ОШИБКА!');
            console.log('\nНи один из Client Secret не работает');
            
            console.log('\n' + '-'.repeat(80));
            console.log('ДЕТАЛИ ОШИБОК:');
            console.log('-'.repeat(80));
            
            data.results.forEach((result, index) => {
                console.log(`\n[${index + 1}] Client Secret: ${result.masked_secret}`);
                console.log(`    Статус: ${result.status}`);
                
                if (result.token_result && !result.token_result.success) {
                    console.log(`    Ошибка токена:`);
                    console.log(`      ${result.token_result.error}`);
                }
                
                if (result.api_result && !result.api_result.success) {
                    console.log(`    Ошибка API:`);
                    console.log(`      ${result.api_result.error}`);
                }
            });
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('ИТОГОВАЯ СТАТИСТИКА');
        console.log('='.repeat(80));
        console.log(`Всего протестировано: ${data.summary.total_tested}`);
        console.log(`Работающих секретов: ${data.summary.working}`);
        console.log(`Запрос: ${data.summary.query}`);
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('\n✗ КРИТИЧЕСКАЯ ОШИБКА:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
    }
}

// Запускаем тест
testGigaChatAPI();
