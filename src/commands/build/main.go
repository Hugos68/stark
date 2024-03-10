package build

import (
	_ "embed"
	"os"
	"path/filepath"
	"stamd/src/utility"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/ast"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

//go:embed assets/index.html
var template string

func BuildCommand() {
	config := utility.GetConfig()
	pages := GetPages(config)

	if len(pages) == 0 {
		panic("No valid pages found in \"" + config.PagesDir + "\".")
	}
	document := ConvertPagesToDocuments(pages, config)
	WriteDocumentsToDisk(document, config)
}

func GetPages(config utility.Config) []Page {
	pagesDir := config.PagesDir
	pages := []Page{}

	filepath.Walk(pagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			panic(err)
		}

		if filepath.Ext(path) != ".md" {
			return nil
		}

		pages = append(pages, Page{
			Path: path,
		})

		return nil
	})

	return pages
}

func ConvertPagesToDocuments(pages []Page, config utility.Config) []Document {
	documents := []Document{}

	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock | parser.Autolink
	p := parser.NewWithExtensions(extensions)

	for _, page := range pages {
		content, err := os.ReadFile(page.Path)

		if err != nil {
			panic(err)
		}

		node := p.Parse(content)

		documents = append(documents, Document{
			Path: page.Path,
			Node: node,
		})
	}

	return documents
}

func WriteDocumentsToDisk(documents []Document, config utility.Config) {

	if _, err := os.Stat(config.OutDir); os.IsNotExist(err) {
		os.Mkdir(config.OutDir, os.ModePerm)
	}

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	for _, document := range documents {
		outPath := strings.Replace(document.Path, config.PagesDir, config.OutDir, 1)
		outPath = strings.Replace(outPath, ".md", ".html", 1)

		if _, err := os.Stat(filepath.Dir(outPath)); os.IsNotExist(err) {
			os.MkdirAll(filepath.Dir(outPath), os.ModePerm)
		}

		html := markdown.Render(document.Node, renderer)

		writeFileErr := os.WriteFile(outPath, html, os.ModePerm)

		if writeFileErr != nil {
			panic(writeFileErr)
		}
	}
}

type Page struct {
	Path string
}

type Document struct {
	Path string
	Node ast.Node
}
