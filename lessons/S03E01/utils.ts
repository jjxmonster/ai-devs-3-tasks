import path from "path";

export const FACTS_TO_SUMARIZE = [
	"f01.txt",
	"f02.txt",
	"f03.txt",
	"f04.txt",
	"f05.txt",
	"f06.txt",
	"f07.txt",
	"f08.txt",
	"f09.txt",
];

export const SUMMARIZED_FACTS = [
	"f04.txt",
	"f05.txt",
	"f06.txt",
	"f07.txt",
	"f08.txt",
];

export const REPORTS_TO_GENERATE_KEYWORDS = [
	"pliki_z_fabryki/2024-11-12_report-00-sektor_C4.txt",
	"pliki_z_fabryki/2024-11-12_report-01-sektor_A1.txt",
	"pliki_z_fabryki/2024-11-12_report-02-sektor_A3.txt",
	"pliki_z_fabryki/2024-11-12_report-03-sektor_A3.txt",
	"pliki_z_fabryki/2024-11-12_report-04-sektor_B2.txt",
	"pliki_z_fabryki/2024-11-12_report-05-sektor_C1.txt",
	"pliki_z_fabryki/2024-11-12_report-06-sektor_C2.txt",
	"pliki_z_fabryki/2024-11-12_report-07-sektor_C4.txt",
	"pliki_z_fabryki/2024-11-12_report-08-sektor_A1.txt",
	"pliki_z_fabryki/2024-11-12_report-09-sektor_C2.txt",
];

export const FACT_FILES_DIR = path.join(
	__dirname,
	"../../pliki_z_fabryki/facts"
);
export const SUMMARIZE_FACT_PROMPT = `
As a professional summarizer, create a concise and 
comprehensive summary of the provided text. while adhering to these guidelines:
 - Format the summary in paragraph form for easy understanding.
 - Keep the summary concise and to the point.
 - Do not include any information that is not present in the original text.
 - The summary should be in Polish language.
 - The summary should be no longer than 200 characters.
`;

export const GENERATE_KEYWORDS_PROMPT = `
As a professional keywords generator, create a list of keywords that best describe the provided text in Polish language.

- use <additional_data> only if the data in it is linked to the text above for example there is more information about mentioned person in text above, use facts about him for keywords
- in the nominative form,
- in the plural form if necessary,
- in the order of importance,
- do not include any words that do not contribute to the meaning of the text.
- return the list of keywords in the following format "keyword1, keyword2, keyword3, etc.".
`;
