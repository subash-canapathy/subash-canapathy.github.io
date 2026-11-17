---
title: Amazon MWAA
company: aws
years: "2019 – 2021"
order: 2
role: mwaa
hook: "From a stalled idea to a nine-region AWS service in eight months, and $40M ARR six months after launch."
takeaway: "Make the expensive calls early: architecture, open source, operations on day one. Then a small team can ship a big service on time."
artifacts:
  - { type: video, title: "MWAA design choices and road ahead (Airflow Summit 2021)", url: "https://www.youtube.com/watch?v=mtXOlusf4Yo", duration: "14:00" }
  - { type: post, title: "Amazon MWAA: our journey and the road ahead (slides)", url: "https://airflowsummit.org/slides/2021/h7-MWAAJourney.pdf" }
  - { type: post, title: "What is Amazon MWAA? The architecture, as documented at launch", url: "https://docs.aws.amazon.com/mwaa/latest/userguide/what-is-mwaa.html" }
  - { type: post, title: "Introducing Amazon Managed Workflows for Apache Airflow", url: "https://aws.amazon.com/blogs/aws/introducing-amazon-managed-workflows-for-apache-airflow-mwaa/" }
  - { type: post, title: "AWS announces general availability of Amazon MWAA", url: "https://press.aboutamazon.com/2020/11/aws-announces-general-availability-of-amazon-managed-workflows-for-apache-airflow" }
  - { type: post, title: "Customer story: eprimo moves from self-managed Airflow to MWAA", url: "https://aws.amazon.com/blogs/opensource/migrating-from-self-managed-apache-airflow-to-amazon-managed-workflows-for-apache-airflow-mwaa" }
---

Customers were already running Apache Airflow on AWS. They were also running everything under it: the schedulers, the workers, the metadata database, the upgrades and the pages at 2 a.m. Amazon Managed Workflows for Apache Airflow (MWAA) took the second job off their hands. Customers keep the Airflow they know. AWS runs the rest.

## The Bet: A Stalled Idea With Nine Months to Go

Self-hosted Airflow was one of the fastest-growing app types we saw on AWS, so a managed service was a clear strategic imperative. My VP wanted one. The idea had been sitting for months without taking off. I was looking for a new challenge inside AWS, and he asked me to take it on with roughly nine months left before the target launch event.

The first weeks were all writing. The PR-FAQ, the business plan, how the service should be built, what the launch year had to get right, and the case for funding open source contributors as a long-term success factor. The plan was approved with 15 headcount, and we hired in under a month, mostly internal transfers: 13 engineers, a PM and a designer.

It is the closest I have come to a founder experience inside a large company. My VP was the VC and those 15 headcount were the funding. Eight months later we had a full AWS service with its own P&L.

## My Role

I was the engineering leader for the service, and in practice its GM: owner of the business and the engineering, with the P&L. We sat in the AWS serverless and orchestration group, next to Step Functions, EventBridge and Amazon MQ. The team grew from 15 to 29 by the time I left in fall 2021.

## The Calls That Mattered

Approval depended on the infrastructure margin math, so the architecture had to be settled before almost anything else. These were the expensive calls, and we made them first.

- **The environment is the unit.** An Airflow environment is what a customer creates, updates, operates and pays for. Each one gets its own metadata database, web server, scheduler and workers, and customers can run as many as they need. Most of the design follows from that one decision.
- **Serverless all the way down.** The control plane runs on API Gateway and Lambda. Schedulers and workers run as Fargate containers in private subnets. The service's own state lives in DynamoDB. Customers would not know Fargate was underneath unless we told them.
- **An exception to a hard rule.** AWS did not allow a relational database anywhere in the dependency chain of a top-level service. Airflow cannot run without one. My case was that only the customer environments need it. So every environment gets its own Aurora PostgreSQL, and the service itself stays on DynamoDB. A database outage stays inside one environment and cannot take MWAA down. We got the exception.
- **Every tier-1 region at launch.** Nine regions at GA, with region builds and disaster recovery automated before launch. Not a fast follow.
- **Open source from day one.** Two engineers spent more than half their time upstream in Apache Airflow, with a goal of our first committer within six months of GA. A managed service built on an open source project has to earn its seat in that community, not just consume it.

## Hard Problems

The architecture diagram looks clean. Three things under it were not.

- **Two networks, one environment.** Every environment spans a service VPC that we run and a customer VPC that they own, joined through VPC endpoints for the web server and the database. Getting that boundary right took more iterations than anything else in the service.
- **Customer code next to our infrastructure.** Airflow runs whatever operator code the customer writes. Key management for every call that crosses the VPC boundary, and making sure that code can never reach our internal compute, was a P0 from the first design review.
- **Autoscaling.** It was a nightmare to get right. Customers set their worker counts and maximum throughput, and we had to honour those settings while keeping the margin healthy. We ended up building our own autoscaling controller that orchestrates the Fargate clusters behind the scenes.

The stacks were mostly Java, with Python wherever Airflow needed it, and region builds ran as automation on Amazon's internal deployment pipelines.

## Launch and the First Year

MWAA went GA on November 24, 2020 in nine regions, with The Pokémon Company International, Rocket Mortgage and GoDaddy among the launch customers. A launch session and a booth at re:Invent 2020 followed in December.

Demand was heavy from day one, and so were customer-specific tickets. We paused feature work for two months and spent it on stabilization and operational excellence. After that the year was uneventful, in the best possible way. We had around eight very high severity issues, each tied to how one customer used Airflow, against a 99.9% SLA on the control plane and 99.99% on the data plane. I have watched other launches spend six months swimming in high-sev tickets. Uneventful is the compliment I wanted.

Then the service grew up:

- $40M ARR within six months of launch.
- Airflow 2.0 support in May 2021.
- 15 commercial regions by August 2021.
- Customers like eprimo moving from self-managed Airflow to MWAA, and on to Airflow 2.

In the summer of 2021, my product partner John Jackson and I told the design story at Airflow Summit. The talk and slides are below.

## The People

The outcome I am proudest of is not on the revenue line. Two engineers became Apache Airflow committers. The engineer who led the control plane now manages that team. The engineer who led the data plane is a Principal Engineer and sits on the Apache Airflow PMC. Watching people grow into roles like that is the part of the job that stays with me.

## What I Would Do With More Room

I wanted two more things at launch: a native serverless operator for AWS Lambda, and someone from the team already on the Airflow PMC. Headcount, time and pure physics meant we had to prioritize differently. The PMC seat came later. The operator was on the roadmap when I left.

## What Stayed With Me

Most of what made MWAA work was decided in the first six weeks, on paper, before anyone wrote code. The PR-FAQ, the margin math, the database exception and the decision to fund open source all came before the first commit. The eight months after that were execution.

A small team can ship a big service on time. It cannot afford to make the expensive calls late.
