import { format } from 'prettier';

const HEAD_SYMBOL = '%STASCII_HEAD%';
const BODY_SYMBOL = '%STASCII_BODY%';

const template = `
<html>
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		${HEAD_SYMBOL}
	</head>
	<body>
		${BODY_SYMBOL}
	</body>
</html>`;

export async function generateDocument(head: string, body: string) {
	const document = template.replace(HEAD_SYMBOL, head).replace(BODY_SYMBOL, body);
	return format(document, { parser: 'html' });
}
