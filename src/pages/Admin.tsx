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

const Admin = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        <Card className="p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Добавить контент</h2>
            <p className="text-muted-foreground">
              Заполните форму, чтобы добавить фильм, сериал или ТВ-канал в базу данных
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Введите название"
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
              <Label htmlFor="image_url">URL изображения (постер)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/poster.jpg"
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
            <Icon name="Info" size={24} className="text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Как добавить контент из интернета:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Найдите постер фильма/сериала и скопируйте его URL</li>
                <li>2. Для видео используйте прямые ссылки на .mp4, .webm файлы</li>
                <li>3. Для ТВ-каналов укажите ссылку на HLS-поток (.m3u8)</li>
                <li>4. Все поля с * обязательны для заполнения</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
