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
   See MIGRATION-NOTES.md for the full file-by-file mapping.
   ========================================================================== */

const TPRAF_CONTENT = {

  simple: {
    title: "Overview of TPRAF: Simple Form",
    subtitle: "Level 1",
    boxes: [
      {
        id: "transport-scenarios",
        label: "Transport Scenarios",
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
      [ { x: 67.83, y: 45.62 }, { x: 67.83, y: 27 }, { x: 24, y: 27 }, { x: 24, y: 34.04 }, { x: 20.21, y: 34.04 } ],
      /* Adaptation/Interventions (bottom) -> Hazard Model (right side, vertical middle) */
      [ { x: 67.83, y: 54.39 }, { x: 67.83, y: 61 }, { x: 24, y: 61 }, { x: 24, y: 64.35 }, { x: 20.21, y: 64.35 } ]
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
        pos: { left: 5.92, top: 25.48, width: 9.16, height: 6.88 },
        text: "Models used to build a statistically representative population of the study area, with a variety of socio-demographic attributes (e.g., age, sex, income) and activity plans (e.g., trip purpose, starting time, main transport mode, origin-destination), such as NTEM, LUISA, UDM, SILO, and MITO.",
        isPlaceholder: false,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "transport-supply",
        label: "Transport Supply",
        pos: { left: 15.74, top: 25.48, width: 9.16, height: 6.88 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
        handbookUrl: "#",
        variant: "navy",
        group: "imp"
      },
      {
        id: "transport-system",
        label: "Transport System",
        pos: { left: 10.4, top: 37.61, width: 9.74, height: 6.81 },
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
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
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
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
        text: "Content coming soon — awaiting text from DARe.",
        isPlaceholder: true,
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
    containers: [
      { id: "transport-scenarios-bg", pos: { left: 5.26, top: 24.49, width: 20.61, height: 9.15 } },
      { id: "weather-climate-bg", pos: { left: 5.04, top: 82.65, width: 21.49, height: 9.15 } },
      { id: "bau-bg", pos: { left: 21.13, top: 50.34, width: 21.65, height: 10.06 } },
      { id: "risk-mitigation-bg", pos: { left: 53.98, top: 50.44, width: 32.74, height: 9.96 } }
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
       own start/end shape-attachment data (same method used for Simple). */
    arrows: [
      { from: { x: 15.27, y: 44.42 }, to: { x: 14.95, y: 51.06 } },   // Transport System -> Impact Assessment
      { from: { x: 16.52, y: 87.25 }, to: { x: 14.98, y: 87.25 } },   // Climate Scenario -> Weather Variables
      { from: { x: 14.96, y: 72.1 }, to: { x: 14.96, y: 69.11 } },    // Hazard Model -> Transport Specific Threshold (up)
      { from: { x: 14.95, y: 62.29 }, to: { x: 14.95, y: 59.66 } },   // Transport Specific Threshold -> Impact Assessment (up)
      { from: { x: 20.12, y: 55.36 }, to: { x: 22.01, y: 55.36 } },   // Impact Assessment -> Asset/Network Evaluation
      { from: { x: 31.17, y: 55.36 }, to: { x: 32.82, y: 55.36 } },   // Asset/Network Evaluation -> Problem Framing
      { from: { x: 41.98, y: 55.36 }, to: { x: 43.79, y: 55.36 } },   // Problem Framing -> Risk Reduction Needs
      { from: { x: 52.95, y: 55.36 }, to: { x: 54.76, y: 55.36 } },   // Risk Reduction Needs -> Adaptation/Interventions
      { from: { x: 63.92, y: 55.36 }, to: { x: 65.2, y: 55.36 } },    // Adaptation/Interventions -> Cost benefit
      { from: { x: 75.56, y: 55.36 }, to: { x: 76.84, y: 55.36 } },   // Cost benefit -> Portfolio Optimisation
      { from: { x: 86.0, y: 55.36 }, to: { x: 88.0, y: 55.36 } }      // Portfolio Optimisation -> Outcome Assessment
    ],

    /* Elbow connectors for boxes that aren't directly aligned — approximated
       the same way Simple's feedback loops were (exact box connections
       confirmed via the PPTX, exact bend pixels are a clean approximation).
       Drawn in the main flow colour (navy), not the feedback green. */
    elbowPaths: [
      /* Endpoints on Social Behaviour Impacts use its rotated visual footprint
         (centre (4.76, 57.31), 6.82 wide x 9.16 tall) rather than the
         unrotated pos above — same rotation, applied around the same centre. */
      [ { x: 5.82, y: 87.25 }, { x: 4.76, y: 87.25 }, { x: 4.76, y: 61.89 } ],           // Weather Variables -> Social Behaviour Impacts (visual bottom)
      // Final leg is vertical (approaching from below) to enter Hazard Model's
      // bottom edge cleanly — a horizontal final leg into a horizontal wall
      // was why this arrowhead looked misaligned.
      [ { x: 10.4, y: 83.84 }, { x: 10.4, y: 80 }, { x: 14.96, y: 80 }, { x: 14.96, y: 78.92 } ],  // Weather Variables -> Hazard Model
      // Enters Transport Demand's left wall at vertical mid-height, not its
      // bottom — final leg is horizontal so the arrowhead points right, into
      // the wall, instead of up into the underside of the box.
      [ { x: 4.76, y: 52.73 }, { x: 4.76, y: 28.92 }, { x: 5.92, y: 28.92 } ],           // Social Behaviour Impacts (visual top) -> Transport Demand (left wall)
      // Both converge toward Transport System's narrower top edge (it's not
      // as wide as Transport Demand + Transport Supply together), matching
      // the source PPTX rather than two parallel straight lines — the old
      // straight-line version put Transport Supply's arrow just outside
      // Transport System's right edge, missing the box.
      [ { x: 10.5, y: 32.36 }, { x: 10.5, y: 35 }, { x: 12, y: 35 }, { x: 12, y: 37.61 } ],   // Transport Demand -> Transport System
      [ { x: 20.32, y: 32.36 }, { x: 20.32, y: 35 }, { x: 18.5, y: 35 }, { x: 18.5, y: 37.61 } ]  // Transport Supply -> Transport System
    ],

    /* Feedback loops (green) — same pattern as Simple: Adaptation/Interventions
       loops back to both the Transport Scenarios cluster and the Hazard
       Model, confirmed via the PPTX's <a:stCxn>/<a:endCxn> data. */
    feedbackPaths: [
      /* Final leg of each path is horizontal, so the arrowhead approaches
         and points straight into the target's vertical wall — a vertical
         final leg (as this had before) makes the marker point down/up
         instead of into the box, which read as "not clearly visible". */
      [ { x: 59.34, y: 51.9 }, { x: 59.34, y: 25 }, { x: 28, y: 25 }, { x: 28, y: 28.92 }, { x: 24.9, y: 28.92 } ],  // -> Transport Supply (right wall)
      [ { x: 59.34, y: 58.83 }, { x: 59.34, y: 76 }, { x: 22, y: 76 }, { x: 22, y: 75.51 }, { x: 20.14, y: 75.51 } ]  // -> Hazard Model (right wall)
    ],

    /* Portfolio Optimisation -> Adaptation/Interventions (cost-benefit
       iteration loop, within the Risk Mitigation cluster) — a smooth curve
       arcing below the row, in the main-flow navy (not feedback green),
       matching the reference render of this slide. */
    curvedPaths: [
      { from: { x: 81.42, y: 58.83 }, control: { x: 70.38, y: 65 }, to: { x: 59.34, y: 58.83 } }
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
