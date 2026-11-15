<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * DARe's first three case-study walkthroughs for Level 1 Extended, taken
 * from their slide decks (Nov 2026): Cambridgeshire, Greater Manchester and
 * North East. GB & Freight is added as an unpublished draft, ready to fill
 * in from the admin panel once its content arrives.
 *
 * The step text is DARe's own wording, unchanged. Pictures live in
 * public/assets/img/case-studies.
 */
return new class extends Migration
{
    private const TITLES = ['Cambridgeshire', 'Greater Manchester', 'North East', 'GB & Freight'];

    public function up(): void
    {
        $viewId = DB::table('tpraf_views')->where('key', 'extended')->value('id');

        if ($viewId === null) {
            return;
        }

        $now = now();

        foreach ($this->caseStudies() as $caseStudy) {
            DB::table('tpraf_case_studies')->updateOrInsert(
                ['view_id' => $viewId, 'title' => $caseStudy['title']],
                [
                    'position' => $caseStudy['position'],
                    'is_published' => $caseStudy['is_published'],
                    'steps' => json_encode($caseStudy['steps']),
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        $viewId = DB::table('tpraf_views')->where('key', 'extended')->value('id');

        DB::table('tpraf_case_studies')->where('view_id', $viewId)->whereIn('title', self::TITLES)->delete();
    }

    /** @return list<array{title: string, position: int, is_published: bool, steps: list<array<string, mixed>>}> */
    private function caseStudies(): array
    {
        return [
            [
                'title' => 'Cambridgeshire',
                'position' => 1,
                'is_published' => true,
                'steps' => [
                    [
                        'title' => 'Mapping driving forces',
                        'text' => 'Working with stakeholders to understand travel behaviour, climate change, the requirements of the transport network, and the context and constraints. Mapping the driving forces for risks posed to transport in Cambridgeshire provides a basis to then explore the implications for the network.',
                        'boxes' => ['asset-network-evaluation', 'problem-framing'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/cambs-1-drivers-of-risk.jpg',
                                'alt' => 'Drivers of future risk for transport in Cambridgeshire',
                            ],
                        ],
                        'caption' => 'Drivers of future risk for transport in Cambridgeshire',
                    ],
                    [
                        'title' => 'Identifying criticalities and vulnerabilities',
                        'text' => 'Further engagement with stakeholders to identify critical and key routes, key housing developments, where future investment has been confirmed, and the associated vulnerabilities and interdependencies for transport. This is provides an immediate overview of the where the criticalities are, or might start to arise.',
                        'boxes' => ['asset-network-evaluation', 'problem-framing'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/cambs-2-criticality-workshop.jpg',
                                'alt' => 'Workshop exploring criticality and vulnerability in Cambridgeshire',
                            ],
                        ],
                        'caption' => 'Workshop exploring criticality and vulnerability in Cambridgeshire',
                    ],
                    [
                        'title' => 'Ideation - identifying interventions',
                        'text' => 'To understand when interventions might be needed, potential interventions are explored along with timelines and feasibility using systems thinking. This provides a high-level feasibility study in the first instance, taking into account the cost implications for potential interventions, and whether interventions are short-term or long-term solutions.',
                        'boxes' => ['problem-framing', 'risk-reduction-needs'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/cambs-3-systems-thinking.jpg',
                                'alt' => 'Workshop participants applied systems thinking to explore potential interventions.',
                            ],
                        ],
                        'caption' => 'Workshop participants applied systems thinking to explore potential interventions.',
                    ],
                    [
                        'title' => 'Develop transformation pathways',
                        'text' => 'Based upon the feasible interventions identified, proposed transformation pathways can be developed to address the climate adaptability and resilience of the transport network, prioritising critical routes.',
                        'boxes' => ['risk-reduction-needs'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/cambs-4-multi-modal-travel.jpg',
                                'alt' => 'Multi-modal travel and growing population in Cambridgeshire',
                            ],
                        ],
                        'caption' => 'Multi-modal travel and growing population in Cambridgeshire',
                    ],
                    [
                        'title' => 'Multi-criteria analysis',
                        'text' => 'Conduct detailed multi-criteria, multi-stakeholder analysis to prioritise the pathway(s). This is an iterative process, so once feasible options have been identified, the process must be reviewed to narrow down the intervention options and pathways. Includes detailed risk assessment, taking into account climate, travel demand and infrastructure vulnerabilities.',
                        'boxes' => ['cost-benefit'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/cambs-5-hazard-map-a.jpg',
                                'alt' => 'Climate hazard map',
                            ],
                            [
                                'src' => 'assets/img/case-studies/cambs-5-hazard-map-b.jpg',
                                'alt' => 'Climate hazard map',
                            ],
                        ],
                        'caption' => 'Climate hazard maps – traffic volume projections and the likelihood of infrastructure ageing under climate scenarios',
                    ],
                    [
                        'title' => 'Optimum decision selection',
                        'text' => 'Selecting the optimum intervention(s) to promote the shift from short-term, operational responses to long-term, system-orientated thinking, through evidencing the value of urgency of longer-term perspectives. Even in constrained environments, such as in Cambridgeshire, TPRAF can support more informed trade-offs and strategic prioritisation – a need shared across almost all transport authorities.',
                        'boxes' => ['adaptation-interventions'],
                        'images' => [],
                        'caption' => '',
                    ],
                ],
            ],
            [
                'title' => 'Greater Manchester',
                'position' => 2,
                'is_published' => true,
                'steps' => [
                    [
                        'title' => 'Development of modelling framework',
                        'text' => 'Setting up the models and workflow to demonstrate the Integrated Modelling Framework, incorporating transport network, built environment, future climate scenarios, and agents to simulate travel behaviour during extreme weather events to anticipate changes in demand. The transport network is developed within an Agent-Based Model (AgBM) of the Greater Manchester city region, in MATSim software. VITO modelling outputs are used to develop extreme heat hazards.',
                        'boxes' => ['transport-demand', 'transport-supply', 'transport-system', 'social-behaviour-impacts', 'weather-variables', 'climate-scenario', 'hazard-model', 'transport-specific-threshold', 'impact-assessment'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/gm-1-imp-concept.jpg',
                                'alt' => 'Overview of the IMP concept',
                            ],
                        ],
                        'caption' => 'Overview of the IMP concept',
                    ],
                    [
                        'title' => 'Co-creation with stakeholders',
                        'text' => 'Identifying plausible future scenarios for greening interventions that can be implemented within modelling framework. Through a workshop with stakeholders in Manchester, participants identified key opportunities and constraints, and undertook collaborative mapping exercises on Greater Manchester basemaps to inform the development of intervention scenarios.',
                        'boxes' => ['adaptation-interventions'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/gm-2-greening-feasibility.jpg',
                                'alt' => 'Computing rain garden and new tree feasibility based on road space, function and parking space',
                            ],
                        ],
                        'caption' => 'Computing rain garden and new tree feasibility based on road space, function and parking space',
                    ],
                    [
                        'title' => 'Simulate greening scenarios',
                        'text' => 'Run the extreme heat and transport models for scenarios to quantify the impacts of different interventions on transport the transport system. Within the Greater Manchester case study, the simulated scenarios include a range of green infrastructure: trees, vegetation, drainage, viewshed green, and NDVI. The benefits of different green infrastructure adaptations can be assessed in terms of impact of transport resilience.',
                        'boxes' => ['adaptation-interventions', 'impact-assessment'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/gm-3-shade-greenery.jpg',
                                'alt' => 'Spatial-temporal modelling outputs for assessing the shade, greenery and ventilation of adaptation scenarios',
                            ],
                        ],
                        'caption' => 'Spatial-temporal modelling outputs for assessing the shade, greenery and ventilation of adaptation scenarios',
                    ],
                    [
                        'title' => 'Inform actional policy recommendations',
                        'text' => 'Utilise results from modelling to improve available knowledge of the benefits of green infrastructure to support the business case for further investment in Greater Manchester. This work also addressed the gap in the quantification of impacts, by developing a method that can be replicated for other \'urban heat islands.\'',
                        'boxes' => ['outcome-assessment'],
                        'images' => [],
                        'caption' => '',
                    ],
                ],
            ],
            [
                'title' => 'North East',
                'position' => 3,
                'is_published' => true,
                'steps' => [
                    [
                        'title' => 'Scoping of the physical assets within the transport system',
                        'text' => 'Engagement with key local stakeholders to identify physical infrastructure boundaries, as well as confirm the priorities and baselines that will inform modelling and scenario development.',
                        'boxes' => ['transport-system'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/ne-1-tyne-crossings.jpg',
                                'alt' => 'Aerial view of the Tyne Crossings system',
                            ],
                        ],
                        'caption' => 'Aerial view of the Tyne Crossings system',
                    ],
                    [
                        'title' => 'Development of modelling tools',
                        'text' => 'Using the decisions made during the scoping stage to inform the development of models – in the NE case study, this specifically relates to the hydrodynamic flood model CityCAT, the Agent-based Model (AgBM) for the Tyne & Wear region using MATSim software, and the DARe SAT4DARTS cost appraisal tool.',
                        'boxes' => ['transport-system', 'hazard-model'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/ne-2-agent-based-model.jpg',
                                'alt' => 'Calibrated and validated Agent-based model (AgBM) for the Tyne & Wear Region.',
                            ],
                        ],
                        'caption' => 'Calibrated and validated Agent-based model (AgBM) for the Tyne & Wear Region.',
                    ],
                    [
                        'title' => 'Integration with Transport Scenarios',
                        'text' => 'Coupling tools, datasets, and protocols. Operational constraints related to disruptions and diversions for bus and metro services are implemented within models, so if an asset that is constrained in someway then it can be explored how public transport would behave. Developing nine scenarios based on individual bridge crossing closures, as well as combined crossing closures.',
                        'boxes' => ['transport-demand', 'transport-supply', 'transport-system', 'social-behaviour-impacts', 'impact-assessment'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/ne-3-matsim-agents.jpg',
                                'alt' => 'Agents traversing Newcastle and Gateshead transportation networks; derived from MATSim simulation data.',
                            ],
                        ],
                        'caption' => 'Agents traversing Newcastle and Gateshead transportation networks; derived from MATSim simulation data.',
                    ],
                    [
                        'title' => 'Integration with Flooding Scenarios',
                        'text' => 'Coupling tools, datasets, and protocols. Using flood maps to produce water depth curves in CityCAT that can then be implemented into the AgBM in order to constrain the availability of assets for agents. Developing additional scenarios that combine crossing closures with current and future by rainfall events for 2050.',
                        'boxes' => ['transport-demand', 'transport-supply', 'transport-system', 'social-behaviour-impacts', 'weather-variables', 'climate-scenario', 'hazard-model', 'transport-specific-threshold', 'impact-assessment'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/ne-4-citycat-flooding.jpg',
                                'alt' => 'Simulated flooding data produced from CityCAT, over a four hour heavy rainfall event, in Newcastle upon Tyne.',
                            ],
                        ],
                        'caption' => 'Simulated flooding data produced from CityCAT, over a four hour heavy rainfall event, in Newcastle upon Tyne.',
                    ],
                    [
                        'title' => 'Assessment',
                        'text' => 'Simulating scenarios, performing multi-criteria analysis, & economic assessments. Using different rainfall cases to determine the percentage of roads that are closed based upon road surface water depth and the reduction of traffic – for current and future weather events. Utilising performance metrics to quantify the impacts on the system’s resilience.',
                        'boxes' => ['impact-assessment', 'asset-network-evaluation', 'problem-framing', 'risk-reduction-needs', 'adaptation-interventions', 'cost-benefit', 'portfolio-optimisation'],
                        'images' => [
                            [
                                'src' => 'assets/img/case-studies/ne-5-vehicle-counts.jpg',
                                'alt' => 'Daily differences in percentage of vehicle counts, showing increases (red) or decreases (green) at specific locations.',
                            ],
                        ],
                        'caption' => 'Daily differences in percentage of vehicle counts, showing increases (red) or decreases (green) at specific locations.',
                    ],
                    [
                        'title' => 'Inform',
                        'text' => 'Utilise results to develop actionable recommendations. The results can be used to identify, analyse and solve complex challenges around ageing critical assets, by producing insights that can inform decisions within a governance model where maintenance and ownerships is shared across multiple infrastructure owners.',
                        'boxes' => ['outcome-assessment'],
                        'images' => [],
                        'caption' => '',
                    ],
                ],
            ],
            [
                'title' => 'GB & Freight',
                'position' => 4,
                'is_published' => false,
                'steps' => [],
            ],
        ];
    }
};
