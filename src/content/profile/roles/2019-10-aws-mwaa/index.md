---
id: mwaa
title: "Engineering Leader, Amazon MWAA"
company: aws
start: "2019-10"
end: "2021-11"
location: Vancouver
scope: "Amazon Managed Workflows for Apache Airflow"
outcome: "Built and launched a new AWS service in eight months; $40M ARR within six months of launch."
scale:
  Team: "15 at launch (13 engineers, a PM, a designer); 30 when I left"
  Launch: "GA November 2020 in 9 regions; 15 regions by August 2021"
  Revenue: "$40M ARR within six months of launch"
  Architecture: "Serverless: API Gateway and Lambda control plane, Fargate data plane, DynamoDB; an Aurora PostgreSQL per customer environment"
  Open source: "Two engineers became Apache Airflow committers; one is now on the Airflow PMC"
open: true
highlight:
  order: 3
  label: "Amazon MWAA"
  line: "Built Amazon MWAA from a blank page to a nine-region launch in eight months; $40M ARR within six months."
resume:
  bullets:
    - "Took a stalled idea to a launched AWS service with its own P&L: wrote the PR-FAQ and business plan, hired a team of 15 in under a month and shipped in eight months."
    - "Set the serverless architecture (API Gateway, Lambda, Fargate, DynamoDB) and won an exception for per-environment Aurora PostgreSQL to keep the blast radius inside one customer environment."
    - "Launched in all tier-1 regions at GA, with region builds and DR automated before launch."
    - "Invested in open source from day one: grew two Apache Airflow committers, one now on the Airflow PMC."
artifacts:
  - { type: video, title: "MWAA design choices and road ahead (Airflow Summit 2021)", url: "https://www.youtube.com/watch?v=mtXOlusf4Yo", duration: "14:00" }
  - { type: post, title: "What is Amazon MWAA?", url: "https://docs.aws.amazon.com/mwaa/latest/userguide/what-is-mwaa.html" }
  - { type: post, title: "Introducing Amazon Managed Workflows for Apache Airflow", url: "https://aws.amazon.com/blogs/aws/introducing-amazon-managed-workflows-for-apache-airflow-mwaa/" }
---

- Took a stalled idea to a launched AWS service: wrote the PR-FAQ, the business plan and the engineering strategy, then hired a team of 15 in under a month. [The full story](/work/mwaa/).
- Designed for margin from the start: a serverless control plane, a Fargate data plane with our own autoscaling controller, and a per-environment database so one customer's outage stays theirs.
- Launched in every tier-1 region with region builds and DR automated before GA; then paused feature work for two months to stabilize, and the first year was uneventful after that, in the best possible way.
