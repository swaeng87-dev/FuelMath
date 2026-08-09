/* =============================================================
   FUELMATH — MASTER CALCULATION ENGINE (Tools 1–50)
   Every tool is registered with FuelMath.register(name, fn).
   The engine auto-binds all <input>/<select> inside the
   [data-tool="name"] wrapper and recalculates on change.

   HTML convention per tool:
     <div data-tool="scm-to-kg">
        <input data-field="volume" ...>
        <span  data-result="mass"></span>
     </div>
   ============================================================= */
(function () {
  'use strict';

  /* ---------- Core helpers ---------- */
  function fmt(n, d) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    d = (d === undefined) ? 2 : d;
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: d, maximumFractionDigits: d
    });
  }

  function registerTool(name, compute) {
    var root = document.querySelector('[data-tool="' + name + '"]');
    if (!root) return; // not on this page — skip safely

    function run() {
      var get = {
        num: function (f, fb) {
          var el = root.querySelector('[data-field="' + f + '"]');
          if (!el) return fb === undefined ? 0 : fb;
          var v = parseFloat(el.value);
          return isNaN(v) ? (fb === undefined ? 0 : fb) : v;
        },
        val: function (f, fb) {
          var el = root.querySelector('[data-field="' + f + '"]');
          return el ? el.value : (fb === undefined ? '' : fb);
        }
      };
      var set = function (f, value, d, suffix) {
        var el = root.querySelector('[data-result="' + f + '"]');
        if (!el) return;
        el.textContent = (typeof value === 'number')
          ? fmt(value, d) + (suffix || '')
          : value;
      };
      try { compute(get, set); }
      catch (e) { if (window.console) console.warn('[FuelMath] ' + name + ':', e); }
    }

    root.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('input', run);
      el.addEventListener('change', run);
    });
    run(); // initial calculation
  }

  window.FuelMath = { register: registerTool, fmt: fmt };

  /* ---------- Shared physical constants ---------- */
  var R = 8.314462618;      // J/(mol·K)
  var SCM_TO_SCF = 35.3147; // 1 SCM = 35.3147 SCF
  var DEG_R = 459.67;       // °F -> °R offset
  var K_OFFSET = 273.15;    // °C -> K offset

  /* =============================================================
     GROUP 1 — NATURAL GAS, LNG & PIPELINE ENGINEERING
     ============================================================= */

  /* 1. SCM to kg  (ISO 13443) */
  registerTool('scm-to-kg', function (get, set) {
    var vol = get.num('volume');
    var density = get.num('density', 0.717);
    var mass = vol * density;
    set('mass', mass, 3, ' kg');
    set('tonnes', mass / 1000, 4, ' MT');
  });

  /* 2. MMBtu to SCM billing  (ISO 6976) */
  registerTool('mmbtu-to-scm', function (get, set) {
    var energy = get.num('energy');
    var unit = get.val('unit', 'mmbtu');
    var gcvSCF = get.num('gcv', 1000); // BTU per SCF
    var btu = unit === 'mmbtu' ? energy * 1e6
            : unit === 'therm' ? energy * 1e5
            : energy * 947817; // GJ
    var scf = gcvSCF > 0 ? btu / gcvSCF : 0;
    var scm = scf / SCM_TO_SCF;
    set('scf', scf, 0, ' SCF');
    set('scm', scm, 2, ' SCM');
  });

  /* 3. MT of LNG to SCM / MMSCMD  (GIIGNL / ISO 10976) */
  registerTool('mt-lng-to-scm', function (get, set) {
    var mt = get.num('mass');
    var factor = get.num('factor', 1380); // SCM per MT
    var scm = mt * factor;
    set('scm', scm, 0, ' SCM');
    set('mmscmd', scm / 1e6, 5, ' MMSCM/day');
    set('scf', scm * SCM_TO_SCF, 0, ' SCF');
  });

  /* 4. Weymouth & Panhandle pipeline flow  (AGA) */
  registerTool('weymouth-panhandle', function (get, set) {
    var model = get.val('model', 'weymouth');
    var P1 = get.num('p1'), P2 = get.num('p2');       // psia
    var D = get.num('diameter'), L = get.num('length'); // in, miles
    var S = get.num('gravity', 0.6);
    var Tf = get.num('temp', 60) + DEG_R;             // °R
    var Z = get.num('zfactor', 1.0);
    var E = get.num('efficiency', 0.92);
    var Tb = 520, Pb = 14.7;
    var dp2 = P1 * P1 - P2 * P2;
    if (dp2 <= 0 || D <= 0 || L <= 0) { set('flow', '—'); set('flowMMSCFD', '—'); return; }
    var Q;
    if (model === 'panhandleA') {
      Q = 435.87 * E * Math.pow(Tb / Pb, 1.0788) *
          Math.pow(dp2 / (Math.pow(S, 0.8539) * Tf * L * Z), 0.5394) * Math.pow(D, 2.6182);
    } else if (model === 'panhandleB') {
      Q = 737 * E * Math.pow(Tb / Pb, 1.02) *
          Math.pow(dp2 / (Math.pow(S, 0.961) * Tf * L * Z), 0.51) * Math.pow(D, 2.53);
    } else { // Weymouth
      Q = 433.5 * (Tb / Pb) * Math.sqrt((dp2 * Math.pow(D, 16 / 3)) / (S * Tf * L * Z));
    }
    set('flow', Q, 0, ' SCFD');
    set('flowMMSCFD', Q / 1e6, 4, ' MMSCFD');
    set('flowSCMS', Q / 86400 / SCM_TO_SCF, 3, ' SCM/s');
  });

  /* 5. Pipeline linepack storage */
  registerTool('pipeline-linepack', function (get, set) {
    var P1 = get.num('p1'), P2 = get.num('p2');   // bar absolute
    var Vgeo = get.num('volume');                 // m³ geometric
    var T = get.num('temp', 15) + K_OFFSET;
    var Z = get.num('zfactor', 1.0);
    var Pb = 1.01325, Tb = 288.15;
    if (P1 <= 0 || P2 <= 0 || Vgeo <= 0) { set('pavg', '—'); set('linepack', '—'); return; }
    var Pavg = (2 / 3) * (P1 + P2 - (P1 * P2) / (P1 + P2));
    var Vstd = Vgeo * (Pavg / Pb) * (Tb / T) * (1 / Z);
    set('pavg', Pavg, 3, ' bar');
    set('linepack', Vstd, 0, ' SCM');
    set('mmscm', Vstd / 1e6, 5, ' MMSCM');
  });

  /* 6. Wobbe Index  (ISO 6976 / EN 437) */
  registerTool('wobbe-index', function (get, set) {
    var hv = get.num('heatingValue');
    var sg = get.num('gravity', 0.6);
    var wi = sg > 0 ? hv / Math.sqrt(sg) : 0;
    set('wobbe', wi, 2, ' MJ/m³');
  });

  /* 7. Z-Factor via Dranchuk–Abu–Kassem  (AGA-8 / ISO 12213) */
  registerTool('compressibility-z-factor', function (get, set) {
    var P = get.num('pressure');            // psia
    var T = get.num('temperature');         // °F
    var sg = get.num('gravity', 0.65);
    if (P <= 0 || sg <= 0) { set('z', '—'); return; }
    var Tpc = 169.2 + 349.5 * sg - 74.0 * sg * sg;   // °R (Sutton)
    var Ppc = 756.8 - 131.0 * sg - 3.75 * sg * sg;   // psia
    var Tr = (T + DEG_R) / Tpc, Pr = P / Ppc;
    var A = [0.3265, -1.0700, -0.5339, 0.01569, -0.05165,
             0.5475, -0.7361, 0.1844, 0.1056, 0.6134, 0.7210];
    function dakZ(rho) {
      var t1 = A[0] + A[1]/Tr + A[2]/Math.pow(Tr,3) + A[3]/Math.pow(Tr,4) + A[4]/Math.pow(Tr,5);
      var t2 = A[5] + A[6]/Tr + A[7]/(Tr*Tr);
      var t3 = A[8] * (A[6]/Tr + A[7]/(Tr*Tr));
      var t4 = A[9] * (1 + A[10]*rho*rho) * (rho*rho/Math.pow(Tr,3)) * Math.exp(-A[10]*rho*rho);
      return 1 + t1*rho + t2*rho*rho - t3*Math.pow(rho,5) + t4;
    }
    var Z = 1.0;
    for (var i = 0; i < 200; i++) {
      var rho = 0.27 * Pr / (Z * Tr);
      var Zn = dakZ(rho);
      if (Math.abs(Zn - Z) < 1e-9) { Z = Zn; break; }
      Z = Zn;
    }
    set('z', Z, 5);
    set('tr', Tr, 4);
    set('pr', Pr, 4);
  });

  /* 8. LNG boil-off gas (BOG) estimator */
  registerTool('lng-bog-loss', function (get, set) {
    var cap = get.num('capacity');           // m³ liquid
    var bor = get.num('rate', 0.07);         // % per day
    var liqD = get.num('liquidDensity', 450);// kg/m³
    var gasD = get.num('gasDensity', 0.717); // kg/m³
    var liqLoss = cap * (bor / 100);         // m³/day
    var massLoss = liqLoss * liqD;           // kg/day
    var gasVol = gasD > 0 ? massLoss / gasD : 0;
    set('liquid', liqLoss, 3, ' m³/day');
    set('mass', massLoss, 2, ' kg/day');
    set('gas', gasVol, 0, ' SCM/day');
  });

  /* 9. CNG dispenser cascading  (NGV2 / NFPA 52) — simplified isothermal */
  registerTool('cng-dispenser-cascading', function (get, set) {
    var banks = [
      { P: get.num('lowP'),  V: get.num('lowV') },
      { P: get.num('medP'),  V: get.num('medV') },
      { P: get.num('highP'), V: get.num('highV') }
    ];
    var vehV = get.num('vehVolume');
    var startP = get.num('vehStartP');
    var targetP = get.num('vehTargetP');
    var T = get.num('temp', 20) + K_OFFSET;
    var M = get.num('molar', 16.04) / 1000;  // kg/mol
    var Z = get.num('zfactor', 0.9);
    if (vehV <= 0) { set('massKg', '—'); set('efficiency', '—'); return; }
    var vehP = startP, withdrawn = 0;
    for (var i = 0; i < banks.length; i++) {
      if (vehP >= targetP) break;
      var b = banks[i];
      if (b.P <= vehP) continue;
      var eq = (b.P * b.V + vehP * vehV) / (b.V + vehV);
      if (eq > targetP) eq = targetP;
      withdrawn += b.V * (b.P - eq);
      vehP = eq;
    }
    var delivered = vehV * (vehP - startP);         // bar·L
    var massKg = (delivered * 100) * M / (Z * R * T); // Pa·m³ -> kg
    var eff = withdrawn > 0 ? (delivered / withdrawn) * 100 : 0;
    set('massKg', massKg, 3, ' kg');
    set('finalP', vehP, 1, ' bar');
    set('efficiency', eff, 1, ' %');
  });

  /* 10. CNG/LPG cylinder fill via real gas law */
  registerTool('cng-lpg-pvt-cylinder', function (get, set) {
    var P = get.num('pressure') * 1e5;      // bar -> Pa
    var T = get.num('temp', 20) + K_OFFSET;
    var V = get.num('capacity') / 1000;     // L -> m³ (water capacity)
    var M = get.num('molar', 16.04) / 1000; // kg/mol
    var Z = get.num('zfactor', 0.9);
    var m = (P * V * M) / (Z * R * T);
    set('mass', m, 3, ' kg');
  });

  /* =============================================================
     GROUP 2 — INDUSTRIAL FUEL SWITCHING & COMMERCIAL ENERGY
     ============================================================= */

  /* 11. PNG vs LPG cost comparison */
  registerTool('png-vs-lpg', function (get, set) {
    var lpgKg = get.num('lpgUse');
    var lpgPrice = get.num('lpgPrice');
    var pngPrice = get.num('pngPrice');
    var lpgGCV = get.num('lpgGCV', 46.1);   // MJ/kg
    var pngGCV = get.num('pngGCV', 38.0);   // MJ/SCM
    var effL = get.num('lpgEff', 0.85), effP = get.num('pngEff', 0.85);
    var capex = get.num('conversionCost');
    var energy = lpgKg * lpgGCV * effL;
    var pngVol = (effP * pngGCV) > 0 ? energy / (effP * pngGCV) : 0;
    var costL = lpgKg * lpgPrice, costP = pngVol * pngPrice;
    var save = costL - costP;
    set('pngVolume', pngVol, 1, ' SCM');
    set('costLPG', costL, 2);
    set('costPNG', costP, 2);
    set('savings', save, 2);
    set('payback', save > 0 ? capex / save : 0, 1, ' months');
  });

  /* 12. LNG-to-PNG virtual pipeline savings */
  registerTool('lng-to-png-savings', function (get, set) {
    var cons = get.num('consumption');        // MMBtu/month
    var lngP = get.num('lngPrice');           // $/MMBtu
    var truck = get.num('trucking');          // $/MMBtu
    var regas = get.num('regas');             // $/MMBtu
    var pngP = get.num('pngPrice');           // $/MMBtu
    var lngTotal = lngP + truck + regas;
    var diff = lngTotal - pngP;
    set('lngTotal', lngTotal, 2, ' $/MMBtu');
    set('costLNG', cons * lngTotal, 0);
    set('costPNG', cons * pngP, 0);
    set('savings', cons * diff, 0);
  });

  /* 13. Solid fuel to gas equivalency  (ASTM D5865) */
  registerTool('solid-fuel-to-gas', function (get, set) {
    var mass = get.num('solidMass');          // kg
    var solidGCV = get.num('solidGCV', 17);   // MJ/kg
    var gasGCV = get.num('gasGCV', 38);       // MJ/SCM
    var effS = get.num('solidEff', 0.75), effG = get.num('gasEff', 0.85);
    var solidPrice = get.num('solidPrice'), gasPrice = get.num('gasPrice');
    var energy = mass * solidGCV * effS;
    var gasVol = (effG * gasGCV) > 0 ? energy / (effG * gasGCV) : 0;
    set('gasVolume', gasVol, 1, ' SCM');
    set('costSolid', mass * solidPrice, 2);
    set('costGas', gasVol * gasPrice, 2);
  });

  /* 14. Industrial boiler fuel conversion  (ASME PTC 4) */
  registerTool('boiler-conversion', function (get, set) {
    var duty = get.num('steamDuty');          // kW thermal
    var hours = get.num('hours', 24);
    var gcv = get.num('gcv');                 // MJ per unit
    var eff = get.num('efficiency', 0.85);
    var price = get.num('price');
    var energyMJ = duty * 3.6 * hours;        // kW·h -> MJ
    var fuel = (gcv * eff) > 0 ? energyMJ / (gcv * eff) : 0;
    set('fuelUse', fuel, 2);
    set('cost', fuel * price, 2);
  });

  /* 15. Price-per-energy unit converter  (IEA) */
  registerTool('price-per-energy', function (get, set) {
    var price = get.num('price');
    var energyMJ = get.num('energyDensity');  // MJ per purchased unit
    if (energyMJ <= 0) { set('perMMBtu', '—'); return; }
    var perMJ = price / energyMJ;
    set('perMMBtu', perMJ * 1055.06, 3, ' $/MMBtu');
    set('perGJ', perMJ * 1000, 3, ' $/GJ');
    set('perKWh', perMJ * 3.6, 4, ' $/kWh');
    set('perGcal', perMJ * 4186.8, 2, ' /Gcal');
  });

  /* 16. GCV / NCV converter  (ASTM D240 / ISO 1928) */
  registerTool('gcv-ncv-converter', function (get, set) {
    var gcv = get.num('gcv');              // kcal/kg or MJ/kg (consistent)
    var h = get.num('hydrogen', 5);        // % by mass
    var m = get.num('moisture', 0);        // % by mass
    var latent = get.num('latent', 587);   // kcal/kg (use 2.456 if MJ)
    var ncv = gcv - (9 * h / 100 + m / 100) * latent;
    set('ncv', ncv, 2);
  });

  /* 17. DG set electricity cost  (ISO 8528) */
  registerTool('dg-set-power-cost', function (get, set) {
    var dieselPrice = get.num('dieselPrice');
    var sfc = get.num('sfc', 0.25);        // L per kWh
    var om = get.num('om', 0.5);           // fixed O&M per kWh
    var fuelCost = dieselPrice * sfc;
    set('fuelCost', fuelCost, 3, ' /kWh');
    set('totalCost', fuelCost + om, 3, ' /kWh');
  });

  /* 18. Solar-to-diesel displacement */
  registerTool('solar-to-dg-displacement', function (get, set) {
    var kw = get.num('capacity');
    var sun = get.num('sunHours', 4.5);
    var pr = get.num('performance', 0.78);
    var sfc = get.num('sfc', 0.25);        // L/kWh
    var dieselPrice = get.num('dieselPrice');
    var capex = get.num('capex');
    var kwhDay = kw * sun * pr;
    var dieselDay = kwhDay * sfc;
    var saveDay = dieselDay * dieselPrice;
    var saveYear = saveDay * 365;
    set('kwhDay', kwhDay, 1, ' kWh/day');
    set('dieselDay', dieselDay, 2, ' L/day');
    set('saveYear', saveYear, 0);
    set('payback', saveYear > 0 ? capex / saveYear : 0, 1, ' years');
  });

  /* =============================================================
     GROUP 3 — PETROLEUM LIQUIDS, DENSITY & ASTM STANDARDS
     ============================================================= */

  /* 19. ASTM D1250 density/API corrector */
  registerTool('astm-d1250-density', function (get, set) {
    var rhoT = get.num('density');         // kg/m³ at observed T
    var T = get.num('temp');               // °C observed
    var alpha = get.num('expansion', 0.0008); // 1/°C volumetric coeff
    var rho15 = rhoT * (1 + alpha * (T - 15));
    var sg = rho15 / 999.0;
    var api = sg > 0 ? (141.5 / sg) - 131.5 : 0;
    set('density15', rho15, 2, ' kg/m³');
    set('api', api, 2, ' °API');
  });

  /* 20. Volume-to-mass with petroleum presets */
  registerTool('volume-to-mass-density', function (get, set) {
    var presets = { petrol: 740, diesel: 840, kerosene: 800, jeta1: 800, hfo: 950 };
    var preset = get.val('preset', 'custom');
    var density = preset === 'custom' ? get.num('density', 840) : presets[preset];
    var vol = get.num('volume');
    var unit = get.val('unit', 'litre');
    var m3 = unit === 'litre' ? vol / 1000
           : unit === 'gallon' ? vol * 0.00378541
           : vol;
    var kg = m3 * density;
    set('kg', kg, 2, ' kg');
    set('mt', kg / 1000, 4, ' MT');
  });

  /* 21. Viscosity unit converter  (ASTM D445 / ISO 3104) */
  registerTool('viscosity-converter', function (get, set) {
    var v = get.num('value');
    var from = get.val('from', 'cSt');
    var density = get.num('density', 0.84); // g/cm³
    // normalize to kinematic cSt
    var cSt;
    if (from === 'cSt') cSt = v;
    else if (from === 'cP') cSt = density > 0 ? v / density : 0;
    else if (from === 'm2s') cSt = v * 1e6;
    else if (from === 'Pas') cSt = density > 0 ? (v * 1000) / density : 0;
    else if (from === 'SSU') cSt = v > 100 ? 0.220 * v - 135 / v : 0.226 * v - 195 / v;
    var cP = cSt * density;
    set('cSt', cSt, 3, ' cSt');
    set('cP', cP, 3, ' cP');
    set('m2s', cSt / 1e6, 8, ' m²/s');
    set('Pas', cP / 1000, 6, ' Pa·s');
  });

  /* 22. Bulk storage dip-rod & evaporation  (API 2518) */
  registerTool('tank-evaporation-dip', function (get, set) {
    var shape = get.val('shape', 'vertical');
    var h = get.num('liquidHeight');
    var vol;
    if (shape === 'vertical') {
      var d = get.num('diameter');
      vol = Math.PI * Math.pow(d / 2, 2) * h;
    } else if (shape === 'horizontal') {
      var d2 = get.num('diameter'), L = get.num('length');
      var r = d2 / 2;
      var seg = r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(2 * r * h - h * h);
      vol = L * seg;
    } else { // rectangular
      vol = get.num('length') * get.num('width') * h;
    }
    var density = get.num('density', 840);
    var evapRate = get.num('evaporation', 0.02); // % of surface volume
    set('volume', vol, 2, ' m³');
    set('mass', vol * density, 0, ' kg');
    set('loss', vol * (evapRate / 100), 3, ' m³');
  });

  /* 23. Marine fuel ISO 8217 & CCAI */
  registerTool('marine-fuel-iso-8217', function (get, set) {
    var rho = get.num('density');      // kg/m³ at 15°C
    var nu = get.num('viscosity');     // cSt at 50°C
    if (rho <= 0 || nu <= 0) { set('ccai', '—'); return; }
    var ccai = rho - 140.7 - 15.6 * Math.log(nu) / Math.LN10;
    var grade = ccai < 820 ? 'Good ignition' : ccai <= 850 ? 'Acceptable' : 'Poor ignition risk';
    set('ccai', ccai, 1);
    set('grade', grade);
  });

  /* 24. Viscosity-temperature blending  (ASTM D341) */
  registerTool('fuel-viscosity-blending', function (get, set) {
    var n1 = get.num('v1'), t1 = get.num('t1') + K_OFFSET;
    var n2 = get.num('v2'), t2 = get.num('t2') + K_OFFSET;
    var target = get.num('target', 13);   // cSt at burner
    function W(n) { return Math.log(Math.log(n + 0.7)) / Math.LN10; }
    var lt1 = Math.log(t1) / Math.LN10, lt2 = Math.log(t2) / Math.LN10;
    if (lt1 === lt2 || n1 <= 0 || n2 <= 0) { set('preheat', '—'); return; }
    var B = (W(n1) - W(n2)) / (lt2 - lt1);
    var A = W(n1) + B * lt1;
    var lT = (A - W(target)) / B;
    var Tk = Math.pow(10, lT);
    set('preheat', Tk - K_OFFSET, 1, ' °C');
  });

  /* 25. Barrel-to-ton crude converter */
  registerTool('barrel-to-ton-crude', function (get, set) {
    var bbl = get.num('barrels');
    var api = get.num('api', 32);
    var sg = 141.5 / (api + 131.5);
    var density = sg * 999;               // kg/m³ at 15°C
    var tonnes = bbl * 158.987 * density / 1e6;
    set('density', density, 1, ' kg/m³');
    set('tonnes', tonnes, 3, ' MT');
  });

  /* =============================================================
     GROUP 4 — MOBILITY, FLEET & LOGISTICS MATH
     ============================================================= */

  /* 26. CNG vs petrol/diesel mileage savings */
  registerTool('cng-vs-petrol-mileage', function (get, set) {
    var km = get.num('monthlyKm');
    var pMil = get.num('petrolMileage'), cMil = get.num('cngMileage');
    var pPrice = get.num('petrolPrice'), cPrice = get.num('cngPrice');
    var kit = get.num('kitCost');
    var costP = pMil > 0 ? (km / pMil) * pPrice : 0;
    var costC = cMil > 0 ? (km / cMil) * cPrice : 0;
    var save = costP - costC;
    set('costPetrol', costP, 2);
    set('costCNG', costC, 2);
    set('savings', save, 2);
    set('payback', save > 0 ? kit / save : 0, 1, ' months');
  });

  /* 27. Trip fuel expense & toll matrix */
  registerTool('trip-fuel-toll-matrix', function (get, set) {
    var dist = get.num('distance');
    var mil = get.num('mileage');
    var price = get.num('fuelPrice');
    var penalty = get.num('payloadPenalty', 0); // %
    var tolls = get.num('tollCost');
    var effMil = mil * (1 - penalty / 100);
    var fuel = effMil > 0 ? dist / effMil : 0;
    var fuelCost = fuel * price;
    set('fuelNeeded', fuel, 2);
    set('fuelCost', fuelCost, 2);
    set('total', fuelCost + tolls, 2);
  });

  /* 28. Fuel cost per km / mile */
  registerTool('fuel-cost-per-km', function (get, set) {
    var price = get.num('fuelPrice');
    var kmpl = get.num('mileage'); // km per litre
    var perKm = kmpl > 0 ? price / kmpl : 0;
    set('perKm', perKm, 3);
    set('perMile', perKm * 1.60934, 3);
  });

  /* 29. Petrol vs diesel vs EV TCO */
  registerTool('petrol-diesel-ev-tco', function (get, set) {
    var years = get.num('years', 5);
    var annualKm = get.num('annualKm');
    function tco(capital, eff, unitCost, maint) {
      var energy = eff > 0 ? (annualKm / eff) * unitCost * years : 0;
      return capital + energy + maint * years;
    }
    var p = tco(get.num('pCapital'), get.num('pEff'), get.num('pPrice'), get.num('pMaint'));
    var d = tco(get.num('dCapital'), get.num('dEff'), get.num('dPrice'), get.num('dMaint'));
    var e = tco(get.num('eCapital'), get.num('eEff'), get.num('ePrice'), get.num('eMaint'));
    set('tcoPetrol', p, 0);
    set('tcoDiesel', d, 0);
    set('tcoEV', e, 0);
    var min = Math.min(p, d, e);
    set('best', min === p ? 'Petrol' : min === d ? 'Diesel' : 'Electric');
  });

  /* 30. Fleet route refueling optimizer (simplified) */
  registerTool('fleet-route-optimizer', function (get, set) {
    var fuelNeeded = get.num('fuelNeeded');
    var p1 = get.num('price1', Infinity), p2 = get.num('price2', Infinity);
    var p3 = get.num('price3', Infinity), p4 = get.num('price4', Infinity);
    var prices = [p1, p2, p3, p4].filter(function (x) { return isFinite(x) && x > 0; });
    if (!prices.length) { set('best', '—'); set('total', '—'); return; }
    var cheapest = Math.min.apply(null, prices);
    var idx = prices.indexOf(cheapest) + 1;
    set('best', 'Stop ' + idx + ' @ ' + fmt(cheapest, 2));
    set('total', cheapest * fuelNeeded, 2);
  });

  /* 31. Idling fuel burn  (EPA) */
  registerTool('idling-fuel-burn', function (get, set) {
    var hrs = get.num('hoursDay');
    var rate = get.num('burnRate', 0.8); // L/hr
    var price = get.num('fuelPrice');
    var days = get.num('daysMonth', 26);
    var day = hrs * rate;
    set('daily', day, 2, ' L');
    set('monthly', day * days, 1, ' L');
    set('costMonth', day * days * price, 2);
  });

  /* 32. Driver fuel performance grader */
  registerTool('driver-fuel-performance', function (get, set) {
    var target = get.num('targetMileage');
    var actual = get.num('actualMileage');
    var dist = get.num('distance');
    var price = get.num('fuelPrice');
    if (target <= 0 || actual <= 0) { set('grade', '—'); return; }
    var ratio = actual / target;
    var excess = dist / actual - dist / target;
    var penaltyCost = excess * price;
    var grade = ratio >= 1 ? 'A' : ratio >= 0.9 ? 'B' : ratio >= 0.8 ? 'C' : 'D';
    set('ratio', ratio * 100, 1, ' %');
    set('excessFuel', excess, 2, ' L');
    set('penalty', penaltyCost, 2);
    set('grade', grade);
  });

  /* 33. AdBlue / DEF dosing  (ISO 22241) */
  registerTool('adblue-def-dosing', function (get, set) {
    var diesel = get.num('dieselUse');       // L per period
    var rate = get.num('dosingRate', 4);     // % of diesel volume
    var defTank = get.num('defTank');        // L
    var defPrice = get.num('defPrice');
    var defUse = diesel * (rate / 100);
    var range = defUse > 0 ? (defTank / defUse) : 0; // in same periods as dieselUse
    set('defUse', defUse, 2, ' L');
    set('cost', defUse * defPrice, 2);
    set('refillEvery', range, 1);
  });

  /* 34. Tankful-to-tankful mileage audit */
  registerTool('tankful-mileage-checker', function (get, set) {
    var o1 = get.num('odoStart'), o2 = get.num('odoEnd');
    var litres = get.num('litres');
    var price = get.num('fuelPrice');
    var dash = get.num('dashboardMileage', 0);
    var dist = o2 - o1;
    var mil = litres > 0 ? dist / litres : 0;
    var disc = dash > 0 ? ((mil - dash) / dash) * 100 : 0;
    set('distance', dist, 0);
    set('mileage', mil, 2, ' km/L');
    set('costPerKm', dist > 0 ? (litres * price) / dist : 0, 3);
    set('discrepancy', disc, 1, ' %');
  });

  /* 35. Tyre pressure fuel loss  (US DOE) */
  registerTool('tyre-pressure-fuel-loss', function (get, set) {
    var under = get.num('underinflation');   // psi below spec
    var dist = get.num('distance');
    var mil = get.num('mileage');
    var price = get.num('fuelPrice');
    var penaltyPct = under * 0.2;            // ~0.2% per psi (DOE)
    var baseFuel = mil > 0 ? dist / mil : 0;
    var extra = baseFuel * (penaltyPct / 100);
    set('penalty', penaltyPct, 2, ' %');
    set('extraFuel', extra, 2, ' L');
    set('extraCost', extra * price, 2);
  });

  /* 36. AC vs non-AC consumption  (NREL) */
  registerTool('ac-fuel-consumption', function (get, set) {
    var dist = get.num('distance');
    var mil = get.num('mileage');
    var penalty = get.num('acPenalty', 10);  // %
    var price = get.num('fuelPrice');
    var base = mil > 0 ? dist / mil : 0;
    var withAC = base / (1 - penalty / 100);
    var extra = withAC - base;
    set('fuelNoAC', base, 2, ' L');
    set('fuelAC', withAC, 2, ' L');
    set('extraCost', extra * price, 2);
  });

  /* 37. Wrong-fuel flushing cost estimator */
  registerTool('wrong-fuel-flushing', function (get, set) {
    var labourHrs = get.num('labourHours', 3);
    var labourRate = get.num('labourRate');
    var parts = get.num('parts');
    var disposal = get.num('disposal', 50);
    var fuelLost = get.num('fuelVolume') * get.num('fuelPrice');
    var total = labourHrs * labourRate + parts + disposal + fuelLost;
    set('labour', labourHrs * labourRate, 2);
    set('total', total, 2);
  });

  /* 38. Fuel surcharge escalation */
  registerTool('fuel-surcharge-escalation', function (get, set) {
    var base = get.num('baseFuelPrice');
    var current = get.num('currentFuelPrice');
    var baseRate = get.num('baseFreightRate');
    var pass = get.num('passThrough', 100);  // % of fuel change passed on
    if (base <= 0) { set('fsc', '—'); return; }
    var change = (current - base) / base;
    var fsc = change * (pass / 100);
    set('fsc', fsc * 100, 2, ' %');
    set('newRate', baseRate * (1 + fsc), 2);
  });

  /* =============================================================
     GROUP 5 — BIOFUELS, BLENDING & ENGINE TUNING
     ============================================================= */

  /* 39. Ethanol blending (E10/E20/E85)  (ASTM D4806/D5798) */
  registerTool('ethanol-blending-e10-e20', function (get, set) {
    var blend = get.num('blend', 10);        // % ethanol
    var baseOct = get.num('baseOctane', 91);
    var ethOct = get.num('ethanolOctane', 109);
    var x = blend / 100;
    var oct = baseOct * (1 - x) + ethOct * x;
    var eGas = 34.2, eEth = 23.5;            // MJ/L
    var eBlend = eGas * (1 - x) + eEth * x;
    var econChange = ((eBlend / eGas) - 1) * 100;
    set('octane', oct, 1, ' RON');
    set('energy', eBlend, 2, ' MJ/L');
    set('economy', econChange, 1, ' %');
  });

  /* 40. Biodiesel blending (B5/B20)  (ASTM D6751 / EN 14214) */
  registerTool('biodiesel-blending-b5-b20', function (get, set) {
    var blend = get.num('blend', 20) / 100;
    var dCet = get.num('dieselCetane', 48), bCet = get.num('bioCetane', 52);
    var dDen = get.num('dieselDensity', 840), bDen = get.num('bioDensity', 880);
    var dVis = get.num('dieselVisc', 2.8), bVis = get.num('bioVisc', 4.6);
    set('cetane', dCet * (1 - blend) + bCet * blend, 1);
    set('density', dDen * (1 - blend) + bDen * blend, 1, ' kg/m³');
    set('viscosity', dVis * (1 - blend) + bVis * blend, 2, ' cSt');
  });

  /* 41. GGE / DGE converter  (NIST HB 44) */
  registerTool('gge-dge-converter', function (get, set) {
    var qty = get.num('quantity');
    var fuel = get.val('fuel', 'cng');
    // MJ content per unit, then GGE = qty*MJ / 121.3
    var MJ = {
      cng: 34.2 * qty,            // per SCM
      lng: 48.0 * qty,            // per kg approx (LNG mass basis)
      lpg: 25.7 * qty,            // per litre
      hydrogen: 120.0 * qty,      // per kg
      electricity: 3.6 * qty      // per kWh
    }[fuel] || 0;
    var gge = MJ / 121.3;
    set('gge', gge, 2, ' GGE');
    set('litres', gge * 3.785, 2, ' L gasoline eq.');
  });

  /* 42. Octane RON/MON/AKI  (ASTM D2699/D2700) */
  registerTool('octane-ron-mon-aki', function (get, set) {
    var mode = get.val('mode', 'ronmon');
    if (mode === 'ronmon') {
      var ron = get.num('ron'), mon = get.num('mon');
      set('aki', (ron + mon) / 2, 1, ' AKI');
      set('sensitivity', ron - mon, 1);
    } else {
      var aki = get.num('aki'), sens = get.num('sensitivity', 9);
      set('ron', aki + sens / 2, 1, ' RON');
      set('mon', aki - sens / 2, 1, ' MON');
    }
  });

  /* 43. Fuel injector flow & sizing */
  registerTool('fuel-injector-flow', function (get, set) {
    var hp = get.num('horsepower');
    var bsfc = get.num('bsfc', 0.5);     // lb/(hp·hr)
    var cyl = get.num('cylinders', 4);
    var duty = get.num('duty', 0.80);
    var density = get.num('density', 0.74); // g/cc
    var totalLb = hp * bsfc;
    var lbPerInj = cyl > 0 ? totalLb / (cyl * duty) : 0;
    var ccMin = (lbPerInj * 453.6) / (density * 60);
    set('lbhr', lbPerInj, 2, ' lb/hr');
    set('ccmin', ccMin, 1, ' cc/min');
  });

  /* 44. BSFC & thermal efficiency  (SAE J1349) */
  registerTool('bsfc-engine-efficiency', function (get, set) {
    var flow = get.num('fuelFlow');      // g/hr
    var power = get.num('power');        // kW
    var lhv = get.num('lhv', 43.0);      // MJ/kg
    var bsfc = power > 0 ? flow / power : 0; // g/kWh
    var eta = bsfc > 0 ? 3600 / (bsfc * lhv) : 0; // 3.6 MJ/kWh / (MJ/kWh)
    set('bsfc', bsfc, 1, ' g/kWh');
    set('efficiency', eta * 100, 2, ' %');
  });

  /* =============================================================
     GROUP 6 — TAX, PRICING & CARBON ACCOUNTING
     ============================================================= */

  /* 45. Fuel tax / VAT / excise breakdown */
  registerTool('tax-vat-excise-breakdown', function (get, set) {
    var base = get.num('basePrice');
    var freight = get.num('freight');
    var margin = get.num('margin');
    var excise = get.num('excise');
    var vat = get.num('vat', 20); // %
    var pre = base + freight + margin + excise;
    var vatAmt = pre * (vat / 100);
    var pump = pre + vatAmt;
    var taxTotal = excise + vatAmt;
    set('pump', pump, 2);
    set('vatAmount', vatAmt, 2);
    set('taxShare', pump > 0 ? (taxTotal / pump) * 100 : 0, 1, ' %');
  });

  /* 46. GCV price correction & settlement */
  registerTool('gcv-price-settlement', function (get, set) {
    var cPrice = get.num('contractPrice');
    var cGCV = get.num('contractGCV');
    var dGCV = get.num('deliveredGCV');
    var vol = get.num('volume');
    if (cGCV <= 0) { set('adjusted', '—'); return; }
    var adj = cPrice * (dGCV / cGCV);
    var delta = (adj - cPrice) * vol;
    set('adjusted', adj, 3);
    set('adjustment', delta, 2);
    set('direction', delta >= 0 ? 'Credit to seller' : 'Penalty to seller');
  });

  /* 47. Fuel combustion CO₂ emissions  (IPCC/EPA) */
  registerTool('fuel-co2-emissions', function (get, set) {
    var qty = get.num('quantity');
    var fuel = get.val('fuel', 'diesel');
    var factors = { // kg CO2 per unit
      diesel: { f: 2.68, u: 'L' }, petrol: { f: 2.31, u: 'L' },
      lpg: { f: 1.66, u: 'L' }, naturalgas: { f: 1.96, u: 'SCM' },
      fueloil: { f: 3.15, u: 'L' }, coal: { f: 2.42, u: 'kg' }
    };
    var e = factors[fuel] || factors.diesel;
    var co2 = qty * e.f;
    set('co2', co2, 2, ' kg CO₂');
    set('tonnes', co2 / 1000, 4, ' t CO₂');
  });

  /* 48. Methane leakage / venting  (IPCC AR6) */
  registerTool('methane-leakage-venting', function (get, set) {
    var qty = get.num('quantity');
    var unit = get.val('unit', 'kg');
    var horizon = get.val('horizon', '100');
    var gwp = horizon === '20' ? 82.5 : 29.8;
    var massKg = unit === 'scm' ? qty * 0.717 : qty;
    var co2e = massKg * gwp;
    set('massKg', massKg, 2, ' kg CH₄');
    set('co2e', co2e, 1, ' kg CO₂e');
    set('tonnes', co2e / 1000, 3, ' t CO₂e');
  });

  /* 49. Carbon tax exposure  (CBAM) */
  registerTool('carbon-tax-exposure', function (get, set) {
    var cons = get.num('consumption');
    var factor = get.num('emissionFactor');   // t CO2 per unit
    var bio = get.num('bioBlend', 0);         // %
    var rate = get.num('taxRate');            // $ per tonne
    var co2 = cons * factor * (1 - bio / 100);
    set('co2', co2, 2, ' t CO₂');
    set('tax', co2 * rate, 2);
    set('saved', cons * factor * (bio / 100) * rate, 2);
  });

  /* 50. Fuel price hike budget shock */
  registerTool('fuel-price-budget-shock', function (get, set) {
    var spend = get.num('currentSpend');
    var hike = get.num('priceHike');      // %
    var budget = get.num('monthlyBudget');
    var newSpend = spend * (1 + hike / 100);
    var inc = newSpend - spend;
    set('newSpend', newSpend, 2);
    set('increase', inc, 2);
    set('budgetShare', budget > 0 ? (newSpend / budget) * 100 : 0, 1, ' % of budget');
  });

})();
