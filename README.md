# ⛽ FuelMath.net — Hydrocarbon, Natural Gas & Fuel Calculators Engine

**50 specialized, precision calculators** for gas engineers, fuel traders, pipeline operators, and fleet logistics managers. Every computation executes **100% client-side** in the browser — zero server latency, zero data tracking, zero sign-ups.

🌐 **Live Site:** [https://fuelmath.net](https://fuelmath.net)

---

## ✨ Key Features

- 🧮 **50 Engineering Calculators** across 6 specialized domains
- ⚡ **Zero Latency** — pure client-side JavaScript, no backend, no APIs
- 📐 **Standards-Compliant** — formulas built on ISO, ASTM, AGA, API, SAE & IPCC references
- 🔒 **Privacy-First** — no cookies, no analytics, no data leaves the user's browser
- 📱 **Fully Responsive** — Tailwind CSS, mobile-first design
- 🚀 **Static Architecture** — GitHub Repository → Cloudflare Pages (no build step required)

---

## 🏗️ Architecture

```
GitHub Repository  ──(push)──▶  Cloudflare Pages  ──(deploy)──▶  fuelmath.net
        │
        ├── Pure HTML5
        ├── Tailwind CSS (CDN)
        └── Vanilla JavaScript (client-side math engines)
```

| Property | Value |
|---|---|
| **Domain** | fuelmath.net |
| **Type** | Static Web Engine |
| **Hosting** | Cloudflare Pages |
| **Source Control** | GitHub |
| **Execution** | Client-Side JavaScript |
| **Build Step** | None |
| **Total Tools** | 50 |

---

## 📁 Repository Structure

```
fuelmath/
├── index.html                  # Master directory + live search engine
├── README.md                   # This file
├── methodology.html            # Engineering methodology & standards
├── privacy.html                # Privacy policy
├── terms.html                  # Terms of use
├── sitemap.xml                 # SEO sitemap (51 URLs)
│
├── gas-engineering/            # CAT-01 · 10 tools
├── industrial-energy/          # CAT-02 · 8 tools
├── petroleum-standards/        # CAT-03 · 7 tools
├── mobility-logistics/         # CAT-04 · 13 tools
├── biofuels-blending/          # CAT-05 · 6 tools
└── tax-emissions/              # CAT-06 · 6 tools
```

---

## 🧮 Master Catalog

| Category ID | Category Name | Tools | Subdirectory |
|---|---|---|---|
| CAT-01 | Natural Gas, LNG & Pipeline Engineering | 10 | `/gas-engineering/` |
| CAT-02 | Industrial Fuel Switching & Commercial Energy | 8 | `/industrial-energy/` |
| CAT-03 | Petroleum Liquids, Density & ASTM Standards | 7 | `/petroleum-standards/` |
| CAT-04 | Mobility, Fleet & Logistics Math | 13 | `/mobility-logistics/` |
| CAT-05 | Biofuels, Blending & Engine Tuning | 6 | `/biofuels-blending/` |
| CAT-06 | Tax, Pricing & Carbon Accounting | 6 | `/tax-emissions/` |
| **TOTAL** | **Full Portal Catalog** | **50** | `/` |

---

## 🔬 Detailed Tool Specifications

### CAT-01 · Natural Gas, LNG & Pipeline Engineering (`/gas-engineering/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | SCM to kg Converter | `scm-to-kg.html` | ISO 13443 (15°C, 101.325 kPa) |
| 2 | MMBtu to SCM / Nm³ Gas Billing Converter | `mmbtu-to-scm.html` | ISO 6976 / Custody Transfer |
| 3 | MT of LNG to SCM / MMSCMD Converter | `mt-lng-to-scm.html` | GIIGNL / ISO 10976 |
| 4 | Weymouth & Panhandle Pipeline Flow Calculator | `weymouth-panhandle.html` | AGA Transmission Equations |
| 5 | Pipeline Linepack Storage Calculator | `pipeline-linepack.html` | Mean Pressure Integration |
| 6 | Wobbe Index (WI) & Gas Interchangeability Tool | `wobbe-index.html` | ISO 6976 / EN 437 |
| 7 | Real Gas Compressibility (Z-Factor) Calculator | `compressibility-z-factor.html` | AGA Report No. 8 / ISO 12213 |
| 8 | LNG Boil-Off Gas (BOG) & Tank Loss Estimator | `lng-bog-loss.html` | Cryogenic Heat Leak Modeling |
| 9 | CNG Dispenser Cascading Pressure Calculator | `cng-dispenser-cascading.html` | NGV2 / NFPA 52 |
| 10 | CNG/LPG Cylinder Fill Estimator (PVT) | `cng-lpg-pvt-cylinder.html` | Real Gas Law (m = PVM/ZRT) |

### CAT-02 · Industrial Fuel Switching & Commercial Energy (`/industrial-energy/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | PNG vs. LPG Industrial Cost Comparison | `png-vs-lpg.html` | Calorific Equivalency |
| 2 | LNG to PNG Virtual Pipeline Savings | `lng-to-png-savings.html` | Logistics & Regasification Factor |
| 3 | Solid Fuel (Coal/Petcoke) to Gas Equivalency | `solid-fuel-to-gas.html` | ASTM D5865 |
| 4 | Industrial Boiler Fuel Conversion & Efficiency | `boiler-conversion.html` | ASME PTC 4 |
| 5 | Price-per-Energy Unit Converter | `price-per-energy.html` | IEA Conversion Factors |
| 6 | Gross vs. Net Calorific Value (GCV/NCV) | `gcv-ncv-converter.html` | ASTM D240 / ISO 1928 |
| 7 | Diesel Back-up (DG Set) Power Cost Tool | `dg-set-power-cost.html` | ISO 8528 |
| 8 | Solar-to-Diesel Generator Displacement | `solar-to-dg-displacement.html` | Hybrid Microgrid Methodology |

### CAT-03 · Petroleum Liquids, Density & ASTM Standards (`/petroleum-standards/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | ASTM D1250 API Gravity & Density Corrector | `astm-d1250-density.html` | ASTM D1250 / API MPMS 11.1 |
| 2 | Volume-to-Mass Converter (Petroleum Presets) | `volume-to-mass-density.html` | Standard Density Tables |
| 3 | Viscosity Unit Converter w/ Density Correction | `viscosity-converter.html` | ASTM D445 / ISO 3104 |
| 4 | Bulk Storage Evaporation & Dip-Rod Matrix | `tank-evaporation-dip.html` | API Standard 2518 |
| 5 | Marine Fuel ISO 8217 & CCAI Checker | `marine-fuel-iso-8217.html` | ISO 8217 / CIMAC |
| 6 | Fuel Oil Viscosity-Temperature Blending | `fuel-viscosity-blending.html` | ASTM D341 |
| 7 | Barrel-to-Ton Crude Oil Converter | `barrel-to-ton-crude.html` | OPEC / BP Statistical Standards |

### CAT-04 · Mobility, Fleet & Logistics Math (`/mobility-logistics/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | CNG vs. Petrol / Diesel Mileage Expense | `cng-vs-petrol-mileage.html` | Fuel Economy Parity |
| 2 | Trip Fuel Expense & Toll Matrix | `trip-fuel-toll-matrix.html` | Route Logistics Matrix |
| 3 | Fuel Cost per Kilometer / Mile | `fuel-cost-per-km.html` | Fleet Expense Ratio |
| 4 | Petrol vs. Diesel vs. EV Break-Even & TCO | `petrol-diesel-ev-tco.html` | TCO Lifecycle Assessment |
| 5 | Multi-Drop Fleet Fuel Route Optimizer | `fleet-route-optimizer.html` | Fuel Routing Algorithm |
| 6 | Idling Fuel Burn & Expense Calculator | `idling-fuel-burn.html` | EPA Idling Guidelines |
| 7 | Driver Fuel Economy Performance Grader | `driver-fuel-performance.html` | Fleet Telematics Benchmark |
| 8 | AdBlue / DEF Dosing Rate & Range | `adblue-def-dosing.html` | ISO 22241 (AUS 32) |
| 9 | Tankful-to-Tankful Mileage Discrepancy | `tankful-mileage-checker.html` | Full-to-Full Audit |
| 10 | Tyre Pressure vs. Fuel Efficiency Loss | `tyre-pressure-fuel-loss.html` | US DOE Loss Coefficients |
| 11 | AC vs. Non-AC Fuel Consumption Impact | `ac-fuel-consumption.html` | NREL Aux Load Studies |
| 12 | Wrong Fuel Flushing Cost Estimator | `wrong-fuel-flushing.html` | Misfueling Diagnostic Protocols |
| 13 | Fuel Surcharge Formula Escalation | `fuel-surcharge-escalation.html` | FSC Indexing Models |

### CAT-05 · Biofuels, Blending & Engine Tuning (`/biofuels-blending/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | Ethanol Blending (E10, E20, E85) Impact | `ethanol-blending-e10-e20.html` | ASTM D4806 / D5798 |
| 2 | Biodiesel Blending (B5, B20) Density & Cetane | `biodiesel-blending-b5-b20.html` | ASTM D6751 / EN 14214 |
| 3 | GGE & DGE Energy Equivalent Converter | `gge-dge-converter.html` | NIST Handbook 44 |
| 4 | Octane Rating Converter (RON ⇄ MON ⇄ AKI) | `octane-ron-mon-aki.html` | ASTM D2699 / D2700 |
| 5 | Fuel Injector Flow Rate & Sizing | `fuel-injector-flow.html` | IC Fuel Delivery Sizing |
| 6 | BSFC & Engine Thermal Efficiency | `bsfc-engine-efficiency.html` | SAE J1349 |

### CAT-06 · Tax, Pricing & Carbon Accounting (`/tax-emissions/`)

| # | Tool | File | Reference Standard |
|---|---|---|---|
| 1 | Base Price vs. Excise & VAT Breakdown | `tax-vat-excise-breakdown.html` | Pricing Transparency Models |
| 2 | GCV Price Correction & Quality Settlement | `gcv-price-settlement.html` | GSPA Quality Formulas |
| 3 | Fuel Combustion CO₂ & GHG Emissions | `fuel-co2-emissions.html` | IPCC / EPA Factors |
| 4 | Methane Leakage, Venting & Flaring Impact | `methane-leakage-venting.html` | IPCC AR6 (GWP₁₀₀ = 29.8, GWP₂₀ = 82.5) |
| 5 | Biofuel / Carbon Tax Exposure | `carbon-tax-exposure.html` | CBAM / Carbon Pricing |
| 6 | Fuel Price Hike Monthly Budget Shock | `fuel-price-budget-shock.html` | Expenditure Elasticity Modeling |

---

## 💻 Local Development

No build tools, no package managers, no environment variables.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/fuelmath.git
cd fuelmath

# 2. Serve locally (any static server works)
python -m http.server 8000
# or
npx serve .

# 3. Open in browser
# http://localhost:8000
```

You can also simply double-click `index.html` — everything runs client-side.

---

## ☁️ Deployment — Cloudflare Pages

1. Push this repository to **GitHub**.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the `fuelmath` repository.
4. Configure build settings:
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` *(root)*
5. Click **Save and Deploy**.
6. Attach the custom domain `fuelmath.net` under **Custom Domains**.

Every `git push` to `main` triggers an automatic production deploy.

---

## ➕ Adding a New Tool

1. Create the tool page in the correct category subdirectory using kebab-case naming (e.g., `gas-engineering/new-tool.html`).
2. Add a `<a class="tool-card">` entry to the matching section in `index.html`.
3. Add the URL to `sitemap.xml`.
4. Document the formula, reference constants, and a worked example inside the tool page (E-E-A-T requirement).
5. Update the tool count in this README if the catalog total changes.

---

## 📐 Standards Compliance Index

ISO 13443 · ISO 6976 · ISO 10976 · ISO 12213 · ISO 22241 · ISO 8217 · ISO 8528 · ISO 1928 ·
ASTM D1250 · ASTM D240 · ASTM D341 · ASTM D445 · ASTM D2699 · ASTM D2700 · ASTM D4806 ·
ASTM D5798 · ASTM D5865 · ASTM D6751 · AGA Report No. 8 · API MPMS 11.1 · API 2518 ·
ASME PTC 4 · EN 437 · EN 14214 · SAE J1349 · NIST HB 44 · NFPA 52 · IPCC AR6 · EPA · NREL · US DOE

---

## ⚠️ Disclaimer

FuelMath.net calculators are engineered for **estimation, planning, and academic reference**. Critical industrial, custody-transfer, and safety operations must be cross-verified by licensed professional engineers against governing contracts and local regulations.

---

## 📄 License

© FuelMath.net — All rights reserved.

---

<div align="center">
  <sub>Built as a static, privacy-first engineering resource. GitHub → Cloudflare Pages.</sub>
</div>
