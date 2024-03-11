package main

import (
	"fmt"
	"os"
	"stark/commands/build"
	"stark/commands/initialize"
)

func main() {
	if len(os.Args) == 1 {
		fmt.Println("Usage:")
		fmt.Println()
		fmt.Println("stark build - Build the project")
		os.Exit(0)
	}

	switch os.Args[1] {
	case "init":
		initialize.Initialize()
	case "build":
		build.Build()
	default:
		fmt.Println("Unknown command, run 'stark' to see the available commands.")
	}
}
