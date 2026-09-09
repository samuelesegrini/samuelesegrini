<h1 align="center">Samuele Segrini</h1>
<p align="center">Software Engineer · Swift & iOS</p>

<p align="center">
  <a href="https://samuelesegrini.github.io/samuelesegrini/it/"><b>Portfolio (IT)</b></a> ·
  <a href="https://samuelesegrini.github.io/samuelesegrini/en/"><b>Portfolio (EN)</b></a> ·
  <a href="https://www.linkedin.com/in/samuele-segrini-221443241/">LinkedIn</a> ·
  <a href="mailto:samuele.segrini@gmail.com">Email</a>
</p>

---

I design and build iOS products where the logic holds up as well as the interface. I got here through distributed systems, algorithms, hardware and interfaces: projects that taught me to treat software as a complete product, not a collection of screens.

**What I care about**

- Explicit constraints and contracts, verified across the whole system rather than in isolated parts.
- Swift, SwiftUI and UIKit, with the architecture, platform limits and accessibility that come with them.
- Writing down what I learned: technical notes on systems, trade-offs and useful mistakes.

**Selected work**

| Project | What it is | Stack |
| --- | --- | --- |
| [EasyManager](https://samuelesegrini.github.io/samuelesegrini/en/projects/easymanager-restaurant-operations/) | Restaurant operations software turned into a modular Swift toolkit: durable orders, device lanes, honest fiscal reconciliation. | Swift 6.3, SwiftUI, Swift Concurrency |
| [Galaxy Trucker](https://samuelesegrini.github.io/samuelesegrini/en/projects/galaxy-trucker-java-project/) | A four-person multiplayer game with an authoritative server, two network transports (Socket and RMI) and two playable interfaces. | Java, JavaFX, Maven |
| [SpinGO](https://samuelesegrini.github.io/samuelesegrini/en/projects/spingo-sustainable-micromobility/) | A micromobility app shaped by 109 survey answers and 7 usability sessions, with off-phone riding interactions. | HCI, Figma, React, TypeScript |

**Writing**

Recent notes live in the [writing section](https://samuelesegrini.github.io/samuelesegrini/en/writing/), from why my first video game was really a distributed system to what changed when I rebuilt it with an AI agent.

**Currently**

Looking for a first iOS role where I can contribute to a real product, go through code review and technical decisions, and grow alongside more experienced people. I reply within 24 hours, Italian time zone.

---

<details>
<summary>About this repository</summary>

This repository is both my GitHub profile and the source of my portfolio, an [Astro](https://astro.build) site published to GitHub Pages by the workflow in `.github/workflows/deploy.yml`.

```sh
npm install
npm run dev        # http://localhost:4321/it/
npm run verify     # astro check, unit tests, Playwright e2e, production build
```

Content is bilingual MDX under `src/content` (projects, posts, the about page) plus the interface copy in `src/content/lab-copy`. Components live in `src/components/lab`, shared visual primitives in `src/styles/lab-primitives.css`.

</details>
