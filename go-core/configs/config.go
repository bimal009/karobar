package config

import (
	"log"

	"github.com/caarlos0/env/v11"
)

type App struct {
	Port        string `env:"APP_PORT,required"`
	Env         string `env:"APP_ENV" envDefault:"production"`
	FrontendURL string `env:"FRONTEND_URL"`
}

type DB struct {
	URL string `env:"DATABASE_URL,required"`
}

type ImageKit struct {
	PublicKey   string `env:"IMAGEKIT_PUBLIC_KEY,required"`
	PrivateKey  string `env:"IMAGEKIT_PRIVATE_KEY,required"`
	UrlEndpoint string `env:"IMAGEKIT_URL_ENDPOINT,required"`
}
type Session struct {
	Secret       string `env:"SESSION_SECRET,required"`
	CookieName   string `env:"COOKIE_NAME" envDefault:"_chautaripos_secure_token"`
	CookieMaxAge int    `env:"COOKIE_MAX_AGE" envDefault:"604800"` // 7 days
}

type RedisConfig struct {
	Addr     string `env:"REDIS_ADDR,required"`     // localhost:6379
	Password string `env:"REDIS_PASSWORD"`          // optional
	DB       int    `env:"REDIS_DB" envDefault:"0"` // default database
}

type ResendConfig struct {
	APIKey    string `env:"RESEND_API_KEY,required"`
	FromEmail string `env:"RESEND_FROM_EMAIL,required"`
	FromName  string `env:"RESEND_FROM_NAME" envDefault:"Tixort"`
}

type Config struct {
	App      App
	DB       DB
	Session  Session
	OAuth    OAuthConfig
	ImageKit ImageKit
	Redis    RedisConfig
	Resend   ResendConfig
}

func MustLoad() *Config {
	cfg := &Config{}

	if err := env.Parse(cfg); err != nil {
		log.Fatalf("failed to load env %v", err)
	}
	return cfg
}
