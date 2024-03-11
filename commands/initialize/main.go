package initialize

import (
	_ "embed"
	"fmt"
	"os"
)

//go:embed assets/stark.config.json
var configTemplate string

//go:embed assets/index.md
var markdownTemplate string

func Initialize() {
	os.WriteFile("stark.config.json", []byte(configTemplate), os.ModePerm)
	os.Mkdir("pages", os.ModePerm)
	os.WriteFile("pages/index.md", []byte(markdownTemplate), os.ModePerm)
	fmt.Println("Initialized Stark project")
}
