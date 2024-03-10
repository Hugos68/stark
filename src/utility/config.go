package utility

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	Name        string
	Description string
	OutDir      string
}

func GetConfig() Config {
	configJson, readErr := os.ReadFile("stascii.config.json")

	if readErr != nil {
		panic(readErr)
	}

	var config Config

	unmarshalErr := json.Unmarshal(configJson, &config)

	if unmarshalErr != nil {
		fmt.Println("Error parsing stascii.config.json:", unmarshalErr)
		os.Exit(1)
	}

	if config.Name == "" {
		fmt.Println("Name is required in stascii.config.json")
		os.Exit(1)
	}

	if config.Description == "" {
		fmt.Println("Description is required in stascii.config.json")
		os.Exit(1)
	}

	if config.OutDir == "" {
		config.OutDir = "dist"
	}

	return config
}
