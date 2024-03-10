package main

import (
	"fmt"
	"os"
	"stascii/src/commands"
)

func main() {
	if len(os.Args) == 1 {
		fmt.Println("Usage:")
		fmt.Println()
		fmt.Println("stascii init  - Initialize the project")
		fmt.Println("stascii build - Build the project")
		os.Exit(0)
	}

	switch os.Args[1] {
	case "init":
		commands.InitCommand()
	case "build":
		commands.BuildCommand()
	default:
		fmt.Println("Unknown command, run 'stascii' to see the available commands.")
	}
}
