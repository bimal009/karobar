package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	database "command-line-argumentsD:\\pos-web\\go-core\\pkg\\database\\database.go"
	config "github.com/bimal009/Karobar/configs"
	"github.com/bimal009/Karobar/pkg/database"
	"github.com/bimal009/Karobar/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	cfg := config.MustLoad()
	log := logger.New(cfg.App.Env)
	err := godotenv.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading .env file: %v\n", err)
		os.Exit(1)
	}
	if cfg.App.Env == "development" {
		gin.SetMode(gin.DebugMode)
	}

	pool, err := database.Connect(ctx, cfg.DB.URL)
	if err != nil {
		log.Error("db connection failed", "error", err)
		os.Exit(1) // fine here, at the top level
	}
	defer pool.Close()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		log.Info("ping received", "path", c.Request.URL.Path)
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	srv := &http.Server{
		Addr:    ":" + cfg.App.Port,
		Handler: r,
	}

	go func() {
		log.Info("starting server", "port", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("server failed to start", "error", err)
		}
	}()

	<-ctx.Done()
	stop()
	log.Info("shutting down server, press Ctrl+C again to force")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server forced to shutdown", "error", err)
	}

	log.Info("server exited gracefully")
}
