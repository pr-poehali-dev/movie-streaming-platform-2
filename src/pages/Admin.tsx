import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/1a8978cb-79fe-4881-b0c8-f6cbaf78bbb2';
const AI_SEARCH_URL = 'https://functions.poehali.dev/f7697e93-53cc-4169-903e-a3802bb3a196';
const GENERATE_POSTER_URL = 'https://functions.poehali.dev/56d47e39-a967-438f-9162-0ac0a8e6be40';
const TEST_GIGACHAT_URL = 'https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150';

const Admin = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isTestingGigaChat, setIsTestingGigaChat] = useState(false);
  const [gigaChatTestResult, setGigaChatTestResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    rating: '',
    year: '',
    type: 'movie',
    image_url: '',
    video_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rating: parseFloat(formData.rating) || 0,
          year: parseInt(formData.year) || new Date().getFullYear(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Контент добавлен в базу данных',
        });
        setFormData({
          title: '',
          description: '',
          genre: '',
          rating: '',
          year: '',
          type: 'movie',
          image_url: '',
          video_url: '',
        });
      } else {
        throw new Error(data.error || 'Ошибка при добавлении контента');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить контент',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название для поиска',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`${AI_SEARCH_URL}?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok && data.title) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          genre: data.genre || '',
          rating: data.rating?.toString() || '',
          year: data.year?.toString() || '',
          type: data.type || 'movie',
          image_url: '',
          video_url: '',
        });
        toast({
          title: 'Найдено!',
          description: `Информация о "${data.title}" загружена. Добавьте URL изображения и видео.`,
        });
      } else {
        toast({
          title: 'Не найдено',
          description: 'ИИ не смог найти информацию. Попробуйте другое название или заполните вручную.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить поиск',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeneratePoster = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Сначала заполните название',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPoster(true);

    try {
      const response = await fetch(GENERATE_POSTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
        }),
      });

      const data = await response.json();

      if (response.ok && data.image_url) {
        setFormData(prev => ({ ...prev, image_url: data.image_url }));
        toast({
          title: 'Постер создан!',
          description: 'ИИ сгенерировал постер для фильма',
        });
      } else {
        throw new Error(data.error || 'Не удалось сгенерировать постер');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать постер',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleTestGigaChat = async () => {
    setIsTestingGigaChat(true);
    setGigaChatTestResult(null);

    try {
      const response = await fetch(TEST_GIGACHAT_URL, {
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
        }),
      });

      const data = await response.json();
      setGigaChatTestResult(data);

      if (data.success && data.working_secret) {
        toast({
          title: 'Успешно!',
          description: `GigaChat API работает! Рабочий секрет: ${data.working_secret_masked}`,
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Ни один Client Secret не работает. Проверьте результаты ниже.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить тест',
        variant: 'destructive',
      });
      setGigaChatTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTestingGigaChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold gradient-red-purple bg-clip-text text-transparent">
              АДМИН-ПАНЕЛЬ
            </h1>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="Home" size={18} />
              <span className="ml-2">На главную</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 mb-6 bg-blue-500/10 border-blue-500/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Settings" size={24} className="text-blue-500" />
              <h3 className="text-xl font-bold">Тестирование GigaChat API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Проверьте работоспособность Client Secret для GigaChat API
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleTestGigaChat}
                disabled={isTestingGigaChat}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isTestingGigaChat ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    <span className="ml-2">Тестирование...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Play" size={18} />
                    <span className="ml-2">Запустить тест</span>
                  </>
                )}
              </Button>
            </div>

            {gigaChatTestResult && (
              <div className="mt-4 space-y-3">
                {gigaChatTestResult.success && gigaChatTestResult.working_secret ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="CheckCircle2" size={20} className="text-green-500" />
                      <span className="font-bold text-green-500">API работает!</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Рабочий Client Secret: <code className="bg-background/50 px-2 py-1 rounded">{gigaChatTestResult.working_secret}</code></p>
                      <p>Маскированный: {gigaChatTestResult.working_secret_masked}</p>
                    </div>
                    
                    {gigaChatTestResult.results?.[0]?.api_result?.answer && (
                      <div className="mt-3 p-3 bg-background/50 rounded">
                        <p className="font-semibold mb-1">Ответ GigaChat:</p>
                        <p className="text-sm whitespace-pre-wrap">{gigaChatTestResult.results[0].api_result.answer}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="XCircle" size={20} className="text-red-500" />
                      <span className="font-bold text-red-500">API не работает</span>
                    </div>
                    <div className="text-sm space-y-2">
                      {gigaChatTestResult.results?.map((result: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background/50 rounded">
                          <p className="font-medium">Client Secret {idx + 1}: {result.masked_secret}</p>
                          <p className="text-muted-foreground">Статус: {result.status}</p>
                          {result.token_result && !result.token_result.success && (
                            <p className="text-red-400 text-xs mt-1">Ошибка токена: {result.token_result.error}</p>
                          )}
                          {result.api_result && !result.api_result.success && (
                            <p className="text-red-400 text-xs mt-1">Ошибка API: {result.api_result.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Добавить контент</h2>
            <p className="text-muted-foreground">
              Используйте ИИ-поиск или заполните форму вручную
            </p>
          </div>

          <Card className="p-6 mb-6 gradient-purple-pink">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sparkles" size={24} className="text-white" />
                <h3 className="text-xl font-bold text-white">ИИ-Поиск контента</h3>
              </div>
              <p className="text-white/90 text-sm">
                Введите название фильма или сериала, и ИИ автоматически найдёт всю информацию
              </p>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: Начало, Игра престолов, Друзья..."
                  className="bg-white text-black"
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                />
                <Button
                  type="button"
                  onClick={handleAISearch}
                  disabled={isSearching}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {isSearching ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      <span className="ml-2">Поиск...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Search" size={18} />
                      <span className="ml-2">Найти</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Введите название или используйте ИИ-поиск выше"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Краткое описание содержания"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Тип контента *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Фильм</SelectItem>
                    <SelectItem value="series">Сериал</SelectItem>
                    <SelectItem value="tv">ТВ-канал</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Жанр *</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => handleChange('genre', e.target.value)}
                  placeholder="Например: Фантастика"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rating">Рейтинг (0-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                  placeholder="8.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Год *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  placeholder="2024"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="image_url">URL изображения (постер)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePoster}
                  disabled={isGeneratingPoster || !formData.title}
                  className="gap-2"
                >
                  {isGeneratingPoster ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={16} />
                      Сгенерировать постер
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/poster.jpg или сгенерируйте через ИИ"
              />
              {formData.image_url && (
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <img
                    src={formData.image_url}
                    alt="Предпросмотр"
                    className="max-h-48 mx-auto rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL видео / стрима</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://example.com/video.mp4 или https://stream.example.com/live"
              />
              <p className="text-sm text-muted-foreground">
                Для ТВ-каналов укажите URL прямой трансляции (HLS, RTMP)
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 gradient-red-purple"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span className="ml-2">Добавление...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={20} />
                    <span className="ml-2">Добавить контент</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setFormData({
                  title: '',
                  description: '',
                  genre: '',
                  rating: '',
                  year: '',
                  type: 'movie',
                  image_url: '',
                  video_url: '',
                })}
              >
                Очистить
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 mt-8 bg-accent/10 border-accent">
          <div className="flex gap-4">
            <Icon name="Sparkles" size={24} className="text-accent flex-shrink-0 mt-1" />
            <div className="w-full">
              <h3 className="font-semibold mb-3 text-lg">🤖 ИИ-возможности от Сбера (GigaChat + Kandinsky)</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Что умеет ИИ:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✨ <strong>Умный поиск:</strong> GigaChat найдёт всю информацию о фильме по названию</li>
                    <li>🎨 <strong>Постеры:</strong> Kandinsky автоматически сгенерирует уникальный постер</li>
                    <li>📹 Для видео используйте прямые ссылки на .mp4, .webm или HLS-потоки (.m3u8)</li>
                    <li>🇷🇺 <strong>Работает в России</strong> без VPN и блокировок!</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">📋 Подробная инструкция по настройке (3 минуты):</h4>
                  <ol className="text-sm text-muted-foreground space-y-4">
                    <li>
                      <strong className="text-foreground">Шаг 1. Откройте сайт GigaChat</strong>
                      <br />
                      <div className="mt-1 space-y-1">
                        • Перейдите на <a href="https://developers.sber.ru/studio/workspaces" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">developers.sber.ru/studio/workspaces</a>
                        <br />
                        • Нажмите <strong>"Войти"</strong> в правом верхнем углу
                        <br />
                        • Войдите через <strong>Сбер ID</strong> (можно создать новый, если нет)
                      </div>
                    </li>
                    
                    <li>
                      <strong className="text-foreground">Шаг 2. Создайте проект</strong>
                      <br />
                      <div className="mt-1 space-y-1">
                        • После входа нажмите <strong>"Создать проект"</strong> (большая зелёная кнопка)
                        <br />
                        • Придумайте любое название (например, "Мой IPTV плеер")
                        <br />
                        • Нажмите <strong>"Создать"</strong> — проект появится в списке
                      </div>
                    </li>

                    <li>
                      <strong className="text-foreground">Шаг 3. Получите Client Secret</strong>
                      <br />
                      <div className="mt-1 space-y-1">
                        • Откройте созданный проект (кликните по названию)
                        <br />
                        • Перейдите на вкладку <strong>"Авторизационные данные"</strong> (слева в меню)
                        <br />
                        • Нажмите <strong>"Создать авторизационные данные"</strong>
                        <br />
                        • В поле "Название" напишите что угодно (например, "API ключ")
                        <br />
                        • <strong className="text-accent">Срок действия:</strong> выберите <strong>"Без ограничения"</strong> (чтобы не переделывать)
                        <br />
                        • Нажмите <strong>"Создать"</strong>
                      </div>
                    </li>

                    <li>
                      <strong className="text-foreground">Шаг 4. Скопируйте Client Secret</strong>
                      <br />
                      <div className="mt-1 space-y-1">
                        • После создания появится окно с <strong>Client Secret</strong>
                        <br />
                        • Это длинная строка вида: <code className="bg-background/50 px-1 rounded text-xs">NmYwM2RmZmItZGY2Zi00ZjQyLWE3...</code>
                        <br />
                        • <strong className="text-red-500">⚠️ ВАЖНО:</strong> Скопируйте её СРАЗУ! Потом не сможете посмотреть
                        <br />
                        • Нажмите на кнопку <strong>"Скопировать"</strong> рядом с ключом
                      </div>
                    </li>

                    <li>
                      <strong className="text-foreground">Шаг 5. Добавьте ключ в проект</strong>
                      <br />
                      <div className="mt-1 space-y-1">
                        • В редакторе poehali.dev откройте вкладку <strong>"Секреты"</strong> (верхнее меню)
                        <br />
                        • Найдите секрет с названием <code className="bg-background/50 px-1 rounded">GIGACHAT_CLIENT_SECRET</code>
                        <br />
                        • Нажмите <strong>"Добавить значение"</strong>
                        <br />
                        • Вставьте скопированный <strong>Client Secret</strong>
                        <br />
                        • Нажмите <strong>"Сохранить"</strong>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="border-t pt-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-foreground">
                      ✅ <strong>Готово!</strong> После добавления Client Secret все ИИ-функции заработают автоматически.
                      <br />
                      Просто введите название фильма в поле поиска выше и нажмите "Найти ИИ" — GigaChat найдёт информацию, а Kandinsky создаст постер!
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-foreground hover:text-accent">💡 Часто задаваемые вопросы</summary>
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      <div>
                        <strong>Q: Это платно?</strong>
                        <br />
                        A: Нет! GigaChat даёт бесплатно 10,000 запросов в месяц. Этого хватит на ~300-500 фильмов.
                      </div>
                      <div>
                        <strong>Q: Работает ли в России?</strong>
                        <br />
                        A: Да! GigaChat и Kandinsky — российские сервисы, работают без VPN.
                      </div>
                      <div>
                        <strong>Q: Что делать, если потерял Client Secret?</strong>
                        <br />
                        A: Создайте новый на сайте GigaChat (Шаг 3), старый можно удалить.
                      </div>
                      <div>
                        <strong>Q: Можно ли использовать другую ИИ?</strong>
                        <br />
                        A: Да, напишите Юре: "Подключи другую нейросеть" — он поможет.
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;