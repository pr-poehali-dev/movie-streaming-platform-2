CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100) NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0.0,
    year INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series', 'tv')),
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content_id INTEGER REFERENCES content(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content_id INTEGER REFERENCES content(id),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0
);

CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_genre ON content(genre);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);

INSERT INTO content (title, description, genre, rating, year, type, image_url) VALUES
('Космическая одиссея', 'Эпическое путешествие через галактику, где команда отважных астронавтов сталкивается с невероятными испытаниями.', 'Фантастика', 8.9, 2024, 'movie', '/placeholder.svg'),
('Ночной город', 'Детектив расследует серию загадочных преступлений в мегаполисе.', 'Триллер', 8.5, 2024, 'movie', '/placeholder.svg'),
('Загадки прошлого', 'Историк раскрывает тайны древних цивилизаций.', 'Детектив', 9.1, 2023, 'series', '/placeholder.svg'),
('Новости 24', 'Актуальные новости и события со всего мира.', 'Новости', 7.8, 2024, 'tv', '/placeholder.svg'),
('Комедийное шоу', 'Лучшие комики и развлекательные программы.', 'Развлечения', 8.2, 2024, 'tv', '/placeholder.svg'),
('Дикая природа', 'Документальный сериал о животном мире планеты.', 'Документальный', 9.3, 2024, 'series', '/placeholder.svg');