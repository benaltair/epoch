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

## Contributing
If you find this, you are welcome to submit issues, PRs, or contact the contributors with ideas. This may go nowhere, but it is started at this point.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.