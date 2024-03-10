package utility

import (
	"encoding/json"
	"fmt"
	"os"
)

const ConfigFileName = "stamd.config.json"

type Config struct {
	Name        string
	Description string
	PagesDir    string
	OutDir      string
}

func GetConfig() Config {
	configJson, readErr := os.ReadFile(ConfigFileName)

	if readErr != nil {
		panic(readErr)
	}

	var config Config

	unmarshalErr := json.Unmarshal(configJson, &config)

	if unmarshalErr != nil {
		fmt.Println("Error parsing ", ConfigFileName, ":", unmarshalErr)
		os.Exit(1)
	}

	if config.Name == "" {
		fmt.Println("Name is required in ", ConfigFileName)
		os.Exit(1)
	}

	if config.Description == "" {
		fmt.Println("Description is required ", ConfigFileName)
		os.Exit(1)
	}

	if config.PagesDir == "" {
		config.PagesDir = "pages"
	}

	if config.OutDir == "" {
		config.OutDir = "dist"
	}

	return config
}
