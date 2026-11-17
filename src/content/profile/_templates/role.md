---
# Copy to src/content/profile/roles/<yyyy-mm>-<company>-<slug>/index.md (PLAN §8a, worked example 1).
id: example-role # stable key used by highlight and work references
title: "Role title"
company: microsoft # id from companies.yaml
start: "2024-01" # YYYY-MM, in quotes
end: null # null = current role
location: "City"
scope: "What the role covered, one line"
outcome: "One-line outcome, shown when the card is collapsed"
scale:
  Team: "…"
  Regions: "…"
open: false # expanded by default on desktop
# highlight: { order: 1, label: "…", line: "…" }        # one of the four Home Career Highlights
resume:
  include: true
  bullets:
    - "…" # 2–4 short bullets for the PDF; if absent, the PDF prints `outcome`
artifacts: []
#  - { type: video, title: "…", url: "https://www.youtube.com/watch?v=…", duration: "3:12" }
#  - { type: page, title: "…", url: "https://…", screenshot: ./shots/page.png }
#  - { type: post, title: "…", url: "https://…" }
#  - { type: talk, title: "…", url: "https://…" }
#  - { type: article, article: shaped-specs-for-agentic-product-development }
---

What I built: the longer write-up shown when the role card is expanded. Plain Markdown.
