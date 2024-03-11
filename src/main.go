package main

import (
	"fmt"
	"os"
	"stark/src/commands/build"
)

func main() {
	if len(os.Args) == 1 {
		fmt.Println("Usage:")
		fmt.Println()
		fmt.Println("stark build - Build the project")
		os.Exit(0)
	}

	switch os.Args[1] {
	case "build":
		build.BuildCommand()
	default:
		fmt.Println("Unknown command, run 'stark' to see the available commands.")
	}
}
