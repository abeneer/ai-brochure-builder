export function getRelevantLinksPrompt(url: string, links: string[]) {
    return `
you are given a comapny website and a list of links found on it.
Website: ${url}
Pick only the links that are useful for a company brochure:
- About
- Team
- Careers
- Products
- Services
- Contact
- Investors
- Customers

Return JSON in this format only:
{
  "links": [
  {"type":"about page", "url": "https://example.com/about"}
  ]
}
Do not include privacy, terms, login, or email links.

Links:
${links.map((link) => `-${link}`).join("\n")}
`;
}


export function getBrochurePrompt(args: {
    companyName: string;
    
    url: string;
    landingPageTex: string,
    relevantPagesText: string;
}) {
    const { companyName, url, landingPageTex, relevantPagesText } = args;

    return `
you are writing  a short bussiness brochure for a company.

Company name: ${companyName}
Website: ${url}
Write in markdown.
Keep it professional, clear, and attractive.
Include:
- what the company does
- who it serves
- Why it is intresting
- Culture and careers if available

Use only the information below.
Landing page text:
${landingPageTex}
Relevant pages text:
${relevantPagesText}
    `;
}