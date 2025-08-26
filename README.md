# Epoch
This is an idea at this early stage; an experiment. A website which shows a chronology of the events of the Baha'i Faith throughout history, connecting users to relevant guidance along this timeline.

## Project Status
Likely this will be slow moving as an individual initiative, progressing when I have time. Eventually it may pick up steam. 

**Update: September 2023**
Right now it is in its earliest stage. I am prototyping different ways to reliably render an interactive timeline. The features which could be enabled by this scaffold include:
- Dynamic zooming and scrolling through the timeline, likely with an overview widget somewhere on screen. 
- Information hierarchy between different types of events. Cycle -> Dispensation -> Age and so on. 
- Linking rich resources including links to the official Reference Library for events. This will require some sort of expanded card interface, likely achived with CSS page transitions

At this stage mobile is out of scope, but the CSS scaffold I'm building would allow for it. The main issue is information density, so on small viewports there will need to be a maximum number of years or zoom levels perhaps. Zoom levels in general will reauire some experimentation and thought. Certain things will need to be hidden. Likely depending on viewport size, a certain number of hierarchical levels down from the top item will be shown. One of the key navigational tools is likely going to be clicking on events to adjust them into the Zoom. It will then become the top level event visible, with some sort of mechanism  to click up a layer or all the way out intuitively. 

## Principles
This will be developed to run on a serverless architecture, using a jamstack methodology. The data will be hosted in a headless CMS and structured logically, with the build process ideally producing a statically generated website.

A separate  process of data management and carw will be needed to maintain the integrity of the source database. Further consultation with others and potentially institutions of the Faith will be necessary at that stage to think about how best to gather and maintain that information. There is potential for a small group of authorized moderators who have access to the CMS, paired with a feedback mechanism which allows users of the website to request the additon of additional events through an inline form. 

This will use the gregorian calendar system for now. It would be nice to overlay the Bahá'í equivilant dates in the future, but this would need to be rendered from the gregorian. This brings into question an element of the scope of this project: current events. The goal is primarily to give historical context, eventually allowing some level of granular exploration of certain time periods of the Faith. It could however be helpful too in showing upcoming dates such as Holy Days. This will need to be decided in the future and for now only past events are generally going to be included.

## Contributing
If you find this, you are welcome to submit issues, PRs, or contact the contributors with ideas. This may go nowhere, but it is started at this point.

Licensing will need to be selected and published in this repository soon. Right now it is under a default restrictive assumed copyright license but the goal is to open it up for easy collaboration and additional projects. This should also make it more resilient so if it's forgotten about, someone else can continue on. 

## Developing

Begin by cloning this repository and installing dependencies with `npm install` (or `pnpm install` or `yarn`). Then start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

This app is deployable to serverless platforms (e.g., Netlify, Vercel) and traditional hosts. The project currently uses SvelteKit with `adapter-auto`; select and configure a specific adapter if you have a target environment in mind.

To create a local production build:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Tech and scripts

- Framework: SvelteKit 1 + Svelte 4 (Vite-based)
- Package scripts:
  - `dev`: `vite dev`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`, `test:unit`, `test:integration`: Vitest and Playwright
  - `check`/`check:watch`: type and Svelte checks
  - `lint`/`format`: Prettier + ESLint
