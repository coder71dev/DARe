@extends('layouts.app')

@section('title', 'TPRAF — DARe')

@section('content')
<main>

  <section class="hero" aria-labelledby="hero-title">
    <div class="container hero-grid">
      <h1 id="hero-title">DARe&rsquo;s Transport Performance &amp; Risk Analysis Framework</h1>
      <div class="hero-side">
        <p class="tagline">Supporting the transition to a decarbonised transport system that is resilient and adaptive to a changing climate.</p>
        <div class="hero-actions">
          <a class="btn-sm btn-sm-link" href="#what-is-tpraf">What is TPRAF? <svg class="btn-sm-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>
        </div>
      </div>
    </div>
  </section>
  <div class="hero-photo" role="img" aria-label="Aerial view of a motorway junction running through green countryside"></div>

  <section class="section band-mist" id="what-is-tpraf" aria-labelledby="what-title">
    <div class="container">
      <div class="what-intro">
        <div class="what-figure reveal">
          <img src="{{ asset('assets/icons/framework-navy.svg') }}" alt="" width="1482" height="1482" />
        </div>
        <div class="what-copy reveal">
          <span class="pill">Overview</span>
          <h2 id="what-title">What is TPRAF?</h2>
          <p>
            DARe&rsquo;s Transport Performance &amp; Risk Analysis Framework (TPRAF) is a flexible,
            validated framework that helps transport decision-makers assess climate risks,
            resilience, adaptation, and decarbonisation while maintaining system-wide transport
            performance.
          </p>
          <p class="what-lead">It can be used by a wide range of transport decision-makers, including:</p>
        </div>
      </div>

      <ol class="audience-tiles reveal-group">
        <li class="audience-tile reveal">
          <span class="tile-num">01</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-1.svg') }}" alt="" width="66" height="70" style="--w:66;--top:40;--right:38" />
          <span class="tile-label">National infrastructure owners</span>
        </li>
        <li class="audience-tile reveal">
          <span class="tile-num">02</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-2.svg') }}" alt="" width="57" height="72" style="--w:57;--top:31;--right:43" />
          <span class="tile-label">Local and combined authorities</span>
        </li>
        <li class="audience-tile reveal">
          <span class="tile-num">03</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-3.svg') }}" alt="" width="77" height="52" style="--w:77;--top:31;--right:52" />
          <span class="tile-label">Transport operators</span>
        </li>
        <li class="audience-tile reveal">
          <span class="tile-num">04</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-4.svg') }}" alt="" width="60" height="57" style="--w:60;--top:24;--right:44" />
          <span class="tile-label">Freight companies</span>
        </li>
        <li class="audience-tile reveal">
          <span class="tile-num">05</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-5.svg') }}" alt="" width="73" height="66" style="--w:73;--top:24;--right:44" />
          <span class="tile-label">Consultancies</span>
        </li>
        <li class="audience-tile reveal">
          <span class="tile-num">06</span>
          <img class="tile-icon" src="{{ asset('assets/icons/audience-6.svg') }}" alt="" width="68" height="66" style="--w:68;--top:24;--right:48" />
          <span class="tile-label">Researchers</span>
        </li>
      </ol>

      <p class="what-closing">
        It complements existing processes by integrating assessments and decision-making,
        improving data sharing, reducing fragmentation, and supporting better alignment across
        strategic, operational, and investment decisions.
      </p>
    </div>
  </section>

  <section class="section band-navy" aria-labelledby="about-title">
    <div class="container">
      <header class="section-head reveal">
        <h2 id="about-title">About the TPRAF Diagram</h2>
        <span class="pill">The resource</span>
      </header>

      <p class="section-text">
        This interactive TPRAF is one of several DARe Hub resources, alongside the full TPRAF
        report and DARe Handbook. Together, they explain the framework, its development, and
        how to apply it in practice.
      </p>

      <ul class="resource-cards reveal-group">
        <li class="resource-card reveal">
          <a class="resource-card-link" href="https://dare.ac.uk/news/dare-unveils-first-version-of-innovative-framework-tpraf/" target="_blank" rel="noopener" aria-label="Full TPRAF report — read the DARe news article"></a>
          <img class="card-icon" src="{{ asset('assets/icons/icon-publications.png') }}" alt="" width="53" height="61" style="--w:53;--h:61;--top:36;--right:49" />
          <h3>Full<br />TPRAF report</h3>
          <p>The purpose, structure, and development of the framework.</p>
        </li>
        <li class="resource-card reveal">
          <a class="resource-card-link" href="https://dare-private.netlify.app" target="_blank" rel="noopener" aria-label="DARe Handbook"></a>
          <img class="card-icon" src="{{ asset('assets/icons/handbook.svg') }}" alt="" width="42" height="61" style="--w:42;--h:61;--top:35;--right:39" />
          <h3>DARe<br />Handbook</h3>
          <p>Guidance on operationalizing the framework&rsquo;s components in practice.</p>
        </li>
        <li class="resource-card reveal">
          <img class="card-icon" src="{{ asset('assets/icons/icon-search-card.svg') }}" alt="" width="39" height="61" style="--w:39;--h:61;--top:28;--right:42" />
          <h3>This interactive<br />diagram</h3>
          <p>Explore the framework at your own pace.</p>
        </li>
      </ul>

      <p class="section-text">
        This interactive resource provides an accessible introduction to TPRAF, allowing users to
        explore its structure, components, and relationships before moving on to the detailed DARe
        guidance and tools.
      </p>
    </div>
  </section>

  <section class="section band-leaf" aria-labelledby="simple-title">
    <div class="container">
      <header class="section-head reveal">
        <h2 id="simple-title">The simple form</h2>
        <span class="pill pill-navy">Level 1</span>
      </header>

      <div class="landing-diagram">
        <h3 class="diagram-title" id="diagram-title"></h3>
        <p class="diagram-subtitle" id="diagram-subtitle"></p>

        <a class="btn-sm btn-sm-solid landing-extend" href="{{ route('diagram') }}#extended">Explore the extended form <svg class="btn-sm-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>

        @include('partials.diagram-guide')
        @include('partials.process-toggle')

        <p class="scroll-hint">&larr; Swipe or drag to explore the full diagram &rarr;</p>
        <div class="diagram-viewport">
          <div class="diagram-tour" id="diagram-tour">
            <button type="button" class="tour-play tour-guide" id="lesson-start-inline" hidden>
              <span class="tour-play-icon" aria-hidden="true"></span>
              <span id="lesson-start-inline-label">Take a tour</span>
            </button>
            <button type="button" class="tour-play" id="tour-play">
              <span class="tour-play-icon" aria-hidden="true"></span>
              <span id="tour-play-label">Play walkthrough</span>
            </button>
            <p class="tour-caption" id="tour-caption" aria-live="polite">Watch the steps play.</p>
            <div class="tour-actions">
              <button type="button" class="tour-btn" id="tour-restart" hidden>Restart</button>
              <button type="button" class="tour-btn" id="tour-stop" hidden>Stop</button>
            </div>
          </div>
          <button type="button" class="zoom-toggle" id="zoom-toggle" aria-expanded="false" aria-controls="zoom-controls" aria-label="Zoom controls">
            <img src="{{ asset('assets/icons/zoom-plus.svg') }}" alt="" width="45" height="45" />
          </button>
          <div class="zoom-controls" id="zoom-controls" role="group" aria-label="Zoom diagram">
            <button type="button" id="zoom-out" aria-label="Zoom out">&minus;</button>
            <span class="zoom-level" id="zoom-level">100%</span>
            <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
            <div class="zoom-divider"></div>
            <button type="button" id="zoom-fit" aria-label="Fit diagram to screen">Fit</button>
            <button type="button" id="zoom-reset" aria-label="Reset zoom">Reset</button>
          </div>
          <div class="diagram-stage-wrap" id="diagram-stage-wrap">
            <div class="zoom-sizer" id="zoom-sizer">
              <div class="diagram-crop" id="diagram-crop">
                <div class="diagram-stage" id="diagram-stage">
                  <svg class="arrows-layer" id="arrows-layer"></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="process-panel" id="process-panel" hidden>
          <h4 id="process-panel-title"></h4>
          <p id="process-panel-text"></p>
          <a class="process-panel-explore" id="process-panel-explore" href="#" hidden></a>
        </div>
      </div>

    </div>
  </section>

  <section class="section section-further" aria-labelledby="further-title">
    <div class="container">
      <header class="section-head reveal">
        <h2 id="further-title">Further Information</h2>
      </header>

      <div class="info-bars reveal-group">
        <details class="info-bar reveal">
          <summary>
            <img class="info-bar-icon" src="{{ asset('assets/icons/bar-website.svg') }}" alt="" width="36" height="59" style="--w:36;--h:59;--left:31" />
            <span class="info-bar-label">DARe Website</span>
            <svg class="bar-chevron" viewBox="0 0 11 11" aria-hidden="true"><path transform="rotate(90 5.5 5.5)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg>
          </summary>
          <div class="info-bar-body">
            <p>The DARe Hub&rsquo;s main site, at dare.ac.uk.</p>
            <a class="inline-link" href="https://dare.ac.uk" target="_blank" rel="noopener">Visit dare.ac.uk <span class="cta-arrow" aria-hidden="true">&rarr;</span></a>
          </div>
        </details>
        <details class="info-bar reveal">
          <summary>
            <img class="info-bar-icon" src="{{ asset('assets/icons/bar-repository.svg') }}" alt="" width="55" height="55" style="--w:55;--h:55;--left:31" />
            <span class="info-bar-label">DARe Repository</span>
            <svg class="bar-chevron" viewBox="0 0 11 11" aria-hidden="true"><path transform="rotate(90 5.5 5.5)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg>
          </summary>
          <div class="info-bar-body">
            <p>Datasets, models, and outputs from across the DARe Hub.</p>
            <a class="inline-link" href="https://repository.dare.ac.uk/" target="_blank" rel="noopener">Visit the repository <span class="cta-arrow" aria-hidden="true">&rarr;</span></a>
          </div>
        </details>
        <details class="info-bar reveal">
          <summary>
            <img class="info-bar-icon" src="{{ asset('assets/icons/bar-email.svg') }}" alt="" width="46" height="36" style="--w:46;--h:36;--left:35" />
            <span class="info-bar-label">Email us</span>
            <svg class="bar-chevron" viewBox="0 0 11 11" aria-hidden="true"><path transform="rotate(90 5.5 5.5)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg>
          </summary>
          <div class="info-bar-body">
            <p>Questions about TPRAF or the DARe Hub&rsquo;s work.</p>
            <a class="inline-link" href="mailto:darehub@newcastle.ac.uk">darehub@newcastle.ac.uk <span class="cta-arrow" aria-hidden="true">&rarr;</span></a>
          </div>
        </details>
      </div>

      <div class="ack reveal">
        <img class="ack-icon" src="{{ asset('assets/icons/ack-quote.svg') }}" alt="" width="142" height="104" />
        <div class="ack-text">
          <p>
            The development of the DARe Transport Performance &amp; Risk Analysis Framework (TPRAF)
            has been a collaborative effort involving colleagues from across the DARe Hub,
            particularly those contributing to Work Packages 2 and 3. The authors gratefully
            acknowledge the wider DARe team for their expertise, insights, and contributions to
            the framework&rsquo;s development and refinement. We also thank DARe&rsquo;s project
            partners and stakeholders, whose engagement, challenge, and practical experience have
            helped ensure that the TPRAF is grounded in real-world transport infrastructure
            decision-making and reflects the needs of its intended users.
          </p>
          <p>
            <strong>This work was funded by UK Research and Innovation (UKRI) through the
            Engineering and Physical Sciences Research Council (EPSRC), and by the Department for
            Transport, under EPSRC Grant EP/Y024257/1, <em>Research Hub for Decarbonised Adaptable
            and Resilient Transport Infrastructures (DARe)</em>.</strong>
          </p>
        </div>
      </div>

      <div class="ack reveal ack-notice">
        <div class="ack-text">
          <h3 class="ack-heading">Research Output Notice</h3>
          <p>
            This website contains original research
            outputs developed through the DARe programme. The concepts, frameworks,
            methodologies and supporting diagrams and texts presented here &mdash; including the
            Transport Performance &amp; Risk Analysis Framework, Decision Support Process (DSP)
            and Integrated Modelling Platform (IMP) &mdash; represent ongoing research and
            development, and constitute intellectual output developed through the DARe research
            programme.
          </p>
          <p>
            Academic publications describing the detailed scientific and methodological basis of
            these outputs are currently in preparation. All users are requested to acknowledge
            and appropriately cite DARe and relevant outputs and publications when using,
            referencing, adapting, or building upon material presented through this resource.
          </p>
          <p>
            All website content is &copy; National Hub for Decarbonised, Adaptable, Resilient
            Transport Infrastructures (DARe) &ndash; a consortium comprising Newcastle
            University, University of Cambridge, University of Glasgow, Heriot-Watt University,
            and Anglia Ruskin University, funded by UKRI EPSRC and the UK Government Department
            for Transport. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band band-mist" aria-labelledby="explore-title">
    <div class="container cta-inner">
      <div>
        <h2 id="explore-title">Explore the framework</h2>
        <p>
          A guided, interactive walkthrough. Start with the simple form above, then move
          through the extended diagram and the Level 2 component maps.
        </p>
      </div>
      <a class="cta-button" href="{{ route('diagram') }}#extended">Explore TPRAF <svg class="cta-circle" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>
    </div>
  </section>

</main>

@include('partials.modal')
@include('partials.lesson')
@endsection
