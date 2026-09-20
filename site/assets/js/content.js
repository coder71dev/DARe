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
    // Where this view leads next. Slide 2 treats the simple form as the
    // landing step and the extended form as the start of the interactive
    // diagram, so the simple view offers a way through to it. Becomes a
    // column pair on tpraf_views at migration (see MIGRATION-NOTES.md).
    next: { key: "extended", label: "Explore the extended form" },
    boxes: [
      {
        id: "transport-scenarios",
        label: "Transport Scenarios",
        startHere: true,
        pos: { left: 4.42, top: 29.65, width: 15.79, height: 8.77 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "impact-assessment",
        label: "Impact Assessment",
        pos: { left: 4.42, top: 45.62, width: 15.79, height: 8.77 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "hazard-model",
        label: "Hazard Model",
        pos: { left: 4.42, top: 59.96, width: 15.79, height: 8.77 },
        text: "Tools to estimate the impact of a climate-related phenomenon on the transport system, such as CADDIES, CityCAT, and VITO UrbClim + HiREx.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "climate-scenarios",
        label: "Climate Scenarios",
        pos: { left: 4.42, top: 73.13, width: 15.79, height: 8.77 },
        text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy"
      },
      {
        id: "bau",
        label: "Business as usual/Do nothing evaluation",
        pos: { left: 23.80, top: 44.76, width: 14.24, height: 10.67 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        handbookUrl: "#",
        variant: "sky"
      },
      {
        id: "risk-reduction-needs",
        label: "Risk Reduction Needs",
        pos: { left: 41.63, top: 45.62, width: 14.24, height: 8.77 },
        text: "This process applies a screening criteria to filter the long-list to a short-list of potential options for detailed pathway development informed by the risk and resilience assessment. As well as identifying / inputting thresholds / tipping points.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky"
      },
      {
        id: "adaptation-interventions",
        label: "Adaptation/\nInterventions",
        pos: { left: 60.71, top: 45.62, width: 14.24, height: 8.77 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        handbookUrl: "#",
        variant: "leaf",
        highlight: true
      },
      {
        id: "outcome-assessment",
        label: "Outcome Assessment",
        pos: { left: 79.78, top: 45.62, width: 14.24, height: 8.77 },
        text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "sky"
      }
    ],

    labels: [
      {
        id: "risk-mitigation",
        label: "Risk Mitigation",
        pos: { left: 57.19, top: 39.47, width: 11.02, height: 4.49 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        type: "tag"
      },
      {
        id: "feedback-loop-top",
        label: "Feedback loop",
        pos: { left: 36.9, top: 21.5, width: 14.24, height: 4.49 },
        text: "Adaptation/Interventions decisions loop back to reshape the transport scenarios considered.",
        isPlaceholder: true,
        type: "feedback"
      },
      {
        id: "feedback-loop-bottom",
        label: "Feedback loop",
        pos: { left: 36.9, top: 55.5, width: 14.24, height: 4.49 },
        text: "Adaptation/Interventions decisions loop back to refine the hazard model.",
        isPlaceholder: true,
        type: "feedback"
      }
    ],

    /* Straight arrows: exact coordinates from the source slide's connectors.
       Transport Scenarios feeds DOWN into Impact Assessment, while Hazard
       Model and Climate Scenarios feed UP into it — both converge on
       Impact Assessment (confirmed via the PPTX's shape-attachment data,
       and matches the client's reference screenshot). */
      arrows: [
      { from: { x: 12.31, y: 30.46 }, to: { x: 12.31, y: 45.62 } },   // Transport Scenarios -> Impact Assessment (down)
      { from: { x: 12.31, y: 59.96 }, to: { x: 12.31, y: 54.38 } },   // Hazard Model -> Impact Assessment (up)
      { from: { x: 12.31, y: 73.13 }, to: { x: 12.31, y: 68.73 } },   // Climate Scenarios -> Hazard Model (up)
      { from: { x: 20.21, y: 50.00 }, to: { x: 23.80, y: 50.00 } },
      { from: { x: 38.04, y: 50.00 }, to: { x: 41.63, y: 50.00 } },
      { from: { x: 55.87, y: 50.00 }, to: { x: 60.71, y: 50.00 } },
      { from: { x: 74.95, y: 50.00 }, to: { x: 79.78, y: 50.00 } }
    ],

    /* Feedback loops — confirmed via the PPTX's own <a:stCxn>/<a:endCxn>
       shape-attachment data (not a position guess): both loops attach to
       Adaptation/Interventions. Exact bend points are a clean approximation
       (PowerPoint's stored elbow bounding box wasn't reliable to reproduce
       pixel-exactly), but which boxes connect is exact. */
    feedbackPaths: [
      /* Adaptation/Interventions (top) -> Transport Scenarios (right side, vertical middle).
         The last leg is horizontal (24 -> 20.21 at the box's own mid-height) so the arrow
         approaches straight into the wall instead of dropping in from above. */
      { points: [ { x: 67.83, y: 45.62 }, { x: 67.83, y: 27 }, { x: 24, y: 27 }, { x: 24, y: 34.04 }, { x: 20.21, y: 34.04 } ] },
      /* Adaptation/Interventions (bottom) -> Hazard Model (right side, vertical middle) */
      { points: [ { x: 67.83, y: 54.39 }, { x: 67.83, y: 61 }, { x: 24, y: 61 }, { x: 24, y: 64.35 }, { x: 20.21, y: 64.35 } ] }
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
    boxes: [
      {
        id: "transport-demand",
        label: "Transport Demand",
        startHere: true,
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
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
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
        pos: { left: 50.96, top: 46.43, width: 11.02, height: 3.81 }
      }
    ],

    labels: [
      {
        id: "feedback-loop-top",
        label: "Feedback loop",
        pos: { left: 36.67, top: 25.0, width: 14.24, height: 3.81 },
        text: "Adaptation/Interventions decisions loop back to reshape the transport scenarios considered.",
        isPlaceholder: true,
        type: "feedback"
      },
      {
        id: "feedback-loop-bottom",
        label: "Feedback loop",
        pos: { left: 36.67, top: 75.88, width: 14.24, height: 3.81 },
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
      { from: { x: 15.27, y: 44.42 }, to: { x: 14.95, y: 51.06 }, group: "imp" },   // Transport System -> Impact Assessment
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
      // Final leg is vertical (approaching from below) to enter Hazard Model's
      // bottom edge cleanly — a horizontal final leg into a horizontal wall
      // was why this arrowhead looked misaligned.
      { points: [ { x: 10.4, y: 83.84 }, { x: 10.4, y: 80 }, { x: 14.96, y: 80 }, { x: 14.96, y: 78.92 } ], group: "imp" },  // Weather Variables -> Hazard Model
      // Enters Transport Demand's left wall at vertical mid-height, not its
      // bottom — final leg is horizontal so the arrowhead points right, into
      // the wall, instead of up into the underside of the box.
      { points: [ { x: 4.76, y: 52.73 }, { x: 4.76, y: 28.92 }, { x: 5.92, y: 28.92 } ], group: "imp" },           // Social Behaviour Impacts (visual top) -> Transport Demand (left wall)
      // Both converge toward Transport System's narrower top edge (it's not
      // as wide as Transport Demand + Transport Supply together), matching
      // the source PPTX rather than two parallel straight lines — the old
      // straight-line version put Transport Supply's arrow just outside
      // Transport System's right edge, missing the box.
      { points: [ { x: 10.5, y: 32.36 }, { x: 10.5, y: 35 }, { x: 12, y: 35 }, { x: 12, y: 37.61 } ], group: "imp" },   // Transport Demand -> Transport System
      { points: [ { x: 20.32, y: 32.36 }, { x: 20.32, y: 35 }, { x: 18.5, y: 35 }, { x: 18.5, y: 37.61 } ], group: "imp" }  // Transport Supply -> Transport System
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
      { points: [ { x: 59.34, y: 51.9 }, { x: 59.34, y: 25 }, { x: 28, y: 25 }, { x: 28, y: 28.92 }, { x: 24.9, y: 28.92 } ], group: "imp" },  // -> Transport Supply (right wall)
      { points: [ { x: 59.34, y: 58.83 }, { x: 59.34, y: 76 }, { x: 22, y: 76 }, { x: 22, y: 75.51 }, { x: 20.14, y: 75.51 } ], group: "imp" }  // -> Hazard Model (right wall)
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
    title: "Overview of DSP Components",
    subtitle: "Level 2 — Decision Support Process",
    status: "Redesigned from the source component map in brand colors — each process stage keeps its own colour identity (title bar, body tint, and the standalone inputs that feed it), matching the source. Wording for most steps is still coming from DARe.",
    legend: [
      ["navy", "Tool or model step"],
      ["io", "Input or output artefact"]
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
      { id: "dsp-transport-scenarios", label: "Transport Scenarios", startHere: true, pos: { left: 2.7, top: 12, width: 14, height: 6 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "sky-pale" },
      { id: "dsp-climate-scenarios", label: "Climate Scenarios", pos: { left: 2.7, top: 21, width: 14, height: 6 }, text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).", isPlaceholder: false, handbookUrl: "#", variant: "sky-pale" },
      { id: "dsp-requirements", label: "Requirements", pos: { left: 25.7, top: 7, width: 14, height: 5 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "c2-input" },
      { id: "dsp-context", label: "Context", pos: { left: 25.7, top: 14.5, width: 14, height: 5 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "c2-input" },
      { id: "dsp-constraints", label: "Constraints", pos: { left: 25.7, top: 22, width: 14, height: 5 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "c2-input" },

      // Cluster 1 — Asset/Network Evaluation, doubled in width to match the
      // source's much wider leftmost stage. Middle three still sit in the
      // dashed sub-group; the Asset Performance connectors are one-way
      // (up into Risk Assessment, down into Resilience Assessment).
      { id: "dsp-sustainability", label: "Sustainability", pos: { left: 3.9, top: 34, width: 14, height: 5.8 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-risk-assessment", label: "Risk Assessment", pos: { left: 3.9, top: 43.8, width: 14, height: 5.8 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-performance", label: "Asset Performance", pos: { left: 3.9, top: 53.6, width: 14, height: 5.8 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-resilience-assessment", label: "Resilience Assessment", pos: { left: 3.9, top: 63.4, width: 14, height: 5.8 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-asset-registry", label: "Asset Registry", pos: { left: 3.9, top: 73.2, width: 14, height: 5.8 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },

      // Cluster 2 — Problem Framing and Scope, doubled to match the source's
      // wider second stage (same treatment as Asset/Network Evaluation).
      { id: "dsp-system-interdependencies", label: "System Interdependencies", pos: { left: 25.7, top: 34, width: 14, height: 8.25 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-problem-definition", label: "Problem Definition", pos: { left: 25.7, top: 46.25, width: 14, height: 8.25 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-primary-impact-identification", label: "Primary Impact Identification", pos: { left: 25.7, top: 58.5, width: 14, height: 8.25 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-option-ideation", label: "Option Ideation (Long List)", pos: { left: 25.7, top: 70.75, width: 14, height: 8.25 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", stacked: true },

      // Cluster 3 — Risk Reduction Analysis. Risk Thresholds on top (full
      // width); below it, well-spaced: Option Matrix (rotated vertical
      // label), the Selection/Screened list decision diamond, and the
      // Interventions "long list" — each with a real 2.5-unit gap between
      // them so the connecting arrows are legible, not overlapping the
      // boxes. Resilience Assessment sits underneath as its own row.
      { id: "dsp-risk-thresholds", label: "Risk Thresholds", pos: { left: 46.1, top: 34, width: 20, height: 7 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-option-matrix", label: "Option Matrix", pos: { left: 46.1, top: 46, width: 3.5, height: 14 }, vertical: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-selection-screened-list", label: "Selection/\nScreened list", pos: { left: 51.4, top: 48, width: 9.5, height: 9.5 }, shape: "diamond", text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-interventions", label: "Interventions", pos: { left: 62.6, top: 46, width: 3.5, height: 14 }, vertical: true, stacked: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-resilience-assessment-2", label: "Resilience Assessment", pos: { left: 46.1, top: 65, width: 20, height: 7 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },

      // Cluster 4 — Detailed Option Assessment. "Multi Criteria / Cost
      // Benefit Analysis" runs as a rotated vertical label down the full
      // cluster height, with a real 2.5-unit gap before the 5-box stack
      // (same 4-unit vertical rhythm as clusters 1/2) to its right.
      // The criteria boxes emanate from the "Multi Criteria / Cost Benefit
      // Analysis" strip: their left edge lines up with the strip's right edge
      // and its left corners are squared (attachLeft), so they read as one
      // connected unit inside the group box.
      { id: "dsp-multi-criteria-cost-benefit", label: "Multi Criteria / Cost Benefit Analysis", pos: { left: 71.6, top: 34, width: 4, height: 45 }, vertical: true, square: true, text: "This process involves a criteria selection process and a detailed development and assessment of shortlisted options / pathways.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-performance-2", label: "Asset Performance", pos: { left: 75.6, top: 34, width: 14.5, height: 5.8 }, attachLeft: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-resilience-assessment-3", label: "Resilience Assessment", pos: { left: 75.6, top: 43.8, width: 14.5, height: 5.8 }, attachLeft: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-sustainability-2", label: "Sustainability", pos: { left: 75.6, top: 53.6, width: 14.5, height: 5.8 }, attachLeft: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-economic-impact", label: "Economic Impact", pos: { left: 75.6, top: 63.4, width: 14.5, height: 5.8 }, attachLeft: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-criteria-xyz", label: "Criteria X, Y, Z", pos: { left: 75.6, top: 73.2, width: 14.5, height: 5.8 }, attachLeft: true, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },

      // Cluster 5 — Portfolio Optimisation, widened to match Detailed Option
      // Assessment (same treatment as the other groups); its three steps sit
      // inside a dashed sub-group, matching the source.
      { id: "dsp-system-interdependencies-2", label: "System Interdependencies", pos: { left: 97.8, top: 34, width: 16.6, height: 12.33 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-solution-bundling", label: "Solution Bundling", pos: { left: 97.8, top: 50.33, width: 16.6, height: 12.33 }, text: "This process looks at combining and sequencing multiple interventions/pathways to utilise and bundle resources if possible.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-resource-feasibility", label: "Resource and Feasibility", pos: { left: 97.8, top: 66.67, width: 16.6, height: 12.33 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },

      // Cluster 6 — Outcome Assessment. Plain tool box, no special
      // highlight — the source doesn't single this step out visually.
      { id: "dsp-asset-performance-3", label: "Asset Performance", pos: { left: 121.8, top: 34, width: 18.6, height: 12.33 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-intervention-effectiveness", label: "Intervention / Adaptation Effectiveness", pos: { left: 121.8, top: 50.33, width: 18.6, height: 12.33 }, text: "This process evaluates the effectiveness of interventions and feeds learning back into the decision cycle and future decisions.", isPlaceholder: false, handbookUrl: "#", variant: "navy" },
      { id: "dsp-asset-registry-2", label: "Asset Registry", pos: { left: 121.8, top: 66.67, width: 18.6, height: 12.33 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },

      // Cross-cutting Risk Assessment step and its funding/governance inputs.
      // Kept off the far right/bottom edge on purpose — that corner is where
      // the floating zoom widget docks (see style.css), same reason Level 1's
      // last row always ends well clear of it.
      { id: "dsp-risk-assessment-cross", label: "Risk Assessment", pos: { left: 86.6, top: 83, width: 14, height: 5 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "dsp-funding-budgets", label: "Funding / Budgets (Financial Case)", pos: { left: 70.1, top: 93, width: 13, height: 6 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-procurement", label: "Procurement (Commercial Case)", pos: { left: 87.1, top: 93, width: 13, height: 6 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" },
      { id: "dsp-pm-governance", label: "PM, Governance, Reporting (Management Case)", pos: { left: 104.1, top: 93, width: 13, height: 6 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "navy" }
    ],

    containers: [
      { id: "dsp-c1-bg", variant: "c1", pos: { left: 1.5, top: 32.5, width: 18.8, height: 48.5 } },
      { id: "dsp-c2-bg", variant: "c2", pos: { left: 23.3, top: 32.5, width: 18.8, height: 48.5 } },
      { id: "dsp-c3-bg", variant: "c3", pos: { left: 45.1, top: 32.5, width: 22, height: 48.5 } },
      { id: "dsp-c4-bg", variant: "c4", pos: { left: 70.1, top: 32.5, width: 22, height: 48.5 } },
      { id: "dsp-c5-bg", variant: "c5", pos: { left: 95.1, top: 32.5, width: 22, height: 48.5 } },
      { id: "dsp-c6-bg", variant: "c6", pos: { left: 120.1, top: 32.5, width: 22, height: 48.5 } },
      // Dashed sub-groupings, matching the source's own inner groupings.
      { id: "dsp-c1-subgroup", style: "dashed", pos: { left: 1.9, top: 42.8, width: 18, height: 27.4 } },
      { id: "dsp-c2-subgroup", style: "dashed", pos: { left: 23.7, top: 45.25, width: 18, height: 34.75 } },
      { id: "dsp-c5-subgroup", style: "dashed", pos: { left: 96.6, top: 33.5, width: 19, height: 46.5 } },
      // Outer dashed boundary around Detailed Option Assessment + Portfolio
      // Optimisation together, plus the cross-cutting Risk Assessment step,
      // matching the source's combined outline (the three funding/governance
      // cases hang off its bottom border).
      { id: "dsp-c4-c5-outer", style: "dashed", pos: { left: 68.6, top: 27, width: 49.5, height: 62 } }
    ],

    headings: [
      { id: "dsp-c1-heading", label: "Asset/Network Evaluation", pos: { left: 1.5, top: 28.5, width: 18.8, height: 4 }, variant: "c1" },
      { id: "dsp-c2-heading", label: "Problem Framing and Scope", pos: { left: 23.3, top: 28.5, width: 18.8, height: 4 }, variant: "c2" },
      { id: "dsp-c3-heading", label: "Risk Reduction Analysis", pos: { left: 45.1, top: 28.5, width: 22, height: 4 }, variant: "c3" },
      { id: "dsp-c4-heading", label: "Detailed Option Assessment", pos: { left: 70.1, top: 28.5, width: 22, height: 4 }, variant: "c4" },
      { id: "dsp-c5-heading", label: "Portfolio Optimisation", pos: { left: 95.1, top: 28.5, width: 22, height: 4 }, variant: "c5" },
      { id: "dsp-c6-heading", label: "Outcome Assessment", pos: { left: 120.1, top: 28.5, width: 22, height: 4 }, variant: "c6" }
    ],

    arrows: [
      { from: { x: 9.7, y: 18 }, to: { x: 9.7, y: 21 } },          // Transport Scenarios -> Climate Scenarios
      { from: { x: 9.7, y: 27 }, to: { x: 9.7, y: 28.5 } },        // Climate Scenarios -> Asset/Network Evaluation
      { from: { x: 32.7, y: 12 }, to: { x: 32.7, y: 14.5 } },      // Requirements -> Context
      { from: { x: 32.7, y: 19.5 }, to: { x: 32.7, y: 22 } },      // Context -> Constraints
      { from: { x: 32.7, y: 27 }, to: { x: 32.7, y: 28.5 } },      // Constraints -> Problem Framing
      // Cluster-to-cluster hops, aligned to the vertical middle of the
      // group bodies so the arrows read as one consistent flow line.
      { from: { x: 20.3, y: 56.5 }, to: { x: 23.3, y: 56.5 } },    // Asset/Network Evaluation -> Problem Framing
      { from: { x: 42.1, y: 56.5 }, to: { x: 45.1, y: 56.5 } },    // Problem Framing -> Risk Reduction Analysis
      { from: { x: 67.1, y: 56.5 }, to: { x: 70.1, y: 56.5 } },    // Risk Reduction Analysis -> Detailed Option Assessment
      { from: { x: 92.1, y: 56.5 }, to: { x: 95.1, y: 56.5 } },    // Detailed Option Assessment -> Portfolio Optimisation
      { from: { x: 117.1, y: 56.5 }, to: { x: 120.1, y: 56.5 } },  // Portfolio Optimisation -> Outcome Assessment
      // Within-cluster steps: the outer two connectors stay double-headed
      // (Sustainability<->Risk, Resilience<->Asset Registry), while Asset
      // Performance feeds one-way UP into Risk Assessment and DOWN into
      // Resilience Assessment — matching the source's single arrowheads.
      { from: { x: 10.9, y: 39.8 }, to: { x: 10.9, y: 43.8 }, bidirectional: true },   // Sustainability <-> Risk Assessment
      { from: { x: 10.9, y: 53.6 }, to: { x: 10.9, y: 49.6 } },                        // Asset Performance -> Risk Assessment (up)
      { from: { x: 10.9, y: 59.4 }, to: { x: 10.9, y: 63.4 } },                        // Asset Performance -> Resilience Assessment (down)
      { from: { x: 10.9, y: 69.2 }, to: { x: 10.9, y: 73.2 }, bidirectional: true },   // Resilience Assessment <-> Asset Registry
      { from: { x: 32.7, y: 42.25 }, to: { x: 32.7, y: 46.25 } },  // System Interdependencies -> Problem Definition
      { from: { x: 32.7, y: 54.5 }, to: { x: 32.7, y: 58.5 } },    // Problem Definition -> Primary Impact ID
      { from: { x: 32.7, y: 66.75 }, to: { x: 32.7, y: 70.75 } },  // Primary Impact ID -> Option Ideation
      // Risk Reduction Analysis: the central Selection/Screened-list diamond
      // is fed by the surrounding boxes — Risk Thresholds (above) and
      // Resilience Assessment (below) — with Option Matrix and Interventions
      // joining it horizontally (see elbowPaths below).
      { from: { x: 56.15, y: 41 }, to: { x: 56.15, y: 48 } },      // Risk Thresholds -> Selection/Screened list
      { from: { x: 56.15, y: 65 }, to: { x: 56.15, y: 57.5 } }     // Resilience Assessment -> Selection/Screened list
    ],

    elbowPaths: [
      // Cluster 3 internal flow: Option Matrix -> diamond -> Interventions,
      // each with a real gap so the arrows read clearly between the shapes
      // rather than touching them.
      { points: [ { x: 49.6, y: 53 }, { x: 51.4, y: 53 } ] },                                          // Option Matrix -> Selection/Screened list
      { points: [ { x: 60.9, y: 53 }, { x: 62.6, y: 53 } ] },                                          // Selection/Screened list -> Interventions
      // Risk Assessment connects FROM the Portfolio Optimisation group border
      // and back TO the Detailed Option Assessment group border — both at the
      // group edge, not off an individual box.
      { points: [ { x: 106.1, y: 81 }, { x: 106.1, y: 85.5 }, { x: 100.6, y: 85.5 } ] },             // Portfolio Optimisation -> Risk Assessment (cross)
      { points: [ { x: 86.6, y: 85.5 }, { x: 81.6, y: 85.5 }, { x: 81.6, y: 81 } ] },                 // Risk Assessment (cross) -> Detailed Option Assessment group
      // The three funding/governance cases hang off the dashed boundary's
      // bottom border (not the Risk Assessment box), splitting downward.
      { points: [ { x: 93.6, y: 89 }, { x: 93.6, y: 89.5 }, { x: 76.6, y: 89.5 }, { x: 76.6, y: 93 } ] }, // Boundary -> Funding/Budgets
      { points: [ { x: 93.6, y: 89 }, { x: 93.6, y: 93 } ] },                                              // Boundary -> Procurement
      { points: [ { x: 93.6, y: 89 }, { x: 93.6, y: 89.5 }, { x: 110.6, y: 89.5 }, { x: 110.6, y: 93 } ] } // Boundary -> PM/Governance
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
    status: "Redrawn to match the source component map (level_2_slide_12.png) — the slide's own colours, groupings, blocks and connector routing, including its KEY panel. Wording for most steps is still coming from DARe.",
    legend: [
      ["tool", "Tool"],
      ["io", "Input / Output"],
      ["social", "Social Behavioural Impacts"],
      ["demand", "Transport Demand"],
      ["threshold", "Transport-specific Threshold"],
      ["supply", "Transport Supply"],
      ["climate", "Climate Scenario, Weather Variables & Hazard Models"],
      ["freight", "Freight"],
      ["adapt", "Adaptation Measures"]
    ],

    boxes: [
      // Climate Scenario, Weather Variables & Hazard Models (bottom left).
      { id: "imp-atmospheric-fields", label: "Atmospheric fields, soil fields, sea surface temperature etc.", startHere: true, compact: true, pos: { left: 3.04, top: 49.16, width: 13.22, height: 9.52 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-ukcp18-modelling", label: "UKCP18-Local Modelling of the atmosphere", pos: { left: 3.27, top: 65.27, width: 12.99, height: 7.42 }, text: "Models for testing how the climate responds to different environmental conditions, such as UKCP18-Local (UK Climate Projections).", isPlaceholder: false, handbookUrl: "#", variant: "model-green" },
      { id: "imp-weather-event", label: "Weather Event", pos: { left: 3.19, top: 78.43, width: 13.07, height: 5.04 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-heat-model", label: "Heat Model", pos: { left: 21.25, top: 74.23, width: 8.4, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "model-green" },
      { id: "imp-hydrological-model", label: "Hydrological Model", pos: { left: 21.25, top: 82.35, width: 8.4, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "model-green" },
      { id: "imp-temporal-temp-maps", label: "Temporal air and surface temperature maps", pos: { left: 32.06, top: 67.37, width: 8.95, height: 12.74 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-temporal-flood-maps", label: "Temporal flood maps", pos: { left: 32.22, top: 81.93, width: 8.79, height: 5.04 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },

      // Social behavioural impacts and the travel-demand threshold.
      { id: "imp-weather-trip-decisions", label: "Weather impacts on trip decisions", pos: { left: 31.13, top: 37.96, width: 8.79, height: 7.84 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "grey-box" },
      { id: "imp-transport-specific-threshold", label: "Transport-Specific Threshold", pos: { left: 30.51, top: 53.08, width: 8.79, height: 7.14 }, text: "Analysis of the impacts of weather conditions (e.g., rain, heat) on different modes of transport (e.g., car, public transport, active modes).", isPlaceholder: false, handbookUrl: "#", variant: "threshold-magenta" },

      // Transport Demand (top right), running down the spine.
      { id: "imp-ntem", label: "National Trip End Model (NTEM)", pos: { left: 57.12, top: 4.9, width: 9.81, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "tool" },
      { id: "imp-building-dev-model", label: "Building Development Model", pos: { left: 81.09, top: 14.43, width: 14.16, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "tool" },
      { id: "imp-projected-population", label: "Projected Synthetic Population", pos: { left: 56.19, top: 24.79, width: 11.75, height: 5.04 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "tool" },
      { id: "imp-activity-plans", label: "Activity Plans assignment", pos: { left: 57.51, top: 39.64, width: 9.18, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "tool" },
      { id: "imp-synthetic-travel-demand", label: "Synthetic travel demand", pos: { left: 57.12, top: 50.28, width: 9.73, height: 5.04 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },

      // Transport supply and freight — two separate blocks in the source.
      { id: "imp-transport-network", label: "Transport Network", pos: { left: 47.08, top: 66.81, width: 8.1, height: 5.04 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-multimodal-network", label: "Multi-modal Network", pos: { left: 47.08, top: 74.65, width: 8.1, height: 4.62 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "multi-orange" },
      { id: "imp-freight-transport-model", label: "Freight Transport Model", pos: { left: 58.52, top: 78.71, width: 7.16, height: 6.86 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "freight-sand" },

      // The convergence point, then appraisal and the adaptation outputs.
      { id: "imp-passenger-transport-model", label: "Passenger Transport Model", pos: { left: 58.52, top: 65.13, width: 7.16, height: 8.4 }, text: "The central simulation step — brings together transport demand, transport supply/freight, and weather/hazard effects to model how passenger journeys are actually made and disrupted.", isPlaceholder: true, handbookUrl: "#", variant: "passenger-red" },
      { id: "imp-impact-assessment", label: "Impact Assessment/\nPerformance Metrics", pos: { left: 70.58, top: 66.95, width: 12.61, height: 4.9 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#" },
      { id: "imp-adaptation-measures", label: "Adaptation Measures", pos: { left: 88.79, top: 66.39, width: 7.32, height: 6.16 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "adapt-teal" },
      { id: "imp-soft-adaptation", label: "Soft Adaptation\ne.g. early warning", pos: { left: 71.52, top: 50.56, width: 18.05, height: 4.76 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "cyan-box" },
      { id: "imp-hard-adaptation", label: "Hard Adaptation\ne.g. green/grey infrastructure", pos: { left: 71.52, top: 91.6, width: 18.05, height: 4.76 }, text: "Content coming soon — awaiting text from DARe.", isPlaceholder: true, handbookUrl: "#", variant: "cyan-box" }
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
