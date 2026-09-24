/* ==========================================================================
   TPRAF content data.
   Positions are percentages, extracted directly from the original
   PowerPoint slide geometry (DARe TPRAF Diagrams for Ashikur.pptx)
   so the web layout matches the client's source diagram.

   Any box/label text marked isPlaceholder:true was NOT provided in the
   source slides — see PLAN.md "Missing Content Needed From Client".

   LARAVEL MIGRATION NOTE: this file only ever defines one thing — the
   global TPRAF_CONTENT object. When this becomes a Laravel app, this
   whole file is replaced by an inline Blade line that prints the same
   shape of object from a database table instead:
     <script>const TPRAF_CONTENT = @json($tprafContent);</script>
   Keep every future addition (extended/dsp/imp/level3) as plain data
   here — no functions, no DOM access — so that swap stays a 1-line change.
   See MIGRATION-NOTES.md for the full file-by-file map.

   A view can set `scale` (default 1) to make its whole canvas that many times
   larger than the page's natural diagram width. Positions and sizes stay in
   the same percentages; text is one shared size for every diagram, so a
   crowded view is given more canvas rather than smaller text. The canvas
   grows and shrinks with the page, and scrolls sideways (or zooms) when it
   is wider than the screen.

   Each view also carries a `tour`: the order its boxes are meant to be read
   in, for the walkthrough animation ("Play walkthrough" above the diagram).
   A step is just a box id. The arrow leading into a step is found from the
   drawn geometry (every connector starts and ends on the edge of the box or
   cluster it joins), so authoring a tour means listing box ids in order and
   nothing else. A step can name one specific connector instead, as
   { box: "id", via: { from: "id", to: "id" } } — used for the feedback-loop
   legs, which set out from a box other than the previous step's. Where two
   consecutive steps have no arrow between them (parallel boxes that genuinely
   have no "after"), the walk just highlights them in turn rather than
   inventing a connection.
   ========================================================================== */

const TPRAF_CONTENT = {

  simple: {
    title: "Overview of TPRAF: Simple Form",
    subtitle: "Level 1",
    // Guided tour: every view gets one, built from its `tour` order and box text,
    // and it opens on its own each time the view is shown.
    // Where this view leads next. Slide 2 treats the simple form as the
    // landing step and the extended form as the start of the interactive
    // diagram, so the simple view offers a way through to it. Becomes a
    // column pair on tpraf_views at migration (see MIGRATION-NOTES.md).
    next: { key: "extended", label: "Explore the extended form" },
    boxes: [
      {
        id: "transport-scenarios",
        label: "Transport\nScenarios",
        pos: { left: 4.0, top: 12.6, width: 14.82, height: 12.2 },
        text: "The transport system being tested: the combination of transport demand (the people and goods that need to travel) and transport supply (the roads, railways, cycleways and footways they travel on). For future scenarios, this is the transport system envisaged under a set of decarbonisation policies, which may include modal shift, technological change, or demand change.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "impact-assessment",
        label: "Impact\nAssessment",
        pos: { left: 4.0, top: 33.46, width: 14.82, height: 12.2 },
        text: "Analysis of the impact of the climate hazard (e.g. flooding, high temperatures) on the transport system. This is simulated by changing the supply (performance of transport links in the network) and observing the response of users. Performance metrics measure how well the system is able to continue operation and withstand the impacts, but also the cost of the disruption to the system and its users.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "hazard-model",
        label: "Hazard\nModel",
        pos: { left: 4.0, top: 54.31, width: 14.82, height: 12.2 },
        text: "Tools to estimate the impact of a climate-related phenomenon on the transport system, such as CADDIES, CityCAT, and VITO UrbClim + HiREx.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "climate-scenarios",
        label: "Climate\nScenarios",
        pos: { left: 4.0, top: 75.17, width: 14.82, height: 12.2 },
        text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "bau",
        label: "Business as usual/Do nothing evaluation",
        pos: { left: 23.28, top: 33.46, width: 14.82, height: 12.2 },
        text: "Evaluating current assets and/or networks, and understanding the problems and challenges present.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky"
      },
      {
        id: "risk-reduction-needs",
        label: "Risk Reduction Needs",
        pos: { left: 42.62, top: 33.46, width: 14.82, height: 12.2 },
        text: "This process applies a screening criteria to filter the long-list to a short-list of potential options for detailed pathway development informed by the risk and resilience assessment. As well as identifying / inputting thresholds / tipping points.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky"
      },
      {
        id: "adaptation-interventions",
        label: "Adaptation/\nInterventions",
        pos: { left: 61.9, top: 33.46, width: 14.82, height: 12.2 },
        text: "Options and pathways to improve resilience, adaptation, sustainability, and transport performance.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "leaf"
      },
      {
        id: "outcome-assessment",
        label: "Outcome\nAssessment",
        pos: { left: 81.18, top: 33.46, width: 14.82, height: 12.2 },
        text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky"
      }
    ],

    /* Geometry follows the Figma design (1452 x 664): the same eight boxes,
       laid out on its grid and mapped into slide percentages. Its connectors
       are drawn as they are there — thin navy lines with open chevron heads,
       and the two green feedback loops leaving Adaptation/Interventions with
       rounded corners. The design carries no "Feedback loop" or "Risk
       Mitigation" captions, so neither is drawn. */
    arrows: [
      { from: { x: 11.89, y: 24.99 }, to: { x: 11.89, y: 32.88 } },   // Transport Scenarios -> Impact Assessment (down)
      { from: { x: 11.89, y: 53.65 }, to: { x: 11.89, y: 45.77 } },   // Hazard Model -> Impact Assessment (up)
      { from: { x: 11.89, y: 74.87 }, to: { x: 11.89, y: 66.99 } },   // Climate Scenarios -> Hazard Model (up)
      { from: { x: 18.89, y: 39.5 }, to: { x: 23.28, y: 39.5 } },
      { from: { x: 38.17, y: 39.5 }, to: { x: 42.6, y: 39.5 } },
      { from: { x: 57.44, y: 39.5 }, to: { x: 61.88, y: 39.5 } },
      { from: { x: 76.72, y: 39.5 }, to: { x: 81.16, y: 39.5 } }
    ],

    /* Feedback loops: both leave Adaptation/Interventions (top and bottom
       centre) and run back to the right-hand side of Transport Scenarios and
       Hazard Model. The corners are rounded when drawn. */
    feedbackPaths: [
      { points: [ { x: 69.31, y: 33.46 }, { x: 69.31, y: 18.7 }, { x: 18.84, y: 18.7 } ] },
      { points: [ { x: 69.31, y: 45.65 }, { x: 69.31, y: 60.96 }, { x: 18.84, y: 60.96 } ] }
    ],

    /* Up the climate chain, then left-to-right along the decision chain, then
       the feedback loop closes the round trip back on Transport Scenarios —
       the box the cycle starts from. Every leg but one follows a drawn arrow;
       the climate chain and the decision chain run side by side rather than
       into each other, so stepping between them is a move along the diagram,
       not along a connector. */
    tour: [
      "climate-scenarios",
      "hazard-model",
      "impact-assessment",
      "bau",
      "risk-reduction-needs",
      "adaptation-interventions",
      "outcome-assessment",
      { box: "transport-scenarios", via: { from: "adaptation-interventions", to: "transport-scenarios" } }
    ]
  },

  /* Level 1 Extended — built 17 Sept.
     Positions/text/connections extracted directly from slide 5 ("Overview
     of TPRAF: Extended Form") of the source PPTX, the same way Simple was
     built. Box "group" (dsp/imp/both) comes from comparing slide 5 against
     slides 8/9 ("Overview of DSP/IMP embedded within TPRAF") — those two
     slides are the same diagram with one process's boxes greyed out
     (BACKGROUND_2 theme colour) and the other left full colour, which is
     what the DSP-only/IMP-only toggle below reproduces. */
  extended: {
    title: "Overview of TPRAF: Extended Form",
    subtitle: "Level 1 — Extended",
    scale: 1.35,
    boxes: [
      {
        id: "transport-demand",
        label: "Transport Demand",
        pos: { left: 5.92, top: 25.48, width: 9.16, height: 6.88 },
        text: "Models used to build a statistically representative population of the study area, with a variety of socio-demographic attributes (e.g., age, sex, income) and activity plans (e.g., trip purpose, starting time, main transport mode, origin-destination), such as NTEM, LUISA, UDM, SILO, and MITO, to represent the demand on the transport system. For freight, this is vehicle schedules and delivery plans.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "transport-supply",
        label: "Transport Supply",
        pos: { left: 15.74, top: 25.48, width: 9.16, height: 6.88 },
        text: "The transport infrastructure on which people and goods can travel. This is a geospatial representation of the roads, railways, cycleways, footways, or other transport routes that allow people to move around the study area, with attributes representing conditions such as travel speed, capacity, modes allowed, or the presence of climate hazards.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "transport-system",
        label: "Transport System",
        pos: { left: 10.4, top: 37.61, width: 9.74, height: 6.81 },
        text: "The combination of supply and demand that represents the transport system being simulated in the IMP. For future scenarios, this will be the transport system envisaged under a set of decarbonisation policies, which may include modal shift, technological change, or demand change.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "social-behaviour-impacts",
        label: "Social Behaviour Impacts",
        /* The source PPTX rotates this shape 270° — pos is its unrotated
           frame (rotation happens around the frame's own centre, same as
           PowerPoint), which is what makes it render tall/narrow instead
           of the wide/short shape pos alone would suggest. */
        pos: { left: 0.18, top: 53.9, width: 9.16, height: 6.82 },
        rotate: 270,
        text: "Analysis of daily activity plans depending on the impact of weather conditions (e.g., rainfall, heat, windstorms).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "weather-variables",
        label: "Weather Variables",
        pos: { left: 5.82, top: 83.84, width: 9.16, height: 6.82 },
        text: "Outputs from the climate scenarios that give weather conditions under a future disruptive event (such as a rainfall timeseries or daily temperature output).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "climate-scenario",
        label: "Climate Scenario",
        pos: { left: 16.52, top: 83.84, width: 9.16, height: 6.82 },
        text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "hazard-model",
        label: "Hazard Model",
        pos: { left: 9.78, top: 72.1, width: 10.36, height: 6.82 },
        text: "Tools to estimate the impact of a climate-related phenomenon on the transport system, such as CADDIES, CityCAT, and VITO UrbClim + HiREx.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "transport-specific-threshold",
        label: "Transport Specific Threshold",
        pos: { left: 9.78, top: 62.29, width: 10.34, height: 6.82 },
        text: "Analysis of the impacts of weather conditions (e.g., rain, heat) on different modes of transport (e.g., car, public transport, active modes).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "impact-assessment",
        label: "Impact Assessment/\nPerformance Metrics",
        pos: { left: 9.78, top: 51.06, width: 10.34, height: 8.6 },
        text: "Analysis of the impact of the climate hazard (e.g. flooding, high temperatures) on the transport system. This is simulated by changing the supply (performance of transport links in the network) and observing the response of users. Performance metrics measure how well the system is able to continue operation and withstand the impacts, but also the cost of the disruption to the system and its users.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "asset-network-evaluation",
        label: "Asset/Network Evaluation",
        pos: { left: 22.01, top: 51.95, width: 9.16, height: 6.82 },
        text: "This process develops an understanding of how the system currently functions and establishes a baseline understanding of the condition, capacity and constraints (including infrastructure degradation/deterioration and vulnerabilities created by climate change).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      },
      {
        id: "problem-framing",
        label: "Problem Framing",
        pos: { left: 32.82, top: 51.95, width: 9.16, height: 6.82 },
        text: "This process involves setting objectives and scope/boundary by clearly identifying what needs to be adapted and why. Defining the geographic scope (e.g., specific rail corridor, coastal zone, urban catchment), temporal horizons (typically to 2050, 2080, or 2100), and the assets or services required. As well as capturing external factors (stakeholder needs, policy environment, and socio-economic conditions) and constraints (budget, technical feasibility, environmental restrictions, and political considerations).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      },
      {
        id: "risk-reduction-needs",
        label: "Risk Reduction Needs",
        pos: { left: 43.79, top: 51.92, width: 9.16, height: 6.88 },
        text: "This process applies a screening criteria to filter the long-list to a short-list of potential options for detailed pathway development informed by the risk and resilience assessment. As well as identifying / inputting thresholds / tipping points.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      },
      {
        id: "adaptation-interventions",
        label: "Adaptation/\nInterventions",
        pos: { left: 54.76, top: 51.9, width: 9.16, height: 6.93 },
        text: "Options and pathways to improve resilience, adaptation, sustainability, and transport performance.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "leaf",
        group: "both"
        /* No halo here (unlike Simple's) — the Risk Mitigation cluster
           background already gives this box its visual emphasis; adding
           the halo on top produced a "double background" look. */
      },
      {
        id: "cost-benefit",
        label: "Cost benefit/ Multi-Criteria analysis",
        pos: { left: 65.2, top: 51.9, width: 10.36, height: 6.93 },
        text: "This process involves a criteria selection process and a detailed development and assessment of shortlisted options / pathways.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      },
      {
        id: "portfolio-optimisation",
        label: "Portfolio Optimisation",
        pos: { left: 76.84, top: 51.9, width: 9.16, height: 6.93 },
        text: "This process looks at combining and sequencing multiple interventions/pathways to utilise and bundle resources if possible.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      },
      {
        id: "outcome-assessment",
        label: "Outcome Assessment",
        pos: { left: 88.0, top: 51.9, width: 9.16, height: 6.93 },
        text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky",
        group: "dsp"
      }
    ],

    /* Light-blue rounded-rect backgrounds behind each cluster of boxes —
       present in the source PPTX behind Transport Scenarios, Weather/
       Climate, Business as usual, and Risk Mitigation. Purely decorative
       (non-interactive), drawn behind everything else. */
    /* "group" here matches the PPTX's own DSP-only/IMP-only slides: the
       cluster keeps its light-blue fill only in the view where most/all of
       its member boxes are active. Risk Mitigation contains Adaptation
       (both) + Cost benefit + Portfolio (dsp-only) — the two dsp-only
       members make it a "dsp" cluster overall, so it loses its fill in
       IMP-only view even though Adaptation/Interventions itself stays lit. */
    containers: [
      { id: "transport-scenarios-bg", pos: { left: 5.26, top: 24.49, width: 20.61, height: 9.15 }, group: "imp" },
      { id: "weather-climate-bg", pos: { left: 5.04, top: 82.65, width: 21.49, height: 9.15 }, group: "imp" },
      { id: "bau-bg", pos: { left: 21.13, top: 50.34, width: 21.65, height: 10.06 }, group: "dsp" },
      { id: "risk-mitigation-bg", pos: { left: 53.98, top: 50.44, width: 32.74, height: 9.96 }, group: "dsp" }
    ],

    /* Non-interactive section titles — group headings above a cluster of
       boxes, not standalone content in the source PPTX, so (unlike labels
       below) they don't open a popup. */
    headings: [
      {
        id: "transport-scenarios-heading",
        label: "Transport Scenarios",
        pos: { left: 4.79, top: 20.85, width: 11.02, height: 3.81 }
      },
      {
        id: "bau-heading",
        label: "Business as usual / Do nothing",
        pos: { left: 20.99, top: 46.43, width: 16.85, height: 3.81 }
      },
      {
        id: "risk-mitigation-heading",
        label: "Risk Mitigation",
        pos: { left: 64.85, top: 46.43, width: 11.02, height: 3.81 }
      }
    ],

    labels: [
      {
        id: "feedback-loop-top",
        label: "Feedback loop",
        pos: { left: 36.67, top: 24.6, width: 14.24, height: 3.81 },
        text: "Adaptation/Interventions decisions loop back to reshape the transport scenarios considered.",
        isPlaceholder: true,
        type: "feedback"
      },
      {
        id: "feedback-loop-bottom",
        label: "Feedback loop",
        pos: { left: 36.67, top: 76.4, width: 14.24, height: 3.81 },
        text: "Adaptation/Interventions decisions loop back to refine the hazard model.",
        isPlaceholder: true,
        type: "feedback"
      }
    ],

    /* Main flow arrows — box-edge to box-edge, from the PPTX connectors'
       own start/end shape-attachment data (same method used for Simple).
       "group" is the DSP/IMP process this connection belongs to — "mixed"
       for the one arrow that bridges the two chains (Impact Assessment ->
       Asset/Network Evaluation), which greys out in EITHER filtered view
       since it's not fully "inside" either process. Drives the DSP/IMP
       toggle's arrow colouring in app.js, same idea as box.group. */
    arrows: [
      // Transport Demand / Supply -> Transport System and Weather Variables ->
      // Hazard Model: straight lines. Each x sits inside both boxes' widths.
      { from: { x: 12, y: 32.36 }, to: { x: 12, y: 37.61 }, group: "imp" },       // Transport Demand -> Transport System
      { from: { x: 18.5, y: 32.36 }, to: { x: 18.5, y: 37.61 }, group: "imp" },   // Transport Supply -> Transport System
      { from: { x: 12.4, y: 83.84 }, to: { x: 12.4, y: 78.92 }, group: "imp" },   // Weather Variables -> Hazard Model (straight up)
      { from: { x: 14.95, y: 44.42 }, to: { x: 14.95, y: 51.06 }, group: "imp" },   // Transport System -> Impact Assessment
      { from: { x: 16.52, y: 87.25 }, to: { x: 14.98, y: 87.25 }, group: "imp" },   // Climate Scenario -> Weather Variables
      { from: { x: 14.96, y: 72.1 }, to: { x: 14.96, y: 69.11 }, group: "imp" },    // Hazard Model -> Transport Specific Threshold (up)
      { from: { x: 14.95, y: 62.29 }, to: { x: 14.95, y: 59.66 }, group: "imp" },   // Transport Specific Threshold -> Impact Assessment (up)
      { from: { x: 20.12, y: 55.36 }, to: { x: 22.01, y: 55.36 }, group: "mixed" }, // Impact Assessment -> Asset/Network Evaluation
      { from: { x: 31.17, y: 55.36 }, to: { x: 32.82, y: 55.36 }, group: "dsp" },   // Asset/Network Evaluation -> Problem Framing
      { from: { x: 41.98, y: 55.36 }, to: { x: 43.79, y: 55.36 }, group: "dsp" },   // Problem Framing -> Risk Reduction Needs
      { from: { x: 52.95, y: 55.36 }, to: { x: 54.76, y: 55.36 }, group: "dsp" },   // Risk Reduction Needs -> Adaptation/Interventions
      { from: { x: 63.92, y: 55.36 }, to: { x: 65.2, y: 55.36 }, group: "dsp" },    // Adaptation/Interventions -> Cost benefit
      { from: { x: 75.56, y: 55.36 }, to: { x: 76.84, y: 55.36 }, group: "dsp" },   // Cost benefit -> Portfolio Optimisation
      { from: { x: 86.0, y: 55.36 }, to: { x: 88.0, y: 55.36 }, group: "dsp" }      // Portfolio Optimisation -> Outcome Assessment
    ],

    /* Elbow connectors for boxes that aren't directly aligned — approximated
       the same way Simple's feedback loops were (exact box connections
       confirmed via the PPTX, exact bend pixels are a clean approximation).
       Drawn in the main flow colour (navy), not the feedback green. */
    elbowPaths: [
      /* Endpoints on Social Behaviour Impacts use its rotated visual footprint
         (centre (4.76, 57.31), 6.82 wide x 9.16 tall) rather than the
         unrotated pos above — same rotation, applied around the same centre. */
      { points: [ { x: 5.82, y: 87.25 }, { x: 4.76, y: 87.25 }, { x: 4.76, y: 61.89 } ], group: "imp" },           // Weather Variables -> Social Behaviour Impacts (visual bottom)
      // Enters Transport Demand's left wall at vertical mid-height, not its
      // bottom — final leg is horizontal so the arrowhead points right, into
      // the wall, instead of up into the underside of the box.
      { points: [ { x: 4.76, y: 52.73 }, { x: 4.76, y: 28.92 }, { x: 5.92, y: 28.92 } ], group: "imp" }            // Social Behaviour Impacts (visual top) -> Transport Demand (left wall)
    ],

    /* Feedback loops (green) — same pattern as Simple: Adaptation/Interventions
       loops back to both the Transport Scenarios cluster and the Hazard
       Model, confirmed via the PPTX's <a:stCxn>/<a:endCxn> data. Both land
       on IMP-only boxes (Transport Supply, Hazard Model), so both grey out
       in DSP-only view — Adaptation/Interventions itself being "both"
       doesn't rescue them, since the arrow's whole point is the IMP-side
       target it's looping back to. */
    feedbackPaths: [
      /* Final leg of each path is horizontal, so the arrowhead approaches
         and points straight into the target's vertical wall — a vertical
         final leg (as this had before) makes the marker point down/up
         instead of into the box, which read as "not clearly visible". */
      { points: [ { x: 59.34, y: 51.9 }, { x: 59.34, y: 28.92 }, { x: 24.9, y: 28.92 } ], group: "imp" },  // -> Transport Supply (right wall)
      { points: [ { x: 59.34, y: 58.83 }, { x: 59.34, y: 75.51 }, { x: 20.14, y: 75.51 } ], group: "imp" }  // -> Hazard Model (right wall)
    ],

    /* Portfolio Optimisation -> Adaptation/Interventions (cost-benefit
       iteration loop, within the Risk Mitigation cluster) — a smooth curve
       arcing below the row, in the main-flow navy (not feedback green),
       matching the reference render of this slide. Both ends are DSP-side
       (Portfolio Optimisation is DSP-only), so it greys out in IMP-only view. */
    curvedPaths: [
      { from: { x: 81.42, y: 58.83 }, control: { x: 70.38, y: 65 }, to: { x: 59.34, y: 58.83 }, group: "dsp" }
    ],

    /* Top-down through the decision chain, then back through both feedback
       loops into the modelling side, then up the climate chain and home onto
       Transport Demand — the box the walk set out from. Only one leg has no
       arrow to follow (the assessment point to the climate evidence base). */
    tour: [
      "transport-demand",
      "transport-system",
      "impact-assessment",
      "asset-network-evaluation",
      "problem-framing",
      "risk-reduction-needs",
      "adaptation-interventions",
      "cost-benefit",
      "portfolio-optimisation",
      "outcome-assessment",
      { box: "transport-supply", via: { from: "adaptation-interventions", to: "transport-supply" } },
      { box: "hazard-model", via: { from: "adaptation-interventions", to: "hazard-model" } },
      "transport-specific-threshold",
      "impact-assessment",
      "climate-scenario",
      "weather-variables",
      "social-behaviour-impacts",
      "transport-demand"
    ]
  },

  /* Level 2 — DSP components. Built 20 Sept.
     The source PPTX (slide 11, "Overview of DSP components") is a flat
     pasted screenshot, not editable shapes — no geometry to extract, and
     the client's own note on slide 13 explicitly invites a redesign
     ("can be more oriented as long as the groups, links and key stay the
     same"). So this is a from-scratch layout in brand colors, reusing the
     same box/container/arrow system as Level 1, rather than a pixel trace.
     Colour key (kept deliberately simple, only the 4 approved brand
     colours): navy = a tool/model step, sky = a scenario/context input,
     leaf = the key outcome, plain white = an input/output artefact —
     matches the source's own tool-vs-input/output distinction. The six
     process-stage groupings from the source image are preserved as
     labelled clusters left-to-right in the same order. */
  dsp: {
    scale: 1.4,
    title: "Overview of DSP Components",
    subtitle: "Level 2 — Decision Support Process",
    legend: [
      ["navy", "Tool or model step"],
      ["io", "Input or output artefact"],
      ["c1", "Asset/Network Evaluation"],
      ["c2", "Problem Framing and Scope"],
      ["c3", "Risk Reduction Analysis"],
      ["c4", "Detailed Option Assessment"],
      ["c5", "Portfolio Optimisation"],
      ["c6", "Outcome Assessment"]
    ],
    /* Layout note: every position below comes from a small script that
       computes cluster widths, per-column box stacking (with a deliberate
       4-unit vertical gap so double-headed arrows have visible room to
       draw), and the Risk Reduction Analysis / Detailed Option Assessment
       sub-layouts, then checks nothing overlaps before any number gets
       used here — see the commit message for how it was verified. */
    boxes: [
      // Standalone inputs — coloured to match the cluster they feed, not a
      // generic "input" colour (Transport/Climate Scenarios match Asset/
      // Network Evaluation's blue; Requirements/Context/Constraints match
      // Problem Framing's grey).
      { id: "dsp-transport-scenarios", label: "Transport Scenarios", pos: { left: 3.93, top: 12.88, width: 10.74, height: 3.93 }, text: "Input to the Asset/Network Evaluation Process: Representation of current and/or future travel demand and transport network supply; may be modelled utilising the methods contained within the Integrated Modelling Platform (IMP).", isPlaceholder: false, handbookUrl: "#", variant: "sky-pale" },
      { id: "dsp-climate-scenarios", label: "Climate Scenarios", pos: { left: 3.93, top: 19.76, width: 10.74, height: 3.93 }, text: "Input to the Asset/Network Evaluation Process: Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections); also contained within the Integrated Modelling Platform (IMP).", isPlaceholder: false, handbookUrl: "#", variant: "sky-pale" },
      { id: "dsp-requirements", label: "Requirements", pos: { left: 19.93, top: 6.0, width: 10.74, height: 3.93 }, text: "Input to the Problem Framing and Context Process. Relevant service, safety, regulatory, design, and performance requirements.", isPlaceholder: false, handbookUrl: "#", variant: "c2-input" },
      { id: "dsp-context", label: "Context", pos: { left: 19.93, top: 12.88, width: 10.74, height: 3.93 }, text: "Input to the Problem Framing and Context Process. Relevant operational, spatial, environmental, access, planning, delivery, and resource constraints.", isPlaceholder: false, handbookUrl: "#", variant: "c2-input" },
      // Same wording as Context, deliberately — the client's 23 Sept note says the team may delete this box later (tbc); fine to stay for now.
      { id: "dsp-constraints", label: "Constraints", pos: { left: 19.93, top: 19.76, width: 10.74, height: 3.93 }, text: "Input to the Problem Framing and Context Process. Relevant operational, spatial, environmental, access, planning, delivery, and resource constraints.", isPlaceholder: false, handbookUrl: "#", variant: "c2-input" },

      // Cluster 1 — Asset/Network Evaluation, doubled in width to match the
      // source's much wider leftmost stage. Middle three still sit in the
      // dashed sub-group; the Asset Performance connectors are one-way
      // (up into Risk Assessment, down into Resilience Assessment).
      { id: "dsp-sustainability", label: "Sustainability", pos: { left: 3.93, top: 34.68, width: 10.74, height: 3.93 }, text: "Identifies and measures sustainability and environmental goals in line with net zero, decarbonisation, pollution, and biodiversity plans, supporting sustainable supply chains and embedding environmental criteria into procurement, design, construction, and the asset lifecycle within available budgets.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-risk-assessment", label: "Risk Assessment", pos: { left: 3.93, top: 41.56, width: 10.74, height: 3.93 }, text: "Quantifies risks of failure and disruption, evaluates risks of inaction measures at asset, system, and network levels, including risks from infrastructure ageing, extreme weather, climate change, and other shocks. Engaging with different organisations to understand their risk tolerance and, based on this, identify and/or prioritise their risk reduction needs.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-performance", label: "Asset Performance", pos: { left: 3.93, top: 48.74, width: 10.74, height: 3.93 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-resilience-assessment", label: "Resilience Assessment", pos: { left: 3.93, top: 55.93, width: 10.74, height: 3.93 }, text: "Uses asset condition and performance information to understand how assets, systems and networks may respond to disruption and recover following disruptive events. Resilience assessments may identify performance vulnerabilities that require further investigation within the Asset Performance Module.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-asset-registry", label: "Asset Registry", pos: { left: 3.93, top: 63.11, width: 10.74, height: 3.93 }, text: "Catalogues all existing assets (type, location, condition, history) and serves as the central database from which all other analyses are conducted, ensuring asset information is accessible.", isPlaceholder: false, handbookUrl: "#" },

      // Cluster 2 — Problem Framing and Scope, doubled to match the source's
      // wider second stage (same treatment as Asset/Network Evaluation).
      { id: "dsp-system-interdependencies", label: "System Interdependencies", pos: { left: 20.21, top: 34.68, width: 10.74, height: 5.4 }, text: "Establishes, and where possible quantifies, relationships between the asset and other assets, networks, users, and its wider policy and organisational, and climate change/environment context, in order to define the scope or boundary of assets considered in investment decisions and to identify the information sources required to support those decisions.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-problem-definition", label: "Problem Definition", pos: { left: 20.21, top: 43.52, width: 10.74, height: 5.4 }, text: "Problem statements translate identified vulnerabilities, risk and system challenges into clearly articulated transport problems. These may initially be developed as macro-level problem statement(s) representing strategic transport challenges associated with one or more vulnerability vectors.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-primary-impact-identification", label: "Primary Impact Identification", pos: { left: 20.21, top: 52.37, width: 10.74, height: 5.4 }, text: "The primary impacts of the problem statements on different transports system levels such as assets, networks, users and policy and organisational elements are identified.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-option-ideation", label: "Option Ideation (Long List)", pos: { left: 20.21, top: 61.21, width: 10.74, height: 5.4 }, text: "Intervention ideation is used to explore potential responses to the identified problem statement and their associated impacts.", isPlaceholder: false, handbookUrl: "#" },

      // Cluster 3 — Risk Reduction Analysis. Risk Thresholds on top (full
      // width); below it, well-spaced: Option Matrix (rotated vertical
      // label), the Selection/Screened list decision diamond, and the
      // Interventions "long list" — each with a real 2.5-unit gap between
      // them so the connecting arrows are legible, not overlapping the
      // boxes. Resilience Assessment sits underneath as its own row.
      { id: "dsp-risk-thresholds", label: "Risk Thresholds", pos: { left: 35.27, top: 34.68, width: 13.27, height: 3.93 }, text: "Compare the assessed risk against user-defined or organisational thresholds, tolerability criteria, statutory requirements, service standards, and risk appetite. This step determines whether the risk can be accepted or whether a defined risk reduction need must be established.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-option-matrix", label: "Option Matrix", pos: { left: 35.27, top: 41.07, width: 2.21, height: 19.1 }, vertical: true, text: "Options may be screened against factors such as strategic alignment, technical feasibility, environmental constraints, deliverability, affordability, stakeholder acceptability, and consistency with the objectives defined during the Problem Framing stage. The assessment should be transparent and documented to provide a clear rationale for the inclusion or exclusion of options.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-selection-screened-list", label: "Selection/\nScreened list", pos: { left: 38.91, top: 45.2, width: 5.98, height: 10.68 }, shape: "diamond", text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-interventions", label: "Interventions", pos: { left: 46.32, top: 41.07, width: 2.21, height: 19.1 }, vertical: true, text: "A list of interventions that are feasible, compliant, appropriate and able to achieve the required risk reductions. These could be a single intervention, multiple, adaptations or transformational pathways.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-resilience-assessment-2", label: "Resilience Assessment", pos: { left: 35.27, top: 62.68, width: 13.27, height: 3.93 }, text: "Based on the resilience analysis results from the IMP, considering both long-term trends and short-term event-based perspectives, to qualitatively assess whether resilience-related risks are present.", isPlaceholder: false, handbookUrl: "#" },

      // Cluster 4 — Detailed Option Assessment. "Multi Criteria / Cost
      // Benefit Analysis" runs as a rotated vertical label down the full
      // cluster height, with a real 2.5-unit gap before the 5-box stack
      // (same 4-unit vertical rhythm as clusters 1/2) to its right.
      // The criteria boxes emanate from the "Multi Criteria / Cost Benefit
      // Analysis" strip: their left edge lines up with the strip's right edge
      // and its left corners are squared (attachLeft), so they read as one
      // connected unit inside the group box.
      { id: "dsp-multi-criteria-cost-benefit", label: "Multi Criteria / Cost Benefit Analysis", pos: { left: 51.54, top: 34.68, width: 2.21, height: 32.36 }, vertical: true, text: "This process involves a criteria selection process and a detailed development and assessment of shortlisted options / pathways.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-performance-2", label: "Asset Performance", pos: { left: 54.44, top: 34.68, width: 10.33, height: 3.93 }, text: "Captures and updates the physical condition of assets, tracking deterioration and deformation as condition degrades over time.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-resilience-assessment-3", label: "Resilience Assessment", pos: { left: 54.44, top: 41.56, width: 10.33, height: 3.93 }, text: "Assesses how different interventions perform and how quickly assets and networks recover after implementation, including under disruptive events.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-sustainability-2", label: "Sustainability", pos: { left: 54.44, top: 48.74, width: 10.33, height: 3.93 }, text: "Identifies and measures sustainability and environmental goals in line with net zero, decarbonisation, pollution, and biodiversity plans, supporting sustainable supply chains and embedding environmental criteria into procurement, design, construction, and the asset lifecycle within available budgets.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-economic-impact", label: "Economic Impact", pos: { left: 53.4, top: 55.93, width: 11.37, height: 3.93 }, text: "Assess the cost, benefits and overall value of money of an intervention, helping decision maker understand the economic trade-offs between alternative options.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-criteria-xyz", label: "Criteria X, Y, Z", pos: { left: 52.02, top: 63.11, width: 12.75, height: 3.93 }, text: "The full appraisal can be expanded beyond the current module functionality to capture a wide range of user needs and project requirements. Additional criteria may include deliverability, supply-chain security, constructability, reputational effects, strategic alignment, governance, and stakeholder acceptability.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },

      // Cluster 5 — Portfolio Optimisation, widened to match Detailed Option
      // Assessment (same treatment as the other groups); its three steps sit
      // inside a dashed sub-group, matching the source.
      { id: "dsp-system-interdependencies-2", label: "System Interdependencies", pos: { left: 69.05, top: 36.03, width: 10.74, height: 7.68 }, text: "Establishes, and where possible quantifies, relationships between the asset and other assets, networks, users, and its wider policy and organisational, and climate change/environment context, in order to define the scope or boundary of assets considered in investment decisions and to identify the information sources required to support those decisions.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-solution-bundling", label: "Solution Bundling", pos: { left: 69.05, top: 46.66, width: 10.74, height: 7.68 }, text: "Solutions involve the identified alternative feasible portfolios from the shortlisted interventions. Additional outcomes include trade-offs across portfolio bundles, such as trade-offs associated with implementation modes or scales, schedules, and programme outcomes.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-resource-feasibility", label: "Resource and Feasibility", pos: { left: 69.05, top: 57.34, width: 10.74, height: 7.68 }, text: "Assess available budgets, physical resource capacities, implementation windows, and programme requirements. In addition to the interdependencies, these constraints form additional constraints to guide the design of feasible solutions.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },

      // Cluster 6 — Outcome Assessment. Plain tool box, no special
      // highlight — the source doesn't single this step out visually.
      { id: "dsp-asset-performance-3", label: "Asset Performance", pos: { left: 85.32, top: 34.68, width: 10.74, height: 7.68 }, text: "To evaluate whether assets continue to meet required performance objectives, service levels and operational requirements, using condition, capacity and serviceability information as evidence.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-intervention-effectiveness", label: "Intervention / Adaptation Effectiveness", pos: { left: 85.32, top: 47.02, width: 10.74, height: 7.68 }, text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-registry-2", label: "Asset Registry", pos: { left: 85.32, top: 59.37, width: 10.74, height: 7.68 }, text: "Catalogues all existing assets (type, location, condition, history) and serves as the central database from which all other analyses are conducted, ensuring asset information is accessible.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },

      // Cross-cutting Risk Assessment step and its funding/governance inputs.
      // Kept off the far right/bottom edge on purpose — that corner is where
      // the floating zoom widget docks (see style.css), same reason Level 1's
      // last row always ends well clear of it.
      { id: "dsp-risk-assessment-cross", label: "Risk Assessment", pos: { left: 60.9, top: 72.51, width: 10.74, height: 3.93 }, text: "Quantifies risks of failure and disruption, evaluates risks of inaction measures at asset, system, and network levels, including risks from decarbonisation strategies, extreme weather, climate change, and other shocks. Engaging with different organisations to understand their risk tolerance and, based on this, identify and/or prioritise their risk reduction needs.", isPlaceholder: false, handbookUrl: "#", variant: "leaf" },
      { id: "dsp-funding-budgets", label: "Funding / Budgets (Financial Case)", pos: { left: 50.81, top: 83.2, width: 9.64, height: 8.11 }, text: "Funding and budgeting processes, to test affordability and establish the financial case.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-procurement", label: "Procurement (Commercial Case)", pos: { left: 61.45, top: 83.2, width: 9.64, height: 8.11 }, text: "Procurement and commercial processes, to determine the delivery and contracting approach.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-pm-governance", label: "PM, Governance, Reporting (Management Case)", pos: { left: 72.09, top: 83.2, width: 9.64, height: 8.11 }, text: "Implementation and monitoring, to deliver the selected intervention and generate updated condition, cost and performance evidence for future risk and mitigation assessments.", isPlaceholder: false, handbookUrl: "#", variant: "navy" }
    ],

    containers: [
      { id: "dsp-c1-bg", variant: "c1", pos: { left: 2.0, top: 26.64, width: 14.6, height: 42.79 } },
      { id: "dsp-c2-bg", variant: "c2", pos: { left: 18.28, top: 26.64, width: 14.6, height: 42.79 } },
      { id: "dsp-c3-bg", variant: "c3", pos: { left: 34.58, top: 26.64, width: 14.6, height: 42.79 } },
      { id: "dsp-c4-bg", variant: "c4", pos: { left: 50.85, top: 26.64, width: 14.6, height: 42.79 } },
      { id: "dsp-c5-bg", variant: "c5", pos: { left: 67.12, top: 26.64, width: 14.6, height: 42.79 } },
      { id: "dsp-c6-bg", variant: "c6", pos: { left: 83.4, top: 26.65, width: 14.6, height: 42.77 } },
      // Dashed sub-groupings and the outer boundary, as drawn in the Figma design.
      { id: "dsp-c1-subgroup", style: "dashed", pos: { left: 3.23, top: 40.11, width: 12.19, height: 21.06 } },
      { id: "dsp-c2-subgroup", style: "dashed", pos: { left: 19.57, top: 42.14, width: 12.19, height: 25.73 } },
      { id: "dsp-c5-subgroup", style: "dashed", pos: { left: 68.1, top: 34.34, width: 12.68, height: 32.79 } },
      { id: "dsp-c4-c5-outer", style: "dashed", pos: { left: 50.03, top: 25.31, width: 32.51, height: 45.94 } }
    ],

    // Five of these six carry the column-level process summary the client
    // sent 23 Sept (Column 1/2/3/5/6 of "DSP Diagram Box Descriptors"), so
    // the whole cluster (title bar + background) is clickable — see
    // makeHeadingEl/makeContainerEl in app.js. Column 4's summary was
    // explicitly marked "[vertical box]" by the client, i.e. it belongs on
    // the Multi Criteria/Cost Benefit Analysis box instead, so dsp-c4-heading
    // is left without text and stays a plain, non-clickable title bar.
    headings: [
      { id: "dsp-c1-heading", label: "Asset/Network Evaluation", pos: { left: 2.69, top: 27.62, width: 13.27, height: 3.81 }, variant: "c1", text: "This process develops an understanding of how the system currently functions and establishes a baseline understanding of the condition, capacity and constraints (including infrastructure degradation/deterioration and vulnerabilities created by climate change).", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-c2-heading", label: "Problem Framing and Scope", pos: { left: 18.96, top: 27.62, width: 13.27, height: 3.81 }, variant: "c2", text: "This process involves setting objectives and scope/boundary by clearly identifying what needs to be adapted and why. Defining the geographic scope (e.g., specific rail corridor, coastal zone, urban catchment), temporal horizons (such as 2050, 2080, or 2100), and the assets or services required. As well as capturing external factors (stakeholder needs, policy environment, and socio-economic conditions) and constraints (budget, technical feasibility, environmental restrictions, and political considerations).", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-c3-heading", label: "Risk Reduction Analysis", pos: { left: 35.27, top: 27.62, width: 13.27, height: 3.81 }, variant: "c3", text: "This process applies a screening criteria to filter the long-list to a short-list of potential options for detailed pathway development informed by the risk and resilience assessment. As well as identifying / inputting thresholds / tipping points.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-c4-heading", label: "Detailed Option Assessment", pos: { left: 51.54, top: 27.62, width: 13.27, height: 3.81 }, variant: "c4" },
      { id: "dsp-c5-heading", label: "Portfolio Optimisation", pos: { left: 67.81, top: 27.62, width: 13.27, height: 3.81 }, variant: "c5", text: "This process looks at combining and sequencing multiple interventions/pathways to utilise and bundle resources if possible.", isPlaceholder: false, handbookUrl: "#" },
      { id: "dsp-c6-heading", label: "Outcome Assessment", pos: { left: 84.08, top: 27.62, width: 13.27, height: 3.81 }, variant: "c6", text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.", isPlaceholder: false, handbookUrl: "#" }
    ],

    /* Connectors as drawn in the Figma design (its coordinates mapped into
       slide percentages). */
    arrows: [
      { from: { x: 9.32, y: 16.81 }, to: { x: 9.32, y: 19.76 } },   // Transport Scenarios -> Climate Scenarios
      { from: { x: 9.32, y: 23.69 }, to: { x: 9.32, y: 26.65 } },   // Climate Scenarios -> Asset/Network Evaluation
      { from: { x: 25.32, y: 9.93 }, to: { x: 25.32, y: 12.88 } },   // Requirements -> Context
      { from: { x: 25.32, y: 16.81 }, to: { x: 25.32, y: 19.76 } },   // Context -> Constraints
      { from: { x: 25.32, y: 23.69 }, to: { x: 25.32, y: 26.65 } },   // Constraints -> Problem Framing
      { from: { x: 16.61, y: 47.26 }, to: { x: 18.28, y: 47.26 } },   // Asset/Network Evaluation -> Problem Framing
      { from: { x: 32.88, y: 47.26 }, to: { x: 34.54, y: 47.26 } },   // Problem Framing -> Risk Reduction Analysis
      { from: { x: 49.19, y: 47.26 }, to: { x: 50.85, y: 47.26 } },   // Risk Reduction Analysis -> Detailed Option Assessment
      { from: { x: 65.46, y: 47.26 }, to: { x: 67.12, y: 47.26 } },   // Detailed Option Assessment -> Portfolio Optimisation
      { from: { x: 81.73, y: 47.26 }, to: { x: 83.39, y: 47.26 } },   // Portfolio Optimisation -> Outcome Assessment
      { from: { x: 9.32, y: 38.61 }, to: { x: 9.32, y: 41.55 }, bidirectional: true },   // Sustainability <-> Risk Assessment
      { from: { x: 9.32, y: 48.74 }, to: { x: 9.32, y: 45.49 } },   // Asset Performance -> Risk Assessment (up)
      { from: { x: 9.32, y: 52.67 }, to: { x: 9.32, y: 55.93 } },   // Asset Performance -> Resilience Assessment (down)
      { from: { x: 9.32, y: 59.86 }, to: { x: 9.32, y: 63.12 }, bidirectional: true },   // Resilience Assessment <-> Asset Registry
      { from: { x: 25.58, y: 40.09 }, to: { x: 25.58, y: 43.53 } },   // System Interdependencies -> Problem Definition
      { from: { x: 25.58, y: 48.92 }, to: { x: 25.58, y: 52.36 } },   // Problem Definition -> Primary Impact ID
      { from: { x: 25.58, y: 57.78 }, to: { x: 25.58, y: 61.21 } },   // Primary Impact ID -> Option Ideation
      { from: { x: 41.9, y: 38.61 }, to: { x: 41.9, y: 45.22 } },   // Risk Thresholds -> Selection/Screened list
      { from: { x: 41.9, y: 62.68 }, to: { x: 41.9, y: 55.89 } },   // Resilience Assessment -> Selection/Screened list
      { from: { x: 37.48, y: 50.51 }, to: { x: 38.92, y: 50.51 } },   // Option Matrix -> Selection/Screened list
      { from: { x: 44.94, y: 50.51 }, to: { x: 46.32, y: 50.51 } },   // Selection/Screened list -> Interventions
      { from: { x: 66.23, y: 76.44 }, to: { x: 66.23, y: 83.2 } }   // Risk Assessment -> Procurement
    ],

    elbowPaths: [
      // The cross-cutting Risk Assessment sits under the Detailed Option
      // Assessment and Portfolio Optimisation groups: out of Portfolio
      // Optimisation, along beneath them, and back up into Detailed Option
      // Assessment (only that end carries the arrowhead).
      { points: [ { x: 74.94, y: 69.87 }, { x: 74.94, y: 74.48 }, { x: 71.64, y: 74.48 } ], head: false },   // Portfolio Optimisation -> Risk Assessment (cross)
      { points: [ { x: 60.9, y: 74.48 }, { x: 58.14, y: 74.48 }, { x: 58.14, y: 69.87 } ] },   // Risk Assessment (cross) -> Detailed Option Assessment group
      // The funding and governance cases hang off Risk Assessment.
      { points: [ { x: 66.23, y: 79.24 }, { x: 55.75, y: 79.24 }, { x: 55.75, y: 83.2 } ] },   // Risk Assessment -> Funding/Budgets
      { points: [ { x: 66.23, y: 79.24 }, { x: 77.2, y: 79.24 }, { x: 77.2, y: 83.2 } ] }    // Risk Assessment -> PM/Governance
    ],

    /* Inputs, then one process stage at a time left to right, reading each
       cluster top-down. The stages themselves are chained by the cluster-to-
       cluster arrows; within a stage the steps are a working sequence rather
       than a chain (the criteria boxes, and Outcome Assessment's three steps,
       all hang off the same stage), so those are highlighted in turn. */
    tour: [
      "dsp-transport-scenarios",
      "dsp-climate-scenarios",
      "dsp-sustainability",
      "dsp-risk-assessment",
      "dsp-asset-performance",
      "dsp-resilience-assessment",
      "dsp-asset-registry",
      "dsp-requirements",
      "dsp-context",
      "dsp-constraints",
      "dsp-system-interdependencies",
      "dsp-problem-definition",
      "dsp-primary-impact-identification",
      "dsp-option-ideation",
      "dsp-risk-thresholds",
      "dsp-option-matrix",
      "dsp-selection-screened-list",
      "dsp-interventions",
      "dsp-resilience-assessment-2",
      "dsp-multi-criteria-cost-benefit",
      "dsp-asset-performance-2",
      "dsp-resilience-assessment-3",
      "dsp-sustainability-2",
      "dsp-economic-impact",
      "dsp-criteria-xyz",
      "dsp-system-interdependencies-2",
      "dsp-solution-bundling",
      "dsp-resource-feasibility",
      "dsp-asset-performance-3",
      "dsp-intervention-effectiveness",
      "dsp-asset-registry-2",
      "dsp-risk-assessment-cross",
      "dsp-funding-budgets",
      "dsp-procurement",
      "dsp-pm-governance"
    ]
  },

  /* Level 2 — IMP components. Redrawn 20 Sept from level_2_slide_12.png as a
     direct reproduction rather than a brand-palette reinterpretation: the
     slide's own box colours (its key runs Tool / Input-Output plus one colour
     per modelling domain), its own cluster blocks and their shapes, its
     connector routing, and its KEY panel all appear here as drawn. The slide
     is a flat pasted screenshot with no extractable shape geometry, so every
     position below was measured off the image itself — one pixel scan per
     fill colour, each bounding box converted into the 0-100 slide space the
     renderer works in.

     Two consequences of that worth knowing before editing:
     - The KEY panel is built from containers plus headings, not boxes. It is
       a reference, so it must not look like something you can click into.
     - The slide's blocks are unlabelled tints with the domain's name written
       inside them, so those names are transparent headings here rather than
       the colour-bar titles DSP uses. Three of the blocks aren't plain
       rectangles — the demand and climate blocks are L-shaped and the
       adaptation block is a ring — so they are assembled from overlapping
       divs plus a white cut-out; see the containers array. */
  imp: {
    title: "Overview of IMP Components",
    subtitle: "Level 2 — Integrated Modelling Platform",
    scale: 1.5,
    // Leads on to the Level 3 example module (see the `level3` view below).
    next: { key: "level3", label: "See the Level 3 example: from rainfall to transport disruption" },
    legend: [
      ["tool", "Tool"],
      ["io", "Input / Output"],
      ["social", "Social Behavioural Impacts"],
      ["demand", "Transport Demand"],
      ["threshold", "Transport-specific Threshold"],
      ["supply", "Transport Supply"],
      ["climate", "Climate Scenario, Weather Variables & Hazard Models"],
      ["freight", "Freight"],
      ["adapt", "Adaptation Measures"],
      ["passenger", "Passenger Transport Model"]
    ],

    boxes: [
      // Climate Scenario, Weather Variables & Hazard Models (bottom left).
      { id: "imp-atmospheric-fields", label: "Atmospheric fields, soil fields, sea surface temperature etc.", compact: true, pos: { left: 3.04, top: 49.16, width: 13.22, height: 9.52 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-ukcp18-modelling", label: "UKCP18-Local Modelling of the atmosphere", pos: { left: 3.27, top: 65.27, width: 12.99, height: 7.42 }, text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).", isPlaceholder: false, handbookUrl: "#", variant: "model-green" },
      { id: "imp-weather-event", label: "Weather Event", pos: { left: 3.19, top: 78.43, width: 13.07, height: 5.04 }, text: "Based on a specific climate scenario (e.g. current climate, future climate under the effect of specific climate change conditions), weather variables are estimated to define specific weather conditions (e.g., convective rainfall, extreme floods or acute heatwave events).", isPlaceholder: false, handbookUrl: "#" },
      { id: "imp-heat-model", label: "Heat Model", pos: { left: 21.25, top: 74.23, width: 8.4, height: 4.62 }, text: "Simulates heat exposure and temperature extremes to identify heat-related risks to transport infrastructure and users.", isPlaceholder: false, handbookUrl: "#", variant: "model-green" },
      { id: "imp-hydrological-model", label: "Hydrological Model", pos: { left: 21.25, top: 82.35, width: 8.4, height: 4.62 }, text: "Simulates flooding and water movement to identify areas of transport infrastructure exposed to flood hazards and disruption.", isPlaceholder: false, handbookUrl: "#", variant: "model-green" },
      { id: "imp-temporal-temp-maps", label: "Temporal air and surface temperature maps", pos: { left: 32.06, top: 67.37, width: 8.95, height: 12.74 }, text: "Maps changes in air and surface temperatures over time to identify heat exposure and transport-related risks.", isPlaceholder: false, handbookUrl: "#" },
      { id: "imp-temporal-flood-maps", label: "Temporal flood maps", pos: { left: 32.22, top: 81.93, width: 8.79, height: 5.04 }, text: "Maps the extent, depth, and progression of flooding over time to identify transport disruption and flood risk.", isPlaceholder: false, handbookUrl: "#" },

      // Social behavioural impacts and the travel-demand threshold.
      { id: "imp-weather-trip-decisions", label: "Weather impacts on trip decisions", pos: { left: 31.13, top: 37.96, width: 8.79, height: 7.84 }, text: "Represents how weather conditions alter travel demand and behaviour, including trip cancellation, mode choice, departure times, routes, and destination choices.", isPlaceholder: false, handbookUrl: "#", variant: "grey-box" },
      { id: "imp-transport-specific-threshold", label: "Transport-Specific Threshold", pos: { left: 30.51, top: 53.08, width: 8.79, height: 7.14 }, text: "A transport-specific threshold is the point at which a weather or climate-related hazard begins to adversely affect a transport receptor, resulting in a reduction in service quality, operational disruption, or physical damage to an asset.", isPlaceholder: false, handbookUrl: "#", variant: "threshold-magenta" },

      // Transport Demand (top right), running down the spine.
      { id: "imp-ntem", label: "Future Population Scenarios", pos: { left: 57.12, top: 4.9, width: 9.81, height: 4.62 }, text: "Demographic, socioeconomic, land-use, and travel-behaviour information to generate future trip-end forecasts.", isPlaceholder: false, handbookUrl: "#", variant: "tool" },
      { id: "imp-building-dev-model", label: "Building Development Model", pos: { left: 81.09, top: 14.43, width: 14.16, height: 4.62 }, text: "Spatial development of households, population, employment, housing, and land-use over time.", isPlaceholder: false, handbookUrl: "#", variant: "tool" },
      { id: "imp-projected-population", label: "Projected Synthetic Population", pos: { left: 56.19, top: 24.79, width: 11.75, height: 5.04 }, text: "Synthetic population generation is used to construct a statistically representative population from available aggregate and sample data.", isPlaceholder: false, handbookUrl: "#", variant: "tool" },
      { id: "imp-activity-plans", label: "Activity Plans assignment", pos: { left: 57.51, top: 39.64, width: 9.18, height: 4.62 }, text: "Who is travelling, as well as activity plans that describe where, when, why, and how they travel. Together, these components provide a microscopic representation of travel demand that can subsequently be assigned to and simulated on a transport network.", isPlaceholder: false, handbookUrl: "#", variant: "tool" },
      { id: "imp-synthetic-travel-demand", label: "Synthetic travel demand", pos: { left: 57.12, top: 50.28, width: 9.73, height: 5.04 }, text: "Creates a statistically representative population and travel patterns to represent demand for transport services.", isPlaceholder: false, handbookUrl: "#" },

      // Transport supply and freight — two separate blocks in the source.
      { id: "imp-transport-network", label: "Transport Network", pos: { left: 47.08, top: 66.81, width: 8.1, height: 5.04 }, text: "A digital geospatial network describing physical infrastructure, including roads, railways, airports, and other transport facilities, together with public transport services such as routes, stops, service frequencies, and timetables.", isPlaceholder: false, handbookUrl: "#" },
      { id: "imp-multimodal-network", label: "Multi-modal Network", pos: { left: 47.08, top: 74.65, width: 8.1, height: 4.62 }, text: "Additional layers that describes the public transport infrastructure and services which can then be represented in order to incorporate multimodal travel.", isPlaceholder: false, handbookUrl: "#", variant: "multi-orange" },
      { id: "imp-freight-transport-model", label: "Freight Transport Model", pos: { left: 58.52, top: 78.71, width: 7.16, height: 6.86 }, text: "Simulates freight movements and logistics operations to assess disruption impacts, adaptation options, and network resilience.", isPlaceholder: false, handbookUrl: "#", variant: "freight-sand" },

      // The convergence point, then appraisal and the adaptation outputs.
      { id: "imp-passenger-transport-model", label: "Passenger Transport Model", pos: { left: 58.52, top: 65.13, width: 7.16, height: 8.4 }, text: "Simulates how people travel through transport networks to assess disruption impacts, adaptation options, and system resilience.", isPlaceholder: false, handbookUrl: "#", variant: "passenger-red" },
      { id: "imp-impact-assessment", label: "Impact Assessment/\nPerformance Metrics", pos: { left: 70.58, top: 66.95, width: 12.61, height: 4.9 }, text: "Quantifies the economic, social, environmental, and operational impacts of disruption and adaptation options.", isPlaceholder: false, handbookUrl: "#" },
      { id: "imp-adaptation-measures", label: "Adaptation Measures", pos: { left: 88.79, top: 66.39, width: 7.32, height: 6.16 }, text: "Measures and interventions being considered to reduce the risk and increase resilience of the population and/or the transport network.", isPlaceholder: false, handbookUrl: "#", variant: "adapt-teal" },
      { id: "imp-soft-adaptation", label: "Soft Adaptation", pos: { left: 71.52, top: 50.56, width: 18.05, height: 4.76 }, text: "For example, early warning systems to prevent population displacement.", isPlaceholder: false, handbookUrl: "#", variant: "cyan-box" },
      { id: "imp-hard-adaptation", label: "Hard Adaptation", pos: { left: 71.52, top: 91.6, width: 18.05, height: 4.76 }, text: "For example, improvement of specific road link to prevent flooding.", isPlaceholder: false, handbookUrl: "#", variant: "cyan-box" }
    ],

    /* Painted in array order, so a later block covers an earlier one — that
       is how the L-shapes and the adaptation ring are assembled. The two
       halves of an L overlap by roughly a unit so the join can't show. */
    containers: [
      // The slide's own dashed key outline. The swatches inside it are
      // headings (see below), not containers.
      { id: "imp-key-bg", style: "dashed", pos: { left: 2.3, top: 2.8, width: 44.2, height: 32.2 } },

      // Transport Demand: the wide block, then the spine continuing down
      // through Activity Plans assignment and Synthetic travel demand.
      { id: "imp-demand-bg", variant: "imp-demand", radius: "14px 14px 14px 0", pos: { left: 55.6, top: 1.6, width: 42.4, height: 32.9 } },
      { id: "imp-demand-spine-bg", variant: "imp-demand", radius: "0 0 14px 14px", pos: { left: 55.6, top: 33.0, width: 12.4, height: 24.5 } },

      { id: "imp-social-bg", variant: "imp-social", pos: { left: 23.74, top: 35.71, width: 17.43, height: 12.33 } },
      { id: "imp-threshold-bg", variant: "imp-threshold", pos: { left: 23.81, top: 50.3, width: 17.44, height: 12.5 } },

      // Climate Scenario, Weather Variables & Hazard Models: narrow at the
      // top (the two boxes above the hazard models), widening below them.
      { id: "imp-climate-top-bg", variant: "imp-climate", radius: "14px 14px 0 0", pos: { left: 2.1, top: 45.38, width: 14.9, height: 20.6 } },
      { id: "imp-climate-bg", variant: "imp-climate", radius: "0 0 14px 14px", pos: { left: 2.1, top: 64.0, width: 40.7, height: 27.0 } },

      { id: "imp-supply-bg", variant: "imp-supply", pos: { left: 45.21, top: 64.15, width: 11.6, height: 26.85 } },
      { id: "imp-freight-bg", variant: "imp-freight", pos: { left: 57.82, top: 76.05, width: 9.18, height: 14.85 } },

      // The adaptation block is a ring: the band runs across the top, down
      // the right-hand side and across the bottom, with the middle left
      // white. The cut-out is painted over the tint to carve it out.
      { id: "imp-adapt-bg", variant: "imp-adapt", pos: { left: 69.96, top: 48.74, width: 26.93, height: 49.86 } },
      { id: "imp-adapt-cutout", variant: "imp-cover", pos: { left: 69.96, top: 58.8, width: 17.59, height: 27.7 } }
    ],

    headings: [
      // The KEY panel: its title, then the nine swatches of the slide's key.
      { id: "imp-key-title", label: "KEY", variant: "key-title", pos: { left: 20.0, top: 3.0, width: 8.0, height: 4.6 } },
      { id: "imp-key-tool", label: "Tool", variant: "key-tool", pos: { left: 3.19, top: 9.66, width: 13.07, height: 5.19 } },
      { id: "imp-key-io", label: "Input / Output", variant: "key-io", pos: { left: 3.19, top: 15.55, width: 13.07, height: 4.9 } },
      // Added 23 Sept: the source slide's own KEY never documented this
      // colour, even though the Passenger Transport Model box is the most
      // visually prominent one on the diagram. Column 1 has empty room
      // below "Input / Output", so it fits without resizing the panel.
      { id: "imp-key-passenger", label: "Passenger Transport Model", variant: "key-passenger", pos: { left: 3.19, top: 21.99, width: 13.07, height: 5.19 } },
      { id: "imp-key-social", label: "Social Behavioural Impacts", variant: "key-social", pos: { left: 17.67, top: 9.52, width: 13.46, height: 5.19 } },
      { id: "imp-key-threshold", label: "Transport-specific Threshold", variant: "key-threshold", pos: { left: 17.67, top: 15.83, width: 13.38, height: 5.04 } },
      { id: "imp-key-climate", label: "Climate Scenario, Weather Variables & Hazard Models", variant: "key-climate", pos: { left: 17.67, top: 21.99, width: 13.38, height: 8.54 } },
      { id: "imp-key-demand", label: "Transport Demand", variant: "key-demand", pos: { left: 32.06, top: 9.8, width: 13.39, height: 5.19 } },
      { id: "imp-key-supply", label: "Transport Supply", variant: "key-supply", pos: { left: 32.22, top: 15.69, width: 13.38, height: 5.18 } },
      { id: "imp-key-freight", label: "Freight", variant: "key-freight", pos: { left: 32.06, top: 21.85, width: 13.47, height: 5.18 } },
      { id: "imp-key-adapt", label: "Adaptation Measures", variant: "key-adapt", pos: { left: 32.06, top: 27.59, width: 13.47, height: 5.46 } },

      // Each block's domain name, written inside the block itself — plain
      // text, no bar behind it, as on the slide.
      { id: "imp-demand-heading", label: "Transport Demand", pos: { left: 74.0, top: 30.0, width: 14.0, height: 3.6 } },
      { id: "imp-social-heading", label: "Social Behavioural Impacts", pos: { left: 23.9, top: 37.6, width: 7.1, height: 8.6 } },
      { id: "imp-threshold-heading", label: "Transport-Specific Threshold", pos: { left: 23.9, top: 52.5, width: 6.5, height: 7.4 } },
      { id: "imp-climate-heading", label: "Climate Scenario, Weather Variables & Hazard Models", pos: { left: 4.4, top: 83.4, width: 12.6, height: 7.5 } },
      { id: "imp-supply-heading", label: "Transport supply", pos: { left: 45.4, top: 81.4, width: 11.2, height: 5.6 } },
      { id: "imp-freight-heading", label: "Freight", pos: { left: 57.9, top: 85.6, width: 9.0, height: 4.4 } },
      { id: "imp-adapt-heading", label: "Adaptation Measures", pos: { left: 71.6, top: 87.8, width: 17.8, height: 3.6 } }
    ],

    arrows: [
      // Transport demand down its spine.
      { from: { x: 61.95, y: 9.52 }, to: { x: 61.95, y: 24.79 } },    // NTEM -> Projected Synthetic Population
      { from: { x: 62.02, y: 29.83 }, to: { x: 62.02, y: 39.64 } },   // Projected Synthetic Population -> Activity Plans assignment
      { from: { x: 62.02, y: 44.26 }, to: { x: 62.02, y: 50.28 } },   // Activity Plans assignment -> Synthetic travel demand
      { from: { x: 39.92, y: 41.9 }, to: { x: 57.51, y: 41.9 } },     // Weather impacts on trip decisions -> Activity Plans assignment
      { from: { x: 62.02, y: 55.32 }, to: { x: 62.02, y: 65.13 } },   // Synthetic travel demand -> Passenger Transport Model
      { from: { x: 71.52, y: 52.9 }, to: { x: 66.85, y: 52.9 } },     // Soft Adaptation -> Synthetic travel demand

      // The hazard chain and its two map outputs.
      { from: { x: 9.65, y: 58.68 }, to: { x: 9.65, y: 65.27 } },     // Atmospheric fields -> UKCP18-Local modelling
      { from: { x: 9.73, y: 72.69 }, to: { x: 9.73, y: 78.43 } },     // UKCP18-Local modelling -> Weather Event
      { from: { x: 29.65, y: 76.54 }, to: { x: 32.06, y: 76.54 } },   // Heat Model -> Temporal air and surface temperature maps
      { from: { x: 29.65, y: 84.66 }, to: { x: 32.22, y: 84.66 } },   // Hydrological Model -> Temporal flood maps

      // Supply and freight into the passenger model.
      { from: { x: 51.13, y: 74.65 }, to: { x: 51.13, y: 71.85 } },   // Multi-modal Network -> Transport Network
      { from: { x: 55.18, y: 69.33 }, to: { x: 58.52, y: 69.33 } },   // Transport Network -> Passenger Transport Model
      { from: { x: 61.73, y: 76.05 }, to: { x: 61.73, y: 73.53 } },   // Freight Transport Model -> Passenger Transport Model

      // Appraisal, then the adaptation outputs.
      { from: { x: 65.68, y: 69.4 }, to: { x: 70.58, y: 69.4 } },     // Passenger Transport Model -> Impact Assessment/Performance Metrics
      { from: { x: 83.19, y: 69.4 }, to: { x: 88.79, y: 69.4 } },     // Impact Assessment/Performance Metrics -> Adaptation Measures

      // The adaptation loop's riser into the Transport supply block. The
      // loop itself is an elbowPath; its other riser lands on the hazard
      // block's lower edge.
      { from: { x: 50.9, y: 93.98 }, to: { x: 50.9, y: 91.0 } }       // Hard Adaptation loop -> Transport supply
    ],

    elbowPaths: [
      // Transport Demand's own loop out to the Building Development Model
      // and back into Projected Synthetic Population.
      { points: [ { x: 66.93, y: 7.1 }, { x: 88.09, y: 7.1 }, { x: 88.09, y: 14.43 } ] },                        // NTEM -> Building Development Model
      { points: [ { x: 88.09, y: 19.05 }, { x: 88.09, y: 27.31 }, { x: 67.94, y: 27.31 } ] },                    // Building Development Model -> Projected Synthetic Population

      // Weather Event splits four ways: up the shared riser into Social
      // Behavioural Impacts and on to the threshold, and out to the two
      // hazard models.
      { points: [ { x: 16.26, y: 80.9 }, { x: 18.0, y: 80.9 }, { x: 18.0, y: 41.9 }, { x: 23.74, y: 41.9 } ] },  // Weather Event -> Social Behavioural Impacts
      { points: [ { x: 16.26, y: 80.9 }, { x: 18.0, y: 80.9 }, { x: 18.0, y: 56.66 }, { x: 23.81, y: 56.66 } ] },// Weather Event -> Transport-Specific Threshold
      { points: [ { x: 16.26, y: 80.9 }, { x: 18.68, y: 80.9 }, { x: 18.68, y: 76.54 }, { x: 21.25, y: 76.54 } ] },  // Weather Event -> Heat Model
      { points: [ { x: 16.26, y: 80.9 }, { x: 18.68, y: 80.9 }, { x: 18.68, y: 84.66 }, { x: 21.25, y: 84.66 } ] },  // Weather Event -> Hydrological Model

      // The threshold and both map outputs share one vertical bus down into
      // Transport Network — so only the run that arrives carries a head
      // (head: false on the legs that merely join it), otherwise the bus
      // would sprout three separate arrowheads.
      { points: [ { x: 39.3, y: 56.66 }, { x: 43.97, y: 56.66 }, { x: 43.97, y: 69.33 }, { x: 47.08, y: 69.33 } ] },  // Transport-Specific Threshold -> Transport Network
      { points: [ { x: 43.97, y: 56.66 }, { x: 43.97, y: 84.45 } ], head: false },                              // the bus
      { points: [ { x: 41.01, y: 73.74 }, { x: 43.97, y: 73.74 } ], head: false },                               // Temporal air and surface temperature maps -> bus
      { points: [ { x: 41.01, y: 84.45 }, { x: 43.97, y: 84.45 } ], head: false },                               // Temporal flood maps -> bus

      // Adaptation Measures feeds both options; Hard Adaptation's learning
      // then loops back onto the hazard models it was built from and onto
      // the transport supply network.
      { points: [ { x: 92.3, y: 66.39 }, { x: 92.3, y: 52.94 }, { x: 89.57, y: 52.94 } ] },                     // Adaptation Measures -> Soft Adaptation
      { points: [ { x: 92.3, y: 72.55 }, { x: 92.3, y: 93.98 }, { x: 89.57, y: 93.98 } ] },                     // Adaptation Measures -> Hard Adaptation
      { points: [ { x: 71.52, y: 93.98 }, { x: 24.4, y: 93.98 }, { x: 24.4, y: 91.0 } ] }                       // Hard Adaptation -> Climate Scenario, Weather Variables & Hazard Models
    ],

    /* The hazard chain first — it is the diagram's most upstream input, and
       it is what the adaptation loop closes back onto. Then transport demand
       down its spine, supply and freight into the passenger model, appraisal,
       and the two adaptation options. The closing leg is Hard Adaptation's
       loop back into the hazard models, so the walk ends on a lit loop rather
       than stopping halfway. Where two consecutive steps have no connector
       between them (the parallel inputs), the step is highlighted in turn
       rather than a connection being invented. */
    tour: [
      "imp-atmospheric-fields",
      "imp-ukcp18-modelling",
      "imp-weather-event",
      "imp-heat-model",
      "imp-temporal-temp-maps",
      "imp-hydrological-model",
      "imp-temporal-flood-maps",
      "imp-ntem",
      "imp-building-dev-model",
      "imp-projected-population",
      "imp-weather-trip-decisions",
      "imp-activity-plans",
      "imp-synthetic-travel-demand",
      "imp-transport-specific-threshold",
      "imp-transport-network",
      "imp-multimodal-network",
      "imp-freight-transport-model",
      "imp-passenger-transport-model",
      "imp-impact-assessment",
      "imp-adaptation-measures",
      "imp-soft-adaptation",
      "imp-hard-adaptation",
      "imp-hydrological-model"
    ]
  },

  /* Level 3 — the one exemplar module for the September milestone.
     Built from DARe's North East flood case study (Ford & Schooling, LCRIG
     Innovation and Learning Festival, June 2026 — slides "Flood simulation
     process" to "Impact quantification"): a rainfall event drives a flood
     simulation, the flood maps drive a transport model, and the resulting
     disruption is analysed with and without travellers adapting.
     Every popup is worded from that deck; nothing is added. The step ORDER
     follows the deck's slide order and is awaiting DARe's confirmation, and
     "Impact quantification" has no explanation in the deck, so it stays a
     placeholder. This replaces an earlier Asset/Network Evaluation shell that
     was waiting on DARe's Miro board. */
  level3: {
    title: "From Rainfall to Transport Disruption",
    subtitle: "Level 3 — Example module (Integrated Modelling Platform) · North East flood case study · Draft for DARe to confirm",
    status: "Built from DARe's North East flood case study (Ford & Schooling, LCRIG Innovation and Learning Festival, June 2026). The step order follows that presentation and is awaiting DARe's confirmation.",
    legend: [
      ["climate", "Hazard model (flood simulation)"],
      ["tool", "Transport model"],
      ["io", "Input or output"]
    ],
    boxes: [
      { id: "l3-rainfall", label: "Rainfall events", pos: { left: 4, top: 45, width: 15, height: 8 }, text: "Rainfall events generated from UKCP18-Local (UK Climate Projections), used to drive the flood simulation. Two rainfall cases were tested: Case 1 has a broader spatial extent, and Case 2 a more spatially concentrated rainfall structure. Each case was run for a current and a future scenario.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-dtm", label: "DTM", pos: { left: 4, top: 15, width: 15, height: 8 }, text: "Digital terrain model (DTM): terrain data used as an input to the CityCAT flood simulation.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-green-spaces", label: "Green Spaces", pos: { left: 4, top: 25, width: 15, height: 8 }, text: "Green space data used as an input to the CityCAT flood simulation.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-buildings", label: "Buildings", pos: { left: 4, top: 35, width: 15, height: 8 }, text: "Building data used as an input to the CityCAT flood simulation.", isPlaceholder: false, handbookUrl: "#" },

      { id: "l3-citycat", label: "CityCAT", pos: { left: 28, top: 30, width: 14, height: 8 }, text: "The flood simulation model (one of the hazard models in the framework). It takes the rainfall, terrain, green space and building inputs and simulates surface water flooding.", isPlaceholder: false, handbookUrl: "#", variant: "model-green" },
      { id: "l3-settings", label: "Simulation settings", pos: { left: 28, top: 44, width: 14, height: 8 }, text: "Each flood run is set up with three choices: the duration of the rainfall event, the duration of the flood simulation, and the output frequency.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-flood-maps", label: "Flood Maps", pos: { left: 48, top: 30, width: 14, height: 8 }, text: "The spatio-temporal evolution of surface water flooding, generated from UKCP18-Local rainfall. Case 1 leads to relatively more widespread but relatively shallow inundation, whereas Case 2 is characterised by deeper water depth, resulting in more severe but localised flooding.", isPlaceholder: false, handbookUrl: "#" },

      { id: "l3-matsim", label: "MATSim", pos: { left: 74, top: 29, width: 20, height: 10 }, text: "A multimodal agent-based transport model. In the North East case study it simulates around 200,000 travellers (\"agents\") moving across the network while the flood develops.", isPlaceholder: false, handbookUrl: "#", variant: "tool" },

      { id: "l3-disruption", label: "Road network disruption", pos: { left: 5, top: 74, width: 18, height: 10 }, text: "The time evolution of road network disruption under the two rainfall cases, including the number, percentage and total length of roads affected (>0.01 m) and flooded (>0.3 m). Rainfall Case 2 leads to higher numbers and proportions of roads flooded (>300 mm), indicating more severe and localised disruption. Rainfall Case 1, with a broader spatial extent, affects a larger proportion of the road network at shallow flood depths (>1 mm), suggesting more widespread but generally less severe impacts.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-iteration-0", label: "Iteration 0: no adaptation", pos: { left: 32, top: 70, width: 20, height: 8 }, text: "The agents face the rainfall event without the possibility of adapting their behaviour (e.g., change route, avoid travelling) to the flooding event.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-learning", label: "Learning: agents adapt", pos: { left: 32, top: 80, width: 20, height: 8 }, text: "Random agents (20% in each iteration) try different alternatives (e.g., routes, starting times) over a set number of iterations (e.g., 500, 1000) and use previous knowledge to avoid flooded or congested areas.", isPlaceholder: false, handbookUrl: "#" },
      { id: "l3-impact-quantification", label: "Impact quantification", pos: { left: 62, top: 74, width: 18, height: 10 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" }
    ],

    containers: [
      { id: "l3-climate-bg", variant: "imp-climate", pos: { left: 2, top: 12, width: 64, height: 45 } },
      { id: "l3-impact-bg", variant: "imp-social", pos: { left: 2, top: 66, width: 80, height: 28 } },
      { id: "l3-behaviour-subgroup", style: "dashed", pos: { left: 30, top: 68, width: 24, height: 22 } }
    ],

    headings: [
      { id: "l3-climate-heading", label: "Climate Scenario, Weather Variables & Hazard Models", pos: { left: 2, top: 8, width: 64, height: 4 } },
      { id: "l3-impact-heading", label: "Transport Impact Analysis (IMP applied)", pos: { left: 2, top: 62, width: 80, height: 4 } }
    ],

    arrows: [
      { from: { x: 35, y: 44 }, to: { x: 35, y: 38 } },       // Simulation settings -> CityCAT
      { from: { x: 42, y: 34 }, to: { x: 48, y: 34 } },       // CityCAT -> Flood Maps
      { from: { x: 62, y: 34 }, to: { x: 74, y: 34 } }        // Flood Maps -> MATSim
    ],

    elbowPaths: [
      // The four inputs join one line into CityCAT. Each is drawn as its own
      // path all the way to CityCAT's edge (their shared last stretch overlaps
      // exactly, so it reads as one line with one arrowhead) — that way the
      // lesson can tell which input a line belongs to and light it when that
      // input is reached.
      { points: [ { x: 19, y: 19 }, { x: 23.5, y: 19 }, { x: 23.5, y: 34 }, { x: 28, y: 34 } ] },   // DTM
      { points: [ { x: 19, y: 29 }, { x: 23.5, y: 29 }, { x: 23.5, y: 34 }, { x: 28, y: 34 } ] },   // Green Spaces
      { points: [ { x: 19, y: 39 }, { x: 23.5, y: 39 }, { x: 23.5, y: 34 }, { x: 28, y: 34 } ] },   // Buildings
      { points: [ { x: 19, y: 49 }, { x: 23.5, y: 49 }, { x: 23.5, y: 34 }, { x: 28, y: 34 } ] },   // Rainfall events
      // MATSim into the impact-analysis group, along the gap between the rows.
      { points: [ { x: 84, y: 39 }, { x: 84, y: 59.5 }, { x: 14, y: 59.5 }, { x: 14, y: 62 } ] },
      // Disruption -> the two behaviour runs -> impact quantification.
      { points: [ { x: 23, y: 79 }, { x: 27, y: 79 }, { x: 27, y: 74 }, { x: 32, y: 74 } ] },
      { points: [ { x: 23, y: 79 }, { x: 27, y: 79 }, { x: 27, y: 84 }, { x: 32, y: 84 } ] },
      { points: [ { x: 52, y: 74 }, { x: 57, y: 74 }, { x: 57, y: 79 }, { x: 62, y: 79 } ] },
      { points: [ { x: 52, y: 84 }, { x: 57, y: 84 }, { x: 57, y: 79 }, { x: 62, y: 79 } ] }
    ],

    /* The lesson: this view is read one step at a time. A card beside the
       diagram (below it on a phone) explains the step's box in plain words and
       shows a picture of it, while the diagram lights the box and the line
       that leads to it. Steps run in the order below; each names its box and
       which stage it belongs to. Pictures are DARe's own figures from the case
       study deck, or small drawings where the deck has none (files in
       assets/img/level3/). Wording of the plain explanations for DTM, Green
       Spaces, Buildings, Simulation settings and CityCAT goes a little beyond
       the deck (it only names them) and is for DARe to confirm. */
    lesson: {
      // Level 3 has no popups: a box click opens the tour at that box. (Every
      // other diagram keeps its popups; there a click still opens the popup.)
      clickStartsTour: true,
      stages: {
        climate: "Climate & flood modelling",
        transport: "Transport model",
        impact: "Impact analysis"
      },
      intro: {
        title: "Follow a flood through the transport system",
        text: "This example follows one rainfall event in the North East, from raw data to what it means for the people travelling. Each step lights up a box in the diagram and explains it. Use Next to move on, click any box to jump to it, or skip the tour at any time."
      },
      steps: [
        {
          box: "l3-rainfall",
          stage: "climate",
          text: "Everything starts with the weather. The rainfall is generated from UKCP18-Local, the UK Climate Projections.",
          example: "Two rainfall cases are tested. Case 1 spreads over a wide area; Case 2 is more concentrated. Each is run for today's climate and for a future one.",
          figure: { images: [ { src: "assets/img/level3/rainfall.jpg", alt: "A map of a rainfall event over the North East, coloured by how heavy the rain is" } ], caption: "A rainfall event over the North East (precipitation in mm per hour)." }
        },
        {
          box: "l3-dtm",
          stage: "climate",
          text: "The digital terrain model (DTM) is a map of the height of the ground. It is the first of the other three inputs the flood model needs.",
          figure: { images: [ { src: "assets/img/level3/dtm.svg", alt: "A cross-section of hilly ground with a marker reading its height" } ] }
        },
        {
          box: "l3-green-spaces",
          stage: "climate",
          text: "A map of the parks, gardens and other green areas. It is the second input to the flood model.",
          figure: { images: [ { src: "assets/img/level3/green-spaces.svg", alt: "A map in which parks and other green areas are highlighted" } ] }
        },
        {
          box: "l3-buildings",
          stage: "climate",
          text: "A map of where the buildings stand. It is the third input to the flood model.",
          figure: { images: [ { src: "assets/img/level3/buildings.svg", alt: "A street grid with building footprints marked" } ] }
        },
        {
          box: "l3-settings",
          stage: "climate",
          text: "Before each flood run, three choices are made: how long the rain lasts, how long the flood is simulated for, and how often results are saved (the output frequency).",
          figure: { images: [ { src: "assets/img/level3/settings.svg", alt: "Three settings being adjusted before a flood run" } ] }
        },
        {
          box: "l3-citycat",
          stage: "climate",
          text: "CityCAT is the flood model — one of the “hazard models” in the framework. It takes the rainfall, terrain, green spaces and buildings and works out where surface water flooding happens.",
          figure: { images: [ { src: "assets/img/level3/citycat.svg", alt: "Rain falling on a district, with flood water gathering in the low ground" } ] }
        },
        {
          box: "l3-flood-maps",
          stage: "climate",
          text: "The result is a set of flood maps that show how the flooding grows and drains over time.",
          example: "Case 1 gives flooding that is more widespread but relatively shallow. Case 2 gives deeper water, so it is more severe but more localised.",
          figure: { images: [ { src: "assets/img/level3/flood-maps.jpg", alt: "Flood maps of the Tyne area at 1, 3, 6, 12 and 16 hours after the start of rain, for Case 1 (top) and Case 2 (bottom)" } ], caption: "Water depth at 1, 3, 6, 12 and 16 hours after the rain starts. Case 1 above, Case 2 below (current climate). Click to enlarge." }
        },
        {
          box: "l3-matsim",
          stage: "transport",
          text: "MATSim is an agent-based transport model. Rather than working with averages, it simulates individual travellers, called agents, each making their own trips across the network while the flood develops.",
          example: "In the North East case study there are around 200,000 agents.",
          figure: { images: [ { src: "assets/img/level3/matsim.jpg", alt: "The road network of the North East drawn as a dark map, with red dots for slow traffic" } ], caption: "The MATSim road network at the start of the run (iteration 0)." }
        },
        {
          box: "l3-disruption",
          stage: "impact",
          text: "The flood maps are laid over the road network to see which roads are hit. Roads are counted as “affected” (more than 1 cm of water) or “flooded” (more than 30 cm).",
          example: "Case 2 floods more roads deeply, so its disruption is more severe but localised. Case 1 touches more of the network, but only shallowly.",
          figure: { images: [ { src: "assets/img/level3/disruption.jpg", alt: "Two line charts showing, over time, the number of roads affected and the number of roads flooded in each rainfall case" } ], caption: "Number of roads affected (left) and flooded (right) over time, for both rainfall cases. Click to enlarge." }
        },
        {
          box: "l3-iteration-0",
          stage: "impact",
          text: "The first run is the “before” picture. The travellers meet the rain and the flood with no chance to change what they do: they cannot change route or avoid travelling.",
          figure: { images: [ { src: "assets/img/level3/iteration-0.jpg", alt: "The MATSim network in the first run, before travellers have adapted", label: "Iteration 0" } ] }
        },
        {
          box: "l3-learning",
          stage: "impact",
          text: "Then the travellers learn. In every round, a random 20% of them try something different, such as another route or another start time, and use what they have learned to steer clear of flooded or congested areas. This is repeated for a set number of rounds, for example 500 or 1,000.",
          figure: { images: [ { src: "assets/img/level3/iteration-0.jpg", alt: "The first run, with no adaptation", label: "Iteration 0" }, { src: "assets/img/level3/learning.jpg", alt: "The same network after the travellers have learned", label: "Learning" } ], caption: "The same event, before and after the travellers learn." }
        },
        {
          box: "l3-impact-quantification",
          stage: "impact",
          text: "The last step puts numbers on the impact of the flooding on travel.",
          credit: "Impact quantification is work by Dr Wei Bi."
        }
      ],
      outro: {
        title: "That is the whole journey",
        text: "One rainfall event became a flood, the flood became disrupted roads, and the disruption became a difference in how people travel, with and without adapting. DARe is using case studies like this one to show the IMP's value, particularly for stress-testing adaptation and resilience measures under different climate and hazard scenarios.",
        links: [ { label: "Back to the Level 2 IMP diagram", view: "imp" } ]
      }
    }
  }

};

/* DSP-only / IMP-only explanatory text, for the toggle on the Extended
   diagram — content taken directly from slide 10 ("Text for DSP / IMP
   only view") of the source PPTX. */
const TPRAF_DSP_IMP = {
  dsp: {
    title: "Decision Support Process (DSP)",
    text: "A process-oriented approach to help users understand the broader implications of infrastructure choices, including carbon impact, sustainability, and resilience.\n\nThe DSP enables a unified approach to transport infrastructure decision-making by integrating decarbonisation, climate resilience, and adaptation considerations. It helps users understand the broader implications of infrastructure choices, including carbon impact, sustainability, and resilience. For example, asset managers can assess the environmental impact of maintenance decisions, senior managers can explore how budget allocations affect network resilience, and strategists can identify appropriate investments to address adaptation or capacity needs within financial and environmental constraints.\n\nThe DSP includes modular components focused on asset condition, risk profiling, whole-life sustainability, climate resilience, system interdependencies, and spatio-temporal scales. Case studies are being used to test and refine the DSP based on real-world decision-making processes."
  },
  imp: {
    title: "Integrated Modelling Platform (IMP)",
    text: "An approach for modelling to simulate climate-related disruptions to transport infrastructure and users, and to explore adaptation options to increase resilience.\n\nThe IMP combines models and datasets to simulate climate-related disruptions to transport infrastructure and users, and explore adaptation options to increase resilience. It provides a dynamic understanding of how climate hazards — such as floods, heatwaves, and windstorms — and the effects of infrastructure deterioration might disrupt transport systems, helping to measure impacts and inform adaptation strategies.\n\nBuilt on open-source models and datasets, the IMP is transferable across UK regions. It integrates high-resolution climate projections (UKCP18), hazard modelling (e.g. flooding), agent-based transport simulations, land-use and urban development models, and impact assessment approaches.\n\nIt supports risk quantification and adaptation planning, enabling interventions and investments to be prioritised. Case studies are being used to demonstrate the IMP's value — particularly for stress-testing adaptation and resilience measures under varying climate and hazard scenarios."
  }
};
