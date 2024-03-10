package commands

import (
	"fmt"
	"stascii/src/utility"
)

func BuildCommand() {
	config := utility.GetConfig()

	fmt.Println(config);
}