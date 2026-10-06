<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="@yield('description', "An interactive walkthrough of DARe's Transport Performance & Risk Analysis Framework (TPRAF).")" />
  <title>@yield('title', 'TPRAF — DARe')</title>
  <link rel="icon" href="{{ asset('assets/icons/favicon-32.png') }}" sizes="32x32" />
  <link rel="icon" href="{{ asset('assets/icons/favicon-192.png') }}" sizes="192x192" />
  <link rel="apple-touch-icon" href="{{ asset('assets/icons/favicon-192.png') }}" />
  <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}" />
</head>
<body class="home @yield('body-class')">
  <header class="site-header">
    <a class="brand" href="{{ route('home') }}" aria-label="DARe TPRAF — home">
      <img class="logo" src="{{ asset('assets/icons/logo-header.svg') }}" alt="DARe — Decarbonised, Adaptable, Resilient Transport Infrastructures Hub" />
    </a>
    <div class="header-tools">
      <form class="header-search" id="header-search" role="search" action="https://dare.ac.uk/" method="get" target="_blank">
        <label class="visually-hidden" for="header-search-input">Search</label>
        <input id="header-search-input" type="text" name="s" placeholder="Search" autocomplete="off" />
        <button type="submit" aria-label="Search"><svg class="search-icon" viewBox="0 0 28.425 45.048" aria-hidden="true"><path class="si-t" transform="translate(-117.565 -0.001)" d="M128.571,17.563a22.105,22.105,0,0,1,2.243.624,21.828,21.828,0,0,1,2.194.87.488.488,0,0,0,.588-.118L144.087,6.282a.489.489,0,0,0-.107-.73q-1.026-.648-2.1-1.234a.491.491,0,0,0-.606.113l-8.9,10.73a.488.488,0,0,1-.858-.313L131.617.9a.49.49,0,0,0-.39-.476q-1.2-.247-2.4-.415a.489.489,0,0,0-.553.49l-.075,16.6a.488.488,0,0,0,.374.469"/><path class="si-m" transform="translate(0 -24.998)" d="M27.584,34.746a.464.464,0,0,0-.792-.134l-2.04,2.461a.469.469,0,0,0-.1.393A10.382,10.382,0,1,1,8.217,31.243a.46.46,0,0,0,.184-.364l.014-3.154a.465.465,0,0,0-.693-.406A13.937,13.937,0,0,0,8.078,51.9l-.734,2.068-1.481-.562a1.628,1.628,0,0,0-2.1.935L.328,63.227a5.031,5.031,0,0,0,9.4,3.583l3.436-8.879a1.628,1.628,0,0,0-.94-2.11l-1.542-.586.749-2.11a13.946,13.946,0,0,0,16.152-18.38M8.905,59.046,6.4,65.533A1.46,1.46,0,0,1,3.663,64.5L6.179,58a.618.618,0,0,1,.8-.355l1.574.6a.618.618,0,0,1,.357.8"/></svg></button>
      </form>
    </div>
    <nav class="header-nav" aria-label="Primary">
      <a class="header-home" href="{{ route('home') }}">Home</a>
      <a class="header-cta" href="{{ route('diagram') }}#extended">Explore TPRAF <svg class="btn-sm-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path transform="translate(6.04 6.04) scale(.72)" d="M10.8617 6.86863C10.8049 6.38 10.8118 5.86162 10.8091 5.35811C10.8065 4.86735 10.8665 4.34844 10.9154 3.87096C10.9297 3.72809 10.8479 3.59424 10.713 3.54485L0.684501 0.019231C0.506046 -0.0460975 0.308472 0.0611898 0.269701 0.247615C0.16454 0.754841 0.0758437 1.26791 0.00308098 1.78629C-0.0176325 1.93235 0.0678773 2.0731 0.205967 2.12408L8.64219 5.06546C8.76488 5.11061 8.84614 5.22639 8.8472 5.35705C8.84773 5.48718 8.76806 5.60402 8.64644 5.65023L0.260672 8.70846C0.123113 8.76104 0.0397284 8.90391 0.0625663 9.04944C0.144358 9.56623 0.241552 10.0772 0.35521 10.5828C0.396637 10.7682 0.595274 10.8723 0.772666 10.8043L10.6631 7.19793C10.7969 7.14641 10.8771 7.01098 10.8607 6.86863H10.8617Z" fill="currentColor"/></svg></a>
    </nav>
  </header>

  @yield('content')

  <footer class="site-footer">
    <div class="footer-main">
      <div class="container footer-grid">
        <a class="footer-logo-link" href="{{ route('home') }}" aria-label="DARe TPRAF — home"><img class="footer-logo" src="{{ asset('assets/icons/logo-footer.svg') }}" alt="DARe — Decarbonised, Adaptable, Resilient Transport Infrastructures Hub" /></a>

        <div class="footer-contacts">
          <div class="footer-col">
            <h2 class="footer-heading">Keep in Touch</h2>
            <p><a href="https://mailchi.mp/7fc1a1abba83/dare-hub-mailing-list" target="_blank" rel="noopener">Sign up to our mailing list</a></p>
          </div>
          <div class="footer-col">
            <h2 class="footer-heading">Contact Us</h2>
            <p><a href="mailto:darehub@newcastle.ac.uk">darehub@newcastle.ac.uk</a></p>
          </div>
          <div class="footer-col footer-social">
            <h2 class="footer-heading">Follow Us</h2>
            <ul>
              <li><a href="https://www.linkedin.com/company/dare-hub/" target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href="https://www.youtube.com/channel/UC3SeTcZlJQdFaYH5gdXmw1Q" target="_blank" rel="noopener">Youtube</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-address">
          <p>DARe Hub<br />Stephenson Building<br />Newcastle University<br />NE1 7RU<br />United Kingdom</p>
          <p>Find us on <a href="https://maps.app.goo.gl/P6UAs6S34K7V2CSP9" target="_blank" rel="noopener">Google</a></p>
        </div>

        <div class="footer-logos">
          <h2 class="footer-heading">Funders</h2>
          <a href="https://dare.ac.uk/about-us/our-funders/" target="_blank" rel="noopener" aria-label="DARe Hub funders">
            <img class="footer-funders" src="{{ asset('assets/img/footer-funders.png') }}" alt="Funders: Department for Transport, UK Research and Innovation, Engineering and Physical Sciences Research Council" width="1000" height="116" loading="lazy" />
          </a>
          <h2 class="footer-heading footer-heading-partners">Partners</h2>
          <a href="https://dare.ac.uk/about-us/our-partners/" target="_blank" rel="noopener" aria-label="DARe Hub partners">
            <img class="footer-partners" src="{{ asset('assets/img/footer-partners.png') }}" alt="Partners: Newcastle University, University of Cambridge, University of Glasgow, Heriot-Watt University, Anglia Ruskin University" width="1400" height="104" loading="lazy" />
          </a>
        </div>
      </div>
    </div>

    <div class="footer-signoff">
      <div class="container">
        <p class="footer-copyright">&copy; DARe Consortium. TPRAF, DSP, IMP and associated content are original DARe research outputs. Academic publications are in preparation. Please acknowledge and cite DARe when using or referencing this resource.</p>
        <ul>
          <li><a href="https://dare.ac.uk/cookie-policy/" target="_blank" rel="noopener">Cookie Policy</a></li>
          <li><a href="https://dare.ac.uk/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
  </footer>

  <script>
    const TPRAF_CONTENT = @json($tprafContent);
    const TPRAF_DSP_IMP = @json($tprafDspImp);
  </script>
  <script src="{{ asset('assets/js/app.js') }}"></script>
</body>
</html>
