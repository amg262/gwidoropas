# LinkedIn recommendation for Gwido, from Andrew Gunn

192 words, 1,085 characters (LinkedIn allows 3,000). The website quotes this **word for word** from `src/data/site.ts` (`recommendations`). If you change a word on LinkedIn, change it there too, so the two never disagree.

## Paste this

```text
Gwido has the kind of marketing instincts you can’t teach, and he pairs them with real curiosity about technology. That combination is rare this early in a marketing career.

I’ve known Gwido for years and have worked with him in different capacities while he’s been in school. Most recently, he helped me shape the UI and UX for Amarna Studio and Amarna Video, the AI products I’m building at Amarna. He’s creative, he has a sharp eye for detail and he knows what people like. His feedback always comes back to the people who will actually use the product.

He’s also my go-to second set of eyes in my consulting work. When I need a fresh perspective on something, I send it to Gwido, and what comes back is honest, thoughtful and useful.

Gwido has the intangibles of a good marketer, and he’s tech savvy to match. He’s finding inventive ways to put AI to work, and he isn’t content just using the tools. He wants to understand how they work.

If you’re building a team where marketing, design and technology meet, Gwido belongs on your shortlist. I recommend him without hesitation.
```

## Posting it

1. **Andrew:** open Gwido's profile (linkedin.com/in/gwido-ropas-263596235), then **More → Recommend**.
2. **Relationship:** pick the option that matches how you worked together at Amarna.
3. **Position at the time:** *Marketing Intern, Amarna LLC*. That puts the recommendation under the role the text describes.
4. Paste the text above and send. LinkedIn shows your headline above the recommendation on its own, so make sure your profile lists **Senior Fullstack Software Engineer, Digital Platforms** at OneDigital. The site's byline uses the same title.
5. **Gwido:** accept it from the notification so it shows on your profile.
6. **Then on the site:** in `src/data/site.ts`, set `date` to the month LinkedIn shows and paste `linkedin.com/in/gwido-ropas-263596235/details/recommendations/` into `url`. A "Read it on LinkedIn" button appears on the card.

## Why it's written this way

- **The first two lines carry it.** LinkedIn cuts recommendations off after a couple of lines behind "see more," so the opening states the whole case: real marketing instincts plus technical curiosity.
- **It's specific.** It names Amarna Studio and Amarna Video, the UI/UX work and the consulting reviews: things a recruiter can ask Gwido about and he can talk through.
- **The credit is right.** "Helped me shape the UI and UX" is accurate. Andrew built the products and Gwido contributed to the design, which matches the project's credit rule.
- **It matches his positioning.** The last line repeats the line his site and LinkedIn are built on ("where marketing, technology and design meet"), so a recruiter gets the same message from both of them.
- **It's honest about the relationship.** "I've known Gwido for years" and "Gwido's mentor" on the site are true, and they don't make the family tie the headline. Andrew mentions the family tie when he refers Gwido, and Gwido says yes if he's asked, so neither of them will ever need to walk anything back.
- **No em dashes or stock praise** ("invaluable asset," "go-getter"). Those read as AI-written or boilerplate, and readers discount them.

## Who it's from

On the site, the byline reads **Andrew Gunn, Senior Fullstack Software Engineer, Digital Platforms · OneDigital**, followed by a line saying you handle all technology and development for OneDigital's marketing technology team and founded Amarna. Gwido is aiming for MarTech roles, and a recommendation from someone who runs the technology side of a MarTech team carries weight with exactly those hiring managers.

## Optional upgrade

Add **one real moment** to the second paragraph, like a screen he reworked or something he caught that you missed. One true example will persuade more than any adjective. Update `site.ts` to match.
