import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Content {
  id: number;
  title: string;
  description?: string;
  genre: string;
  rating: number;
  year: number;
  type: 'movie' | 'series' | 'tv';
  imageUrl: string;
  videoUrl?: string;
  isFavorite: boolean;
}

const API_URL = 'https://functions.poehali.dev/8782c920-0a18-4f85-8a17-6d3af7cee2c4';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'series' | 'tv' | 'genres' | 'search' | 'favorites' | 'profile'>('home');
  const [content, setContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setContent(data.content || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const genres = Array.from(new Set(content.map(item => item.genre)));

  const filteredContent = content.filter(item => {
    if (activeTab === 'home') return true;
    if (activeTab === 'movies') return item.type === 'movie';
    if (activeTab === 'series') return item.type === 'series';
    if (activeTab === 'tv') return item.type === 'tv';
    if (activeTab === 'favorites') return item.isFavorite;
    if (activeTab === 'search') {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.genre.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const toggleFavorite = (id: number) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const openPlayer = (item: Content) => {
    setSelectedContent(item);
    setIsPlayerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold gradient-red-purple bg-clip-text text-transparent">
              CINEMA ONLINE
            </h1>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant={activeTab === 'home' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('home')}
                className="hidden md:flex"
              >
                <Icon name="Home" size={18} />
                <span className="ml-2">Главная</span>
              </Button>
              <Button
                variant={activeTab === 'movies' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('movies')}
                className="hidden md:flex"
              >
                <Icon name="Film" size={18} />
                <span className="ml-2">Фильмы</span>
              </Button>
              <Button
                variant={activeTab === 'series' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('series')}
                className="hidden md:flex"
              >
                <Icon name="Tv" size={18} />
                <span className="ml-2">Сериалы</span>
              </Button>
              <Button
                variant={activeTab === 'tv' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('tv')}
                className="hidden md:flex"
              >
                <Icon name="Radio" size={18} />
                <span className="ml-2">ТВ-каналы</span>
              </Button>
              <Button
                variant={activeTab === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('search')}
              >
                <Icon name="Search" size={18} />
              </Button>
              <Button
                variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('favorites')}
              >
                <Icon name="Heart" size={18} />
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                <Icon name="User" size={18} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="hidden md:flex"
              >
                <Icon name="Settings" size={18} />
                <span className="ml-2">Админка</span>
              </Button>
            </div>
          </div>

          <div className="flex md:hidden mt-4 gap-2 overflow-x-auto">
            <Button
              variant={activeTab === 'home' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('home')}
            >
              Главная
            </Button>
            <Button
              variant={activeTab === 'movies' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('movies')}
            >
              Фильмы
            </Button>
            <Button
              variant={activeTab === 'series' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('series')}
            >
              Сериалы
            </Button>
            <Button
              variant={activeTab === 'tv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tv')}
            >
              ТВ
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={48} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === 'home' && content.length > 0 && (
              <div className="space-y-8 animate-fade-in">
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden gradient-red-purple">
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/80 to-transparent">
                    <Badge className="w-fit mb-4">Новинка {content[0]?.year}</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">{content[0]?.title}</h2>
                    <p className="text-lg md:text-xl text-foreground/90 mb-6 max-w-2xl">
                      {content[0]?.description || 'Увлекательная история, которую стоит посмотреть'}
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" onClick={() => openPlayer(content[0])} className="bg-white text-black hover:bg-white/90">
                        <Icon name="Play" size={20} />
                        <span className="ml-2">Смотреть</span>
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => toggleFavorite(content[0]?.id)}>
                        <Icon name="Heart" size={20} />
                        <span className="ml-2">В избранное</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}</>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск фильмов, сериалов, ТВ-каналов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Жанры</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.map((genre, index) => (
                <Card
                  key={index}
                  className="p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg gradient-purple-pink"
                >
                  <h3 className="text-xl font-bold text-center">{genre}</h3>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full gradient-red-purple flex items-center justify-center">
                  <Icon name="User" size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Мой профиль</h2>
                  <p className="text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span>Избранных фильмов</span>
                  <Badge>{content.filter(c => c.isFavorite).length}</Badge>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span>Просмотров</span>
                  <Badge>42</Badge>
                </div>
                <Button className="w-full mt-6">Редактировать профиль</Button>
              </div>
            </Card>
          </div>
        )}

        {(activeTab !== 'profile' && activeTab !== 'genres') && (
          <div className="mt-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              {activeTab === 'home' && 'Популярное сейчас'}
              {activeTab === 'movies' && 'Фильмы'}
              {activeTab === 'series' && 'Сериалы'}
              {activeTab === 'tv' && 'ТВ-каналы'}
              {activeTab === 'favorites' && 'Избранное'}
              {activeTab === 'search' && 'Результаты поиска'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredContent.map((item) => (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl animate-scale-in"
                  onClick={() => openPlayer(item)}
                >
                  <div className="aspect-[2/3] bg-muted relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <Button
                        size="icon"
                        className="mb-2 bg-white text-black hover:bg-white/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPlayer(item);
                        }}
                      >
                        <Icon name="Play" size={20} />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      <Icon
                        name="Heart"
                        size={18}
                        className={item.isFavorite ? 'fill-red-500 text-red-500' : ''}
                      />
                    </Button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span>{item.genre}</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={14} className="fill-yellow-500 text-yellow-500" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Icon name="Play" size={64} className="mx-auto mb-4" />
                  <p className="text-lg">Видеоплеер</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedContent?.type === 'tv' ? 'Live-трансляция' : 'Воспроизведение контента'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Жанр</p>
                <p className="font-semibold">{selectedContent?.genre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Год</p>
                <p className="font-semibold">{selectedContent?.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Рейтинг</p>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="fill-yellow-500 text-yellow-500" />
                  <p className="font-semibold">{selectedContent?.rating}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Тип</p>
                <p className="font-semibold">
                  {selectedContent?.type === 'movie' && 'Фильм'}
                  {selectedContent?.type === 'series' && 'Сериал'}
                  {selectedContent?.type === 'tv' && 'ТВ-канал'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;