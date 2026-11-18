---
title: Microsoft 365 People Skills
company: m365-copilot
years: "2023 – 2025"
order: 1
role: viva
hook: "A three-engineer hack became the skills layer in Microsoft 365 Copilot, built to feel like a delight, not big brother."
takeaway: "Skills inference has to feel like a delight, not big brother. That one rule shaped the model, the taxonomy and the privacy design."
artifacts:
  - { type: post, title: "People Skills AI inference engine: how it works", url: "https://learn.microsoft.com/en-us/copilot/manage/people-skills-ai-inferencing" }
  - { type: post, title: "People Skills data and AI guidelines", url: "https://learn.microsoft.com/en-us/copilot/manage/people-skills-data-and-ai-guidelines" }
  - { type: post, title: "Sharing and inferencing controls", url: "https://learn.microsoft.com/en-us/copilot/manage/people-skills-sharing-inferencing-controls" }
  - { type: post, title: "People Skills adoption and launch guide", url: "https://adoption.microsoft.com/en-us/people-skills/" }
  - { type: post, title: "Announcing People Skills general availability (Apr 2025)", url: "https://techcommunity.microsoft.com/t5/microsoft-365-copilot/announcing-people-skills-general-availability-and-new-skills/ba-p/4406364" }
  - { type: post, title: "Expanding skills intelligence to more users and surfaces (Mar 2026)", url: "https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/people-skills-expanding-skills-intelligence-to-more-users-and-surfaces-across-mi/4497646" }
  - { type: post, title: "Josh Bersin: Microsoft launches People Skills in Copilot", url: "https://joshbersin.com/2025/04/microsoft-launches-people-skills-in-copilot-altering-the-hr-tech-market" }
  - { type: post, title: "Patent application US 2025/0138910 A1: context briefs", url: "https://patents.google.com/patent/US20250138910A1/en" }
---

Every skills product I had seen asked people to describe themselves. Fill in a profile, pick some tags, keep it current. Almost nobody does. Microsoft 365 People Skills goes the other way. It infers skills from the work people already do in Microsoft 365, and it is built as an intelligence layer, not as one more app to visit.

Today that layer grounds Microsoft 365 Copilot, its agents and the people card in who knows what, and it is one of the core ingredients of the people intelligence in Work IQ.

<figure class="video">
<a class="video__link" href="https://www.youtube.com/watch?v=CJ933ErqBgw" data-yt="CJ933ErqBgw" target="_blank" rel="noopener" aria-label="Play video: People Skills in Microsoft 365 Copilot"><img src="https://i.ytimg.com/vi/CJ933ErqBgw/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" /><span class="video__play" aria-hidden="true"></span></a>
<figcaption>People Skills in Microsoft 365 Copilot, the launch video (1:55).</figcaption>
</figure>

## How It Started: A Hack in My Team

In 2023 I led the Viva shared services group. A dev and a PM on the team had been looking at the skills taxonomy LinkedIn had just published, built from millions of worker profiles. Their question was simple. Could we infer someone's skills from the work they already do, instead of asking them to type it in?

We skunkworked it as a moonshot with three engineers. The path from there was deliberate: small internal preview -> v1 -> public preview in October 2023, to get real customer requirements on the table. Once those were frozen, it took about fourteen months to build the product properly. We announced general availability in April 2025 and rolled out to customers in June and July.

The preview came out of the Viva stable. The intent was always Microsoft 365 scale.

<figure class="video">
<a class="video__link" href="https://www.youtube.com/watch?v=rVJEzHfKrcg" data-yt="rVJEzHfKrcg" target="_blank" rel="noopener" aria-label="Play video: Skills in Microsoft Viva, the 2023 preview"><img src="https://i.ytimg.com/vi/rVJEzHfKrcg/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" /><span class="video__play" aria-hidden="true"></span></a>
<figcaption>Where it started: the public preview, October 2023.</figcaption>
</figure>

## My Role

I was the group engineering manager for engineering and applied science, with PM and design in their own reporting chains. A lot of the granular decisions belong to my engineers, and I want to be clear about that. Two of the calls below were mine. The third I made with my product partner.

## The Calls That Mattered

- **Simulated tree of thought on GPT-3.5.** Inference was on by default for every Copilot tenant, so the cost per user per month had to stay very low. Frontier models were out of reach at that scale. GPT-3.5 could not plan or backtrack on its own, so we faked it. The system prompt plays out a debate between four skills-taxonomist personas, each with a different critique stance and a different view of which signals to trust. They decide one candidate skill per turn. When a skill is rejected unanimously or 3 to 1 with a clear reason, that rejection carries into later rounds where similar skills come up. In effect it was a multi-agent simulation inside one prompt, close to what a mixture of experts would do today. We no longer need it. Smaller, cheaper models now run a much simpler prompt.
- **Context briefs, not raw data.** Models hallucinate when they read disjointed scraps from many sources with nothing tying them to the person's work. The obvious fix was a personal knowledge graph with graph RAG. The cheaper one was a short brief per data source, written about the user, and inference over those briefs. We chose the briefs. It cut hallucination, and it kept us from overbuilding the platform for v1. A full knowledge graph sits underneath today, and the briefs work is now a patent application.
- **A layer, not an app.** We built People Skills to feed Copilot and Work IQ rather than as a destination of its own. That decision is why it shows up in so many places now.

![Diagram. Context briefs from profile and job title, collaboration signals, email and meetings, and documents feed one prompt in which four taxonomists debate one candidate skill per turn. Accepted skills are mapped to the skills taxonomy. Rejected skills, decided four to zero or three to one with a clear reason, are carried into later rounds.](./debate.svg "The v1 inference loop: context briefs in, a four-way debate per skill, rejections carried forward. {wide}")

We also took a stretch goal into launch: a Skills agent, built in under two months. It has since been folded into Copilot natively.

## Hard Problems

The model was not the hardest part. Trust was.

- **Delight, not surprise.** An inference should help a person understand their own work. It should never feel like a big brother system watching them. That rule shaped what is shown, to whom, and what a person can turn off.
- **A taxonomy that holds across industries.** Inclusive, de-duplicated, and linked across skill families so no leaf skill appears twice. Removing the circular dependencies was a massive effort that nobody outside the team will ever see.
- **Sensitive skills.** Someone researching a specific cancer type can be inferred a cancer research skill. Someone who confided a diagnosis to HR must never see it inferred. The difference is context, and the system has to respect it.

On top of that sit the controls customers need: AI-restricted skills, a per-user opt-out, and admin control by user, group or tenant through [Feature Access Management](https://learn.microsoft.com/en-us/viva/feature-access-management), a policy layer my team built for all of Microsoft 365. All inference runs inside the customer's tenant boundary.

## How We Knew It Worked

We built golden datasets for the 28 most common knowledge-work roles and ran LLM-judged and human-annotated evals against them to set a baseline for precision, accuracy and relevance. After launch, the skills people chose to confirm gave us a recall signal. We only ever saw telemetry, never customer data.

## Where It Is Now

People Skills powers Copilot, the Learning and Workforce Insights agents, the people card and Org Explorer. Since March 2026 inference reaches Microsoft 365 E3 and E5 users too, not only Copilot licenses. The work grew into the People & Work Intelligence charter I lead today.

## The People

The three engineers from the skunkworks days and the dev and PM who had the original idea are all still on the team. One of those engineers now manages the inferencing team. The PM who had the idea is now the Principal PM for our inferencing strategy. That is the part of this story I enjoy telling most.

## What Stayed With Me

A cheap model with a well-designed prompt, honest evals and a clear rule about trust went further than a bigger model would have. The rule mattered more than the model.

Start with the person on the other side of the inference. If they would be surprised, you are not done.
