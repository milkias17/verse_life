package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	db          *gorm.DB
	store       = sessions.NewCookieStore([]byte("secret"))
	sessionName = "session"
)

type BaseModel struct {
	ID uint `gorm:"primarykey" json:"id"`

	CreatedAt time.Time      `json:"createdDate"`
	UpdatedAt time.Time      `json:"updatedDate"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type User struct {
	BaseModel
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`
}

type Collection struct {
	BaseModel
	Name string `gorm:"unique;not null" json:"name"`
}

type Card struct {
	BaseModel
	CollectionID     string    `gorm:"not null"                           json:"collection_id"`
	VerseID          string    `gorm:"not null"                           json:"verse_id"`
	LastReviewDate   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"last_review_date"`
	EaseFactor       float64   `gorm:"not null;default:2.5"               json:"ease_factor"`
	Interval         int       `gorm:"not null;default:0"                 json:"interval"`
	RepetitionNumber int       `gorm:"not null;default:0"                 json:"repetition_number"`
}

type CardVerse struct {
	BaseModel
	CardID  string `gorm:"not null" json:"card_id"`
	VerseID string `gorm:"not null" json:"verse_id"`
}

type Req struct {
	Collections []Collection `json:"collections"`
	Cards       []Card       `json:"cards"`
	Verses      []CardVerse  `json:"cardVerses"`
}

func loginHandler(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return c.String(http.StatusUnauthorized, "Invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.String(http.StatusUnauthorized, "Invalid username or password")
	}

	sess, err := session.Get("session", c)
	if err != nil {
		return err
	}
	sess.Options = &sessions.Options{
		Path:   "/",
		MaxAge: 86400 * 7,
	}
	sess.Values["user_id"] = user.ID
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	return c.String(http.StatusOK, sess.ID)
}

func signupHandler(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error hashing password")
	}

	user := User{Username: username, Password: string(hashedPassword)}
	if err := db.Create(&user).Error; err != nil {
		return c.String(http.StatusInternalServerError, "Error creating user")
	}
	return c.String(http.StatusOK, "Signup successful")
}

func syncPush(c echo.Context) error {
	var data Req
	if err := c.Bind(&data); err != nil {
		return c.String(http.StatusBadRequest, "Invalid request body")
	}

	clause := db.Clauses(
		clause.OnConflict{
			UpdateAll: true,
		},
	)

	fmt.Println(data.Collections)

	var res *gorm.DB

	if len(data.Collections) >= 1 {
		clause.Create(&data.Collections)
	}
	if len(data.Cards) >= 1 {
		clause.Create(&data.Cards)
	}

	if len(data.Verses) >= 1 {
		res = clause.Create(&data.Verses)
	}

	if res != nil && res.Error != nil {
		return c.String(http.StatusBadRequest, "Failed to upsert data")
	}

	return c.String(http.StatusOK, "Data upserted successfully")
}

func syncPull(c echo.Context) error {
	lastSync := c.Request().Header.Get("x-last-sync")

	if lastSync == "" {
		var req Req
		db.Find(&req.Cards)
		db.Find(&req.Collections)
		res := db.Find(&req.Verses)
		if res.Error != nil {
			return c.String(http.StatusBadRequest, "Failed to pull data")
		}
		return c.JSON(http.StatusOK, req)
	}

	layout := "2005-01-02"
	date, err := time.Parse(layout, lastSync)
	if err != nil {
		return c.String(http.StatusBadRequest, "Malformed lastSync")
	}

	var req Req
	db.Where("cards.updated_at >= ?", date).Find(&req.Cards)
	db.Where("collections.updated_at >= ?", date).Find(&req.Collections)
	res := db.Where("card_verses.update_at >= ?", date).Find(&req.Verses)

	if res.Error != nil {
		return c.String(http.StatusBadRequest, "Failed to pull data")
	}

	return c.JSON(http.StatusOK, req)
}

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&User{}, &Collection{}, &Card{}, &CardVerse{})

	e := echo.New()
	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))
	e.Use(middleware.Logger())
	e.POST("/login", loginHandler)
	e.POST("/signup", signupHandler)
	e.POST("/sync/push", syncPush)
	e.GET("/sync/pull", syncPull)
	e.Logger.Fatal(e.Start(":1323"))
	fmt.Println("Server started listening at 1323")

}
