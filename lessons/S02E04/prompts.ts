export const TEXT_REPORT_PROMPT = `Jesteś asystentem którego zadaniem jest analiza ponizszego
 tekstu i sprawdzenie zawiera informacje o jednym z poniższych:

- schwytanych ludziach 
- śladach ich obecności
- naprawionych usterkach hardwarowych

Jeśli tekst zawiera informacje o jednym z powyższych tematów, zwróć odpowiedź w formacie:

{
	"people": "0 lub 1",
	"hardware": "0 lub 1"
}

0 - brak informacji
1 - informacje są obecne
`;

export const IMAGE_REPORT_PROMPT = `Jesteś asystentem którego zadaniem jest analiza ponizszego
 obrazu i sprawdzenie czy tekst na obrazie zawiera informacje o jednym z poniższych:

- schwytanych ludziach 
- śladach ich obecności
- naprawionych usterkach hardwarowych

Jeśli tekst zawiera informacje o jednym z powyższych tematów, zwróć odpowiedź w formacie:

{
	"people": "0 lub 1",
	"hardware": "0 lub 1"
}

0 - brak informacji
1 - informacje są obecne
`;
