/*!
 * Murtaza Corporation -- Weight Calculator Widget
 * Self-contained drop-in tool: styles, markup, and logic all in one file.
 *
 * Usage: add one line to any page, right after script.js --
 *   <script src="calculator-widget.js" defer></script>
 * The widget injects its own <style>, its own floating button + modal
 * markup, and wires up all interactivity itself. jsPDF (needed only for
 * "Export as PDF") is lazy-loaded on first use, so pages that never
 * touch the calculator pay no extra network cost.
 */
(function () {
  'use strict';
  if (window.__calculatorWidgetLoaded) return;
  window.__calculatorWidgetLoaded = true;

  function injectStyles() {
    if (document.getElementById('calculator-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'calculator-widget-styles';
    style.textContent = `
/* ==========================================
   Floating Calculator Widget (matches WhatsApp widget)
========================================== */
.calculator-icon-img{
    width:32px;
    height:32px;
    object-fit:contain;
}
.calculator-widget{
    position:fixed;
    right:25px;
    bottom:114px;   /* 30px bottom + 68px icon + 16px gap, sits directly above WhatsApp */
    display:flex;
    align-items:center;
    gap:12px;
    text-decoration:none;
    z-index:9999;
}

.calculator-icon{
    width:68px;
    height:68px;
    border-radius:50%;
    background:var(--color-cobalt-ink);
    display:flex;
    justify-content:center;
    align-items:center;
    color:#ffffff;
    font-size:30px;
    box-shadow:0 12px 30px rgba(0,0,0,.25);
    transition:.35s;
}

.calculator-icon i{
    line-height:1;
}

.calculator-widget:hover .whatsapp-text{
    opacity:1;
    transform:translateX(0);
}

.calculator-widget:hover .calculator-icon{
    transform:scale(1.12);
    box-shadow:0 18px 40px rgba(0,0,0,.35);
}

@media(max-width:768px){
    .calculator-widget{
        bottom:104px;
    }
    .calculator-icon{
        width:58px;
        height:58px;
        font-size:26px;
    }
    
}
.calculator-icon{
    position:relative;   /* needed so the pulse ring positions correctly */
}

.calculator-icon::before{
    content:"";
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    border-radius:50%;
    background:var(--color-cobalt-ink);
    animation:calcPulse 2.2s ease-out infinite;
    z-index:-1;
}

@keyframes calcPulse{
    0%{
        transform:scale(1);
        opacity:0.6;
    }
    100%{
        transform:scale(1.8);
        opacity:0;
    }
}
/* ==========================================
   Calculator Modal
========================================== */

.calculator-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.55);
    backdrop-filter:blur(3px);
    display:flex;
    align-items:center;
    justify-content:center;
    opacity:0;
    visibility:hidden;
    transition:opacity .3s ease, visibility .3s ease;
    z-index:10000;
}

.calculator-overlay.is-open{
    opacity:1;
    visibility:visible;
}

.calculator-modal{
    background:#ffffff;
    width:97%;
    max-width:1320px;
    max-height:94vh;
    overflow-y:auto;
    border-radius:20px;
    padding:36px 40px;
    position:relative;
    box-shadow:0 30px 70px rgba(20,24,40,.28);
    border:1px solid rgba(0,0,0,.06);
    transform:translateY(20px) scale(.97);
    opacity:0;
    transition:transform .35s cubic-bezier(.16,1,.3,1), opacity .35s ease;
}

.calculator-overlay.is-open .calculator-modal{
    transform:translateY(0) scale(1);
    opacity:1;
}

.calculator-modal-close{
    position:absolute;
    top:18px;
    right:18px;
    width:34px;
    height:34px;
    border:1px solid #ececec;
    background:#fafafa;
    border-radius:50%;
    font-size:19px;
    line-height:1;
    cursor:pointer;
    color:#555;
    transition:.2s;
}

.calculator-modal-close:hover{
    background:#f1f1f1;
    border-color:#ddd;
    color:#222;
}

.calculator-modal-header{
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:22px;
    padding-bottom:18px;
    border-bottom:1px solid #eee;
}

.calculator-modal-header::before{
    content:"";
    width:38px;
    height:38px;
    border-radius:10px;
    background:var(--color-cobalt-ink);
    -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='2' width='16' height='20' rx='2'/%3E%3Cline x1='8' y1='6' x2='16' y2='6'/%3E%3Cline x1='8' y1='10' x2='9.5' y2='10'/%3E%3Cline x1='12' y1='10' x2='13.5' y2='10'/%3E%3Cline x1='16' y1='10' x2='16' y2='10'/%3E%3Cline x1='8' y1='14' x2='9.5' y2='14'/%3E%3Cline x1='12' y1='14' x2='13.5' y2='14'/%3E%3Cline x1='16' y1='14' x2='16' y2='14'/%3E%3Cline x1='8' y1='18' x2='9.5' y2='18'/%3E%3Cline x1='12' y1='18' x2='13.5' y2='18'/%3E%3Cline x1='16' y1='18' x2='16' y2='18'/%3E%3C/svg%3E") center/contain no-repeat;
    mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='2' width='16' height='20' rx='2'/%3E%3Cline x1='8' y1='6' x2='16' y2='6'/%3E%3Cline x1='8' y1='10' x2='9.5' y2='10'/%3E%3Cline x1='12' y1='10' x2='13.5' y2='10'/%3E%3Cline x1='16' y1='10' x2='16' y2='10'/%3E%3Cline x1='8' y1='14' x2='9.5' y2='14'/%3E%3Cline x1='12' y1='14' x2='13.5' y2='14'/%3E%3Cline x1='16' y1='14' x2='16' y2='14'/%3E%3Cline x1='8' y1='18' x2='9.5' y2='18'/%3E%3Cline x1='12' y1='18' x2='13.5' y2='18'/%3E%3Cline x1='16' y1='18' x2='16' y2='18'/%3E%3C/svg%3E") center/contain no-repeat;
    flex-shrink:0;
}

.calculator-modal-header h3{
    margin:0;
    font-size:var(--text-body);
    font-weight:700;
    color:var(--color-ink);
    letter-spacing:-0.01em;
}
/* ==========================================
   Calculator Form
========================================== */

.calc-form{
    display:flex;
    flex-direction:column;
    gap:16px;
    font-family:var(--font-lunar);
}
.calc-layout{
    display:grid;
    grid-template-columns:1.3fr 1fr;
    gap:28px;
    align-items:start;
}

.calc-main{
    display:flex;
    flex-direction:column;
    gap:16px;
}

.calc-side{
    display:flex;
    flex-direction:column;
    gap:16px;
    padding-left:28px;
    border-left:1px solid #eee;
}
.calc-side-grouped{
    display:flex;
    gap:16px;
    align-items:flex-start;
}
.calc-side-grouped > .calc-row{
    flex:1;
    margin:0;
}
.calc-side-grouped .calc-history{
    flex:1;
    margin-top:0;
}
@media (max-width:720px){
    .calc-side-grouped{
        flex-direction:column;
    }
}

/* Stack back to portrait on narrow / mobile screens */
@media (max-width:720px){
    .calculator-modal{ max-width:560px; }
    .calc-layout{
        grid-template-columns:1fr;
    }
    .calc-side{
        padding-left:0;
        border-left:none;
        border-top:1px solid #e6e6e6;
        padding-top:16px;
    }
}

.calc-row label{
    display:block;
    font-size:13px;
    font-weight:600;
    color:#333;
    margin-bottom:6px;
}

.calc-row select,
.calc-row input[type="number"]{
    width:100%;
    padding:11px 12px;
    border:1px solid #e2e2e2;
    border-radius:10px;
    font-size:var(--text-caption);
    font-family:var(--font-lunar);
    background:#ffffff;
    color:#222;
    transition:.2s;
}

.calc-row select:hover,
.calc-row input[type="number"]:hover{
    border-color:#ccc;
}

.calc-row select:focus,
.calc-row input[type="number"]:focus{
    outline:none;
    border-color:var(--color-cobalt-ink);
    background:#fff;
    box-shadow:0 0 0 3px rgba(30,58,168,.10);
}
.calc-shape-bar{
    padding:0 4px 20px;
    margin-bottom:8px;
    border-bottom:1px solid #eee;
}
.calc-shape-bar label{
    display:block;
    font-size:12px;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:.05em;
    color:#888;
    margin-bottom:12px;
}
.calc-shape-icons{
    display:flex;
    flex-wrap:nowrap;
    justify-content:space-between;
    gap:10px;
    width:100%;
}
.calc-shape-icon{
    flex:1 1 0;
    min-width:0;
    height:92px;
    border:1.5px solid #ececec;
    border-radius:14px;
    background:#ffffff;
    padding:14px 6px 10px;
    cursor:pointer;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:8px;
    color:#9a9a9a;
    transform-origin:50% 100%;
    transition:transform .18s cubic-bezier(.34,1.56,.64,1), border-color .18s ease, background .18s ease, box-shadow .18s ease, color .18s ease;
    -webkit-tap-highlight-color:transparent;
    will-change:transform;
}
.calc-shape-svg{
    width:26px;
    height:26px;
    flex-shrink:0;
    pointer-events:none;
}
.calc-shape-icon-label{
    font-size:10.5px;
    font-weight:600;
    line-height:1.15;
    color:inherit;
    text-align:center;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    max-width:100%;
    pointer-events:none;
}
.calc-shape-icon:hover{
    border-color:#b7c2ea;
    background:#f7f9ff;
    color:var(--color-cobalt-ink);
    box-shadow:0 6px 16px rgba(30,58,168,.10);
}
.calc-shape-icon.pressed{
    transform:scale(.92);
    transition-duration:.08s;
}
.calc-shape-icon.is-active{
    border-color:var(--color-cobalt-ink);
    background:var(--color-cobalt-ink);
    color:#ffffff;
    box-shadow:0 8px 20px rgba(30,58,168,.25);
}
.calc-shape-icon:focus-visible{
    outline:2px solid var(--color-cobalt-ink);
    outline-offset:2px;
}
.calc-shape-name{
    margin:2px 0 0;
    font-size:12.5px;
    font-weight:600;
    color:var(--color-cobalt-ink);
    transition:opacity .15s ease;
}

@media (max-width:480px){
    .calc-shape-icons{
        flex-wrap:wrap;
    }
    .calc-shape-icon{
        flex:1 1 calc(33.333% - 8px);
        height:78px;
    }
    .calc-shape-svg{
        width:22px;
        height:22px;
    }
    .calc-shape-icon-label{
        font-size:9.5px;
    }
}
.calc-input-group{
    display:flex;
    gap:8px;
}

.calc-input-group input{
    flex:2;
}

.calc-input-group select{
    flex:1;
}

.calc-actions{
    display:flex;
    gap:12px;
    margin-top:4px;
}

.calc-actions .btn{
    flex:1;
    text-align:center;
    justify-content:center;
}
.calc-actions .btn-ghost{
    background:transparent;
    color:var(--color-cobalt-ink);
    border:2px solid var(--color-cobalt-ink);
}

.calc-actions .btn-ghost:hover{
    background:var(--color-cobalt-ink);
    color:#fff;
}

.calc-error{
    color:#c0392b;
    background:#fdecea;
    border-radius:8px;
    padding:10px 12px;
    font-size:13px;
    margin:0;
}

.calc-results{
    background:#f7f9ff;
    border:1px solid #e4e9fa;
    border-left:3px solid var(--color-cobalt-ink);
    border-radius:12px;
    padding:16px 18px;
    display:flex;
    flex-direction:column;
    gap:10px;
}

.calc-result-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    font-size:var(--text-caption);
    color:#555;
}

.calc-result-row strong{
    color:var(--color-cobalt-ink);
    font-size:16px;
}
.calc-history{
    margin-top:12px;
    background:#ffffff;
    border:1px solid #ececec;
    border-radius:12px;
    padding:14px 16px;
    display:flex;
    flex-direction:column;
    gap:10px;
    box-shadow:0 2px 8px rgba(20,24,40,.04);
}

.calc-side-header{
    margin:0;
}
.calc-history-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    font-size:13px;
    font-weight:600;
    color:#333;
}

.calc-history-clear{
    background:none;
    border:none;
    color:#c0392b;
    font-size:12px;
    font-weight:600;
    cursor:pointer;
    padding:4px 6px;
}

.calc-history-list{
    display:flex;
    flex-direction:column;
    gap:6px;
    max-height:180px;
    overflow-y:auto;
}

.calc-history-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:8px;
    background:#fafbfc;
    border:1px solid #eee;
    border-radius:8px;
    padding:8px 10px;
    font-size:13px;
    color:#333;
}

.calc-history-desc{
    flex:1;
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.calc-history-weight{
    font-weight:600;
    color:var(--color-cobalt-ink);
    margin:0 10px;
    white-space:nowrap;
    flex-shrink:0
}

.calc-history-remove{
    background:none;
    border:none;
    color:#999;
    font-size:16px;
    line-height:1;
    cursor:pointer;
    padding:0 2px;
}
.calc-history-remove:hover{ color:#c0392b; }

.calc-history-total{
    display:flex;
    justify-content:space-between;
    align-items:center;
    border-top:1px solid #dfe3ee;
    padding-top:10px;
    font-size:14px;
    color:#333;
}
.calc-history-total strong{ color:var(--color-cobalt-ink); font-size:15px; }

.calc-history-confirm{
    background:#fdecea;
    color:#c0392b;
    border-radius:8px;
    padding:10px 12px;
    font-size:13px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}
.calc-history-confirm-yes,
.calc-history-confirm-no{
    cursor:pointer;
    font-weight:600;
    margin-left:12px;
    text-decoration:underline;
}
.calc-standards-note{
    font-weight:700;
    color:#666;
    font-size:11px;
    text-align:center;
    margin:2px 0 0;
}
/* ===========================
   Latest Updates Section
=========================== */

.updates-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    margin-top: 48px;
}

.update-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,.08);
    transition: transform .35s ease,
                box-shadow .35s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.update-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 24px 60px rgba(0,0,0,.15);
    border-color: rgba(181,146,92,.35);
}
.update-card img {
    width: 100%;
    height: 240px;
    object-fit: cover;
    display: block;
    transition:
        transform .7s ease,
        filter .5s ease;
}
.update-card:hover img {
    transform: scale(1.08);
    filter: brightness(.92);
}

.update-content {
    padding: 28px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.update-tag {
    display: inline-block;
    margin-bottom: 14px;
    font-size: .8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--color-cobalt-ink);
}
.update-content h3 {
    margin-bottom: 16px;
}

.update-content p {
    margin-bottom: 28px;
    flex: 1;
}

.update-content .btn-cta {
    align-self: flex-start;
}

@media (max-width: 992px) {
    .updates-grid {
        grid-template-columns: 1fr;
    }

    .update-card img {
        height: 220px;
    }
}
.update-card {
    position: relative;
    overflow: hidden;
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(0,0,0,.08);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition:
        transform .45s ease,
        box-shadow .45s ease,
        border-color .35s ease;
}
.update-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .4s ease;
    z-index: 3;
}

.update-card:hover::before {
    transform: scaleX(1);
}
.social-icon{
    width:44px;height:44px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    background:transparent;border:1.5px solid var(--color-ash);
    color:var(--color-ink);font-size:18px;
    transition:background .2s ease, border-color .2s ease, color .2s ease, transform .12s ease;
  }
  .social-icon:hover{
    background:var(--color-cobalt-ink);border-color:var(--color-cobalt-ink);color:#fff;
    transform:translateY(-2px);
  }
  .contact-social-row{display:flex;gap:12px;margin:24px 0 16px;}
  .calc-history-pdf{
    background:var(--color-cobalt-ink);
    color:#fff;
    border:none;
    border-radius:8px;
    padding:10px 14px;
    font-size:13px;
    font-weight:600;
    cursor:pointer;
    transition:.2s;
}
.calc-history-pdf:hover{ background:var(--color-cobalt-ink-hover); }
`;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    if (document.getElementById('calculatorWidgetBtn')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
<!-- Floating Calculator Button -->
<a href="#"
   class="calculator-widget"
   id="calculatorWidgetBtn"
   aria-label="Open pipe calculator">

    <span class="whatsapp-text">
        Calculator
    </span>

    <div class="calculator-icon">
        <i class="fa-solid fa-calculator"></i>
    </div>

</a>
<!-- Calculator Modal -->
<div class="calculator-overlay" id="calculatorOverlay">
  <div class="calculator-modal" id="calculatorModal" role="dialog" aria-modal="true" aria-labelledby="calculatorModalTitle">
    <button type="button" class="calculator-modal-close" id="calculatorModalClose" aria-label="Close calculator">&times;</button>
    <div class="calculator-modal-header">
      <h3 id="calculatorModalTitle">Pipe Calculator</h3>
    </div>
    <div class="calculator-modal-body">
  <form id="calcForm" onsubmit="return false;" class="calc-form">

   <div class="calc-shape-bar" id="calcShapeBar">
      <label>Shape</label>
      <div class="calc-shape-icons" id="calcShapeIcons">
        <button type="button" class="calc-shape-icon is-active" data-shape="Round" aria-pressed="true" aria-label="Round"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg><span class="calc-shape-icon-label">Round</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Square" aria-pressed="false" aria-label="Square"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1.5"/></svg><span class="calc-shape-icon-label">Square</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Rectangle" aria-pressed="false" aria-label="Rectangle"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="1.5"/></svg><span class="calc-shape-icon-label">Rectangle</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Hexagonal" aria-pressed="false" aria-label="Hexagonal"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8l5 8-5 8H8l-5-8z"/></svg><span class="calc-shape-icon-label">Hexagonal</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Octagonal" aria-pressed="false" aria-label="Octagonal"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/></svg><span class="calc-shape-icon-label">Octagonal</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Sheet" aria-pressed="false" aria-label="Sheet"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="10" width="18" height="4" rx="1"/></svg><span class="calc-shape-icon-label">Sheet</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Plate" aria-pressed="false" aria-label="Plate"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15V9l4-3h8l4 3v6l-4 3H8z"/><path d="M4 9l4 3h8l4-3"/><path d="M8 12v6"/><path d="M16 12v6"/></svg><span class="calc-shape-icon-label">Plate</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Pipe" aria-pressed="false" aria-label="Tubular / Pipe"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12a7 3 0 0 0 14 0V6"/></svg><span class="calc-shape-icon-label">Tubular/Pipe</span></button>
        <button type="button" class="calc-shape-icon" data-shape="Ring" aria-pressed="false" aria-label="Ring"><svg class="calc-shape-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/></svg><span class="calc-shape-icon-label">Ring</span></button>
      </div>
      <p class="calc-shape-name" id="calcShapeName" style="display:none;">Round</p>
      <select id="calcShape" style="display:none;">
        <option value="Round" selected>Round</option>
        <option value="Square">Square</option>
        <option value="Rectangle">Rectangle</option>
        <option value="Hexagonal">Hexagonal</option>
        <option value="Octagonal">Octagonal</option>
        <option value="Sheet">Sheet</option>
        <option value="Plate">Plate</option>
        <option value="Tubular">Tubular</option>
        <option value="Pipe">Pipe</option>
        <option value="Ring">Ring</option>
        </select>
    </div>

   <div class="calc-layout">
    <div class="calc-main">

    <div class="calc-row">
      <label for="calcMaterial">Material</label>
      <select id="calcMaterial">
        <option data-factor="1" selected>Steel (default)</option>
        <option data-factor="0.3462">Aluminum 1100</option>
        <option data-factor="0.3604">Aluminum 2011</option>
        <option data-factor="0.3568">Aluminum 2014</option>
        <option data-factor="0.3568">Aluminum 2017</option>
        <option data-factor="0.3533">Aluminum 2024</option>
        <option data-factor="0.3498">Aluminum 3003</option>
        <option data-factor="0.3462">Aluminum 5005</option>
        <option data-factor="0.3427">Aluminum 5052</option>
        <option data-factor="0.3356">Aluminum 5056</option>
        <option data-factor="0.3392">Aluminum 5083</option>
        <option data-factor="0.3392">Aluminum 5086</option>
        <option data-factor="0.3462">Aluminum 6061</option>
        <option data-factor="0.3462">Aluminum 6063</option>
        <option data-factor="0.3568">Aluminum 7050</option>
        <option data-factor="0.3568">Aluminum 7075</option>
        <option data-factor="0.3604">Aluminum 7178</option>
        <option data-factor="1.030">Stainless 300 Series</option>
        <option data-factor="1.010">Stainless 400 Series</option>
        <option data-factor="1.132">Nickel 200</option>
        <option data-factor="1.125">Nickel 400</option>
        <option data-factor="1.121">Nickel R-405</option>
        <option data-factor="1.075">Nickel K-500</option>
        <option data-factor="1.072">Nickel 600</option>
        <option data-factor="1.075">Nickel 625</option>
        <option data-factor="1.012">Nickel 800H</option>
        <option data-factor="1.012">Nickel 800AT</option>
        <option data-factor="1.037">Nickel 825</option>
        <option data-factor="1.012">Nickel 330</option>
        <option data-factor="1.030">Nickel 20</option>
        <option data-factor="1.132">Nickel C-276</option>
        <option data-factor="1.012">Nickel 2545MD</option>
        <option data-factor="0.229">Magnesium</option>
        <option data-factor="0.236">Beryllium</option>
        <option data-factor="0.575">Titanium</option>
        <option data-factor="0.812">Zirconium</option>
        <option data-factor="0.911">Cast Iron</option>
        <option data-factor="0.911">Zinc</option>
        <option data-factor="1.084">Brass</option>
        <option data-factor="1.095">Columbium</option>
        <option data-factor="1.144">Copper</option>
        <option data-factor="1.303">Molybdenum</option>
        <option data-factor="1.339">Silver</option>
        <option data-factor="1.448">Lead</option>
        <option data-factor="2.120">Tantalum</option>
        <option data-factor="2.462">Tungsten</option>
        <option data-factor="2.466">Gold</option>
      </select>
    </div>

    <div class="calc-row" id="calcField1Row">
      <label id="calcLabel1" for="calcParam1">Diameter</label>
      <div class="calc-input-group">
        <input type="number" step="any" id="calcParam1" placeholder="0.00" />
        <select id="calcUnit1">
          <option>in</option><option>ft</option><option>yd</option>
          <option>mm</option><option>cm</option><option>m</option>
        </select>
      </div>
    </div>

    <div class="calc-row" id="calcField2Row" style="display:none;">
      <label id="calcLabel2" for="calcParam2">Width</label>
      <div class="calc-input-group">
        <input type="number" step="any" id="calcParam2" placeholder="0.00" />
        <select id="calcUnit2">
          <option>in</option><option>ft</option><option>yd</option>
          <option>mm</option><option>cm</option><option>m</option>
        </select>
      </div>
    </div>

    <div class="calc-row" id="calcField3Row">
      <label id="calcLabel3" for="calcParam3">Length</label>
      <div class="calc-input-group">
        <input type="number" step="any" id="calcParam3" placeholder="0.00" />
        <select id="calcUnit3">
          <option>in</option><option>ft</option><option>yd</option>
          <option>mm</option><option>cm</option><option>m</option>
        </select>
      </div>
    </div>

    <div class="calc-row">
      <label for="calcQty">Quantity (pieces)</label>
      <input type="number" step="1" min="1" id="calcQty" value="1" />
    </div>

    <p class="calc-error" id="calcError" style="display:none;"></p>

    <div class="calc-actions">
      <button type="button" class="btn btn-primary btn-sm" id="calcCalculateBtn">Calculate</button>
      <button type="button" class="btn btn-ghost btn-sm" id="calcClearBtn">Clear</button>
    </div>

   </div>
    <div class="calc-side">

<div class="calc-history-header calc-side-header">
  <span>Saved calculations</span>
  <button type="button" class="calc-history-clear" id="calcHistoryClearBtn">Remove all</button>
</div>

<div class="calc-history" id="calcHistory" style="display:none;">
  <div class="calc-history-list" id="calcHistoryList"></div>

 <div class="calc-history-total">
    <span>Total weight</span>
    <strong><span id="calcHistoryTotalLbs">0</span> lbs / <span id="calcHistoryTotalKg">0</span> kg</strong>
  </div>

  <button type="button" class="calc-history-pdf" id="calcHistoryPdfBtn">Export as PDF</button>

  <p class="calc-standards-note">Weights calculated per standard imperial steel weight formulas.</p>

  <div class="calc-history-confirm" id="calcHistoryConfirm" style="display:none;">
    Are you sure?
    <span class="calc-history-confirm-yes" id="calcHistoryConfirmYes">Yes</span>
    <span class="calc-history-confirm-no" id="calcHistoryConfirmNo">No</span>
  </div>
</div>

    <div class="calc-results" id="calcResults" style="display:none;">
      <div class="calc-result-row">
        <span>Weight</span>
        <strong><span id="calcResultLbs">0</span> lbs</strong>
      </div>
      <div class="calc-result-row">
        <span>Weight</span>
        <strong><span id="calcResultKg">0</span> kg</strong>
      </div>
  </div>
</div>
    </div>

 </form></div></div>
</div>
`;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    return loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      .then(function () {
        return loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
      });
  }

  function initCalculator() {
  // Calculator modal open/close
  (function () {
    const btn = document.getElementById('calculatorWidgetBtn');
    const overlay = document.getElementById('calculatorOverlay');
    const closeBtn = document.getElementById('calculatorModalClose');
    if (!btn || !overlay || !closeBtn) return;

    const openModal = () => {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });
  })();
  // Pipe / Metal Weight Calculator logic
  (function () {
    const shapeSelect   = document.getElementById('calcShape');
    const label1        = document.getElementById('calcLabel1');
    const label2        = document.getElementById('calcLabel2');
    const label3        = document.getElementById('calcLabel3');
    const field2Row      = document.getElementById('calcField2Row');
    const param1         = document.getElementById('calcParam1');
    const param2         = document.getElementById('calcParam2');
    const param3         = document.getElementById('calcParam3');
    const qtyInput       = document.getElementById('calcQty');
    const materialSelect = document.getElementById('calcMaterial');
    const calcBtn        = document.getElementById('calcCalculateBtn');
    const clearBtn       = document.getElementById('calcClearBtn');
    const errorBox       = document.getElementById('calcError');
    const resultsBox     = document.getElementById('calcResults');
    const resultLbs      = document.getElementById('calcResultLbs');
    const resultKg       = document.getElementById('calcResultKg');
    const historyBox        = document.getElementById('calcHistory');
    const historyList        = document.getElementById('calcHistoryList');
    const historyClearBtn    = document.getElementById('calcHistoryClearBtn');
    const historyConfirm     = document.getElementById('calcHistoryConfirm');
    const historyConfirmYes  = document.getElementById('calcHistoryConfirmYes');
    const historyConfirmNo   = document.getElementById('calcHistoryConfirmNo');
    const totalLbsEl         = document.getElementById('calcHistoryTotalLbs');
    const totalKgEl          = document.getElementById('calcHistoryTotalKg');

    let calcHistory = JSON.parse(localStorage.getItem('calcHistory') || '[]');

    if (!shapeSelect) return; // calculator not on this page

    const LABELS = {
      Round:      { l1: 'Diameter',        l2: null,               l3: 'Length' },
      Square:     { l1: 'Width',           l2: null,               l3: 'Length' },
      Hexagonal:  { l1: 'Diameter',        l2: null,               l3: 'Length' },
      Octagonal:  { l1: 'Diameter',        l2: null,               l3: 'Length' },
      Sheet:      { l1: 'Thickness',       l2: 'Width',            l3: 'Length' },
      Plate:      { l1: 'Thickness',       l2: 'Width',            l3: 'Length' },
      Rectangle:  { l1: 'Thickness',       l2: 'Width',            l3: 'Length' },
      Tubular:    { l1: 'Outer Diameter',  l2: 'Wall Thickness',   l3: 'Length' },
      Pipe:       { l1: 'Outer Diameter',  l2: 'Wall Thickness',   l3: 'Length' },
      Ring:       { l1: 'Outer Diameter',  l2: 'Inner Diameter',   l3: 'Thickness' }
    };

    function updateLabels() {
      const shape = shapeSelect.value;
      const cfg = LABELS[shape];
      label1.textContent = cfg.l1;
      label3.textContent = cfg.l3;
      if (cfg.l2) {
        label2.textContent = cfg.l2;
        field2Row.style.display = '';
      } else {
        field2Row.style.display = 'none';
        param2.value = '';
      }
    }
    shapeSelect.addEventListener('change', updateLabels);
    updateLabels();

    const shapeNameEl = document.getElementById('calcShapeName');
    const shapeIcons  = [...document.querySelectorAll('.calc-shape-icon')];
    const buzz = () => { if (navigator.vibrate) navigator.vibrate(12); };

    function selectShapeIcon(btn, { silent = false } = {}) {
      shapeSelect.value = btn.dataset.shape;
      shapeIcons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      if (shapeNameEl) shapeNameEl.textContent = btn.getAttribute('aria-label') || btn.dataset.shape;
      updateLabels();
      if (!silent) buzz();
    }

    shapeIcons.forEach(btn => {
      // Tactile press feedback (mirrors the header nav "pressed" behaviour)
      btn.addEventListener('touchstart', () => btn.classList.add('pressed'), { passive: true });
      btn.addEventListener('touchend',   () => btn.classList.remove('pressed'));
      btn.addEventListener('touchcancel',() => btn.classList.remove('pressed'));
      btn.addEventListener('mousedown',  () => btn.classList.add('pressed'));
      btn.addEventListener('mouseup',    () => btn.classList.remove('pressed'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('pressed'));

      btn.addEventListener('click', () => selectShapeIcon(btn));
    });

    // macOS-dock-style magnify: the hovered icon grows and lifts most,
    // with immediate neighbours scaling up less, fading out by two positions.
    const dockReset = () => {
      shapeIcons.forEach(el => { el.style.transform = ''; });
    };
    const dockMagnify = (centerIndex) => {
      dockReset();
      const falloff = [
        { offset: -2, scale: 1.05, lift: 0   },
        { offset: -1, scale: 1.15, lift: -5  },
        { offset:  0, scale: 1.32, lift: -10 },
        { offset:  1, scale: 1.15, lift: -5  },
        { offset:  2, scale: 1.05, lift: 0   },
      ];
      falloff.forEach(({ offset, scale, lift }) => {
        const el = shapeIcons[centerIndex + offset];
        if (el) el.style.transform = `translateY(${lift}px) scale(${scale})`;
      });
    };
    shapeIcons.forEach((btn, index) => {
      btn.addEventListener('mouseenter', () => dockMagnify(index));
    });
    const shapeIconsBar = document.getElementById('calcShapeIcons');
    if (shapeIconsBar) shapeIconsBar.addEventListener('mouseleave', dockReset);

    // Keep the on-screen caption correct if the shape ever changes some other way
    if (shapeNameEl) {
      const activeBtn = shapeIcons.find(b => b.classList.contains('is-active')) || shapeIcons[0];
      if (activeBtn) shapeNameEl.textContent = activeBtn.getAttribute('aria-label') || activeBtn.dataset.shape;
    }

    function toInches(value, unit) {
      switch (unit) {
        case 'cm': return value / 2.54;
        case 'm':  return (value * 100) / 2.54;
        case 'mm': return (value / 10) / 2.54;
        case 'ft': return value * 12;
        case 'yd': return value * 36;
        default:   return value; // in
      }
    }

    function toFeet(value, unit) {
      switch (unit) {
        case 'cm': return (value / 2.54) / 12;
        case 'm':  return ((value * 100) / 2.54) / 12;
        case 'mm': return ((value / 10) / 2.54) / 12;
        case 'in': return value / 12;
        case 'yd': return value * 3;
        default:   return value; // ft
      }
    }

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
      resultsBox.style.display = 'none';
    }

    function clearError() {
      errorBox.style.display = 'none';
    }

    function calculate() {
      clearError();
      const shape = shapeSelect.value;
      const cfg = LABELS[shape];

      const p1 = parseFloat(param1.value);
      const p2 = cfg.l2 ? parseFloat(param2.value) : 0;
      const p3 = parseFloat(param3.value);
      const qty = parseFloat(qtyInput.value) || 1;

      if (isNaN(p1) || isNaN(p3) || (cfg.l2 && isNaN(p2))) {
        showError('Please fill in all required dimension fields.');
        return;
      }

      const unit1 = document.getElementById('calcUnit1').value;
      const unit2 = document.getElementById('calcUnit2').value;
      const unit3 = document.getElementById('calcUnit3').value;

      const convert = parseFloat(materialSelect.options[materialSelect.selectedIndex].dataset.factor) || 1;

      let d1 = toInches(p1, unit1);
      let d2 = cfg.l2 ? toInches(p2, unit2) : 0;
      let lengthFt = toFeet(p3, unit3);
      let weight;

      switch (shape) {
        case 'Round':
          weight = 2.6729 * d1 * d1 * convert * lengthFt * qty;
          break;
        case 'Square':
          weight = 3.4032 * d1 * d1 * convert * lengthFt * qty;
          break;
        case 'Hexagonal':
          weight = 2.9473 * d1 * d1 * convert * lengthFt * qty;
          break;
        case 'Octagonal':
          weight = 2.8193 * d1 * d1 * convert * lengthFt * qty;
          break;
        case 'Sheet':
        case 'Plate':
        case 'Rectangle':
          weight = 3.4032 * d1 * convert * d2 * lengthFt * qty;
          break;
        case 'Tubular':
        case 'Pipe':
          weight = 10.68 * (d1 - d2) * convert * d2 * lengthFt * qty;
          if (weight < 0) {
            showError('Wall thickness cannot exceed the Outer Diameter.');
            return;
          }
          break;
        case 'Ring': {
          const thicknessIn = toInches(p3, unit3); // Ring's 3rd field is Thickness, used directly in inches
          weight = 0.22274 * thicknessIn * (d1 * d1 - d2 * d2) * convert * qty;
          if (weight < 0) {
            showError('Inner Diameter cannot exceed the Outer Diameter.');
            return;
          }
          break;
        }
      }

      const lbs = weight;
      const kg = weight * 0.453592;

      resultLbs.textContent = lbs.toFixed(2);
      resultKg.textContent = kg.toFixed(2);
      resultsBox.style.display = 'flex';
      const shortDesc = cfg.l2
        ? `${shape} · ${p1}${unit1}×${p2}${unit2}×${p3}${unit3} · Qty ${qty}`
        : `${shape} · ${p1}${unit1} × ${p3}${unit3} · Qty ${qty}`;
      addToHistory(shortDesc, lbs, kg);
    }

    function clearForm() {
      param1.value = '';
      param2.value = '';
      param3.value = '';
      qtyInput.value = '1';
      resultsBox.style.display = 'none';
      clearError();
    }
  function saveHistory() {
      localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
    }

    function renderHistory() {
      if (!calcHistory.length) {
        historyBox.style.display = 'none';
        return;
      }
      historyBox.style.display = 'flex';
      historyList.innerHTML = calcHistory.map(item => `
    <div class="calc-history-row" data-id="${item.id}">
      <span class="calc-history-desc">${item.desc}</span>
      <span class="calc-history-weight">${item.kg.toFixed(2)} kg</span>
      <button type="button" class="calc-history-remove" data-remove-id="${item.id}" aria-label="Remove">&times;</button>
    </div>
  `).join('');

  historyList.querySelectorAll('.calc-history-remove').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.removeId;
      calcHistory = calcHistory.filter(i => String(i.id) !== id);
      saveHistory();
      renderHistory();
    };
  });

      const totalLbs = calcHistory.reduce((s, i) => s + i.lbs, 0);
      const totalKg  = calcHistory.reduce((s, i) => s + i.kg, 0);
      totalLbsEl.textContent = totalLbs.toFixed(2);
      totalKgEl.textContent  = totalKg.toFixed(2);
    }

    function addToHistory(desc, lbs, kg) {
      calcHistory.push({ id: Date.now() + Math.random(), desc, lbs, kg });
      saveHistory();
      renderHistory();
    }

    historyClearBtn.addEventListener('click', () => {
      historyConfirm.style.display = 'flex';
    });
    historyConfirmNo.addEventListener('click', () => {
      historyConfirm.style.display = 'none';
    });
   historyConfirmYes.addEventListener('click', () => {
      calcHistory = [];
      saveHistory();
      renderHistory();
      historyConfirm.style.display = 'none';
    });

  const pdfBtn = document.getElementById('calcHistoryPdfBtn');

    // Fixed company details — no settings panel, no gear button.
    // Logo path is set here manually (point this at your logo file).
    const COMPANY_INFO = {
      name: 'MURTAZA CORPORATION',
      phone: '+92 (21) 35141451',
      email: 'sales@murtazacorporation.com.pk',
      location: '516/517, Sector 6-A, Mehran Town, Korangi Industrial Area, Karachi - 74900, Pakistan',
      logoPath: 'Logos/company.png'
    };

    // Loads the logo image from disk and converts it to a data URL jsPDF can embed.
    function loadLogoAsDataURL(path) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = path;
      });
    }

    async function exportHistoryToPDF() {
      if (!calcHistory.length) return;

      await ensureJsPDF();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ---- Logo, fixed at the top-left every time ----
      const logoData = await loadLogoAsDataURL(COMPANY_INFO.logoPath);
      if (logoData) {
        doc.addImage(logoData, 'PNG', 20, 15, 32, 16);
      }

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 58, 168);
      doc.text('Weight Calculation', pageWidth / 2, 22, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      // ---- Items table ----
      const rows = calcHistory.map(item => [
        item.desc,
        item.lbs.toFixed(2) + ' lbs',
        item.kg.toFixed(2) + ' kg'
      ]);

      const totalLbs = calcHistory.reduce((s, i) => s + i.lbs, 0);
      const totalKg  = calcHistory.reduce((s, i) => s + i.kg, 0);

      doc.autoTable({
        startY: 42,
        head: [['Item', 'Weight (lbs)', 'Weight (kg)']],
        body: rows,
        foot: [['Total', totalLbs.toFixed(2) + ' lbs', totalKg.toFixed(2) + ' kg']],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 168] },
        footStyles: { fillColor: [244, 246, 251], textColor: [30, 58, 168], fontStyle: 'bold' }
      });

      // ---- Footer, fixed near the bottom of the page ----
      // Company name is centered; location and contact details are right-aligned.
      const footerY = pageHeight - 25;
      const rightEdge = pageWidth - 20;

      doc.setDrawColor(220, 220, 220);
      doc.line(20, footerY - 6, rightEdge, footerY - 6);

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 58, 168);
      doc.text(COMPANY_INFO.name, pageWidth / 2, footerY, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(90, 90, 90);
     doc.text(COMPANY_INFO.location, rightEdge, footerY + 5, { align: 'right' });
      doc.text(`${COMPANY_INFO.email}   |   ${COMPANY_INFO.phone}`, rightEdge, footerY + 10, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      // Standards verification note, bottom-right corner
      doc.setFontSize(7);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(140, 140, 140);
      doc.text('Weights calculated per standard imperial steel weight formulas.', rightEdge, pageHeight - 10, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      doc.save('weight-calculation.pdf');
    }

    pdfBtn.addEventListener('click', exportHistoryToPDF);
    renderHistory();
    calcBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearForm);
  })();
  }

  function boot() {
    injectStyles();
    injectMarkup();
    initCalculator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
