import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "outputs/01a13629-7710-7801-9bb3-608e5bde4bfa";
const wb = Workbook.create();
const draft = wb.worksheets.add("Submission Draft");
const inputs = wb.worksheets.add("Inputs & Links");
const evidence = wb.worksheets.add("Evidence Tracker");
const video = wb.worksheets.add("Demo Video");
const sources = wb.worksheets.add("Sources");

const navy = "#18332F";
const green = "#2F6B56";
const mint = "#DDEDE5";
const cream = "#F7F3E8";
const gold = "#D8A84E";
const paleGold = "#FFF2CC";
const paleRed = "#FCE8E6";
const paleBlue = "#EAF2F8";
const grey = "#66736F";
const border = "#CBD7D2";
const white = "#FFFFFF";

function title(sheet, name, subtitle, cols) {
  sheet.showGridLines = false;
  sheet.mergeCells(`A1:${cols}1`);
  sheet.getRange("A1").values = [[name]];
  sheet.getRange(`A1:${cols}1`).format = { fill: navy, font: { bold: true, color: white, size: 20 }, rowHeight: 34, verticalAlignment: "center" };
  sheet.mergeCells(`A2:${cols}2`);
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${cols}2`).format = { fill: mint, font: { color: navy, italic: true, size: 10 }, rowHeight: 30, wrapText: true, verticalAlignment: "center" };
}

function header(range) {
  range.format = { fill: green, font: { bold: true, color: white }, verticalAlignment: "center", wrapText: true, rowHeight: 30, borders: { preset: "all", style: "thin", color: border } };
}

function body(range) {
  range.format = { font: { color: navy, size: 10 }, verticalAlignment: "top", wrapText: true, borders: { preset: "all", style: "thin", color: border } };
}

title(draft, "Re:Source — Submission Draft", "Copy-ready content mapped to the competition template. Yellow cells require confirmation; blue cells need final evidence or links.", "G");
draft.getRange("A4:G4").values = [["Page", "Template section", "Draft content", "Evidence / asset", "Status", "Owner action", "Source"]];
header(draft.getRange("A4:G4"));
const draftRows = [
  [1, "Team details", "Team name: Recursive Mind\nTeam leader: [CONFIRM NAME]\nProblem statement: Useful renovation leftovers are often discarded because owners must manually describe uncertain materials, while finders cannot judge whether scattered listings meet a real project's dimensions, budget, condition and pickup constraints.", "Registration details", "INPUT NEEDED", "Confirm team leader and exact registered team name.", "SUBMISSION_CHECKLIST.md; RESOURCE_PLAN.md"],
  [2, "Download instructions", "Open the official template in Google Slides, choose File → Download → Microsoft PowerPoint (.pptx), edit the downloaded file, then export the final submission in the required portal format.", "Official template access", "VERIFY", "Confirm access and final upload format in the event dashboard.", "SUBMISSION_CHECKLIST.md"],
  [3, "Your idea", "Re:Source is an AI-assisted reuse marketplace for non-structural renovation leftovers. Owners upload a photo and confirm an AI-generated listing draft. Finders describe a project; Re:Source converts it into requirements, filters real inventory, performs deterministic quantity, area and price calculations, and explains what fits, what is missing and what to ask before pickup.", "Hero screenshot + one-line value proposition", "DRAFT READY", "Use the mosaic tabletop scenario as the opening example.", "COMPETITION_STRATEGY.md; RESOURCE_PLAN.md"],
  [4, "Opportunity, difference & USP", "Opportunity: usable leftovers are lost because supply is difficult to describe and demand is expressed as projects rather than product keywords.\nDifference: Re:Source connects a project brief to structured inventory using transparent calculations and explicit uncertainty.\nUSP: every recommendation cites confirmed listing facts, shows coverage and gaps, and keeps AI suggestions separate from owner-confirmed data.", "Before/after journey diagram", "DRAFT READY", "Avoid unsupported market-superiority claims.", "COMPETITION_STRATEGY.md; DESIGN.md"],
  [5, "Features", "Implemented in the prototype: guided project brief; structured inventory browsing; deterministic match, quantity, area and price calculations; evidence and uncertainty states; saved project plan; manual listing; simulated pickup; responsive desktop/mobile experience; clear AI availability and fallback states.\nPlanned for submission-grade live demo: Gemini photo-to-draft, brief-to-requirements and evidence-backed match explanation; Firebase persistence, anonymous authentication and App Check; public deployment.", "Feature screenshots; AI state screenshot", "PARTIAL", "Label implemented and planned features separately in the deck.", "PRODUCT.md; resource-app/README.md; DESIGN.md"],
  [6, "Process / use case", "Owner flow: photograph leftover → review AI suggestions → correct details → publish.\nFinder flow: describe project → review extracted requirements → inspect ranked matches → see calculations and uncertainty → save plan → simulate pickup.\nSignature demo: a renter needs a small mosaic tabletop; Re:Source identifies suitable tile leftovers, calculates coverage and cost, flags missing details and saves the plan.", "Two-lane user-flow diagram", "DRAFT READY", "Record the full owner and finder journeys.", "RESOURCE_PLAN.md; COMPETITION_STRATEGY.md"],
  [7, "Wireframes (optional)", "Use one early wireframe beside the final interface to show how the experience evolved from catalogue browsing into a guided conversation with progressive disclosure.", "Early wireframe + final UI", "OPTIONAL", "Add only if it strengthens the story and fits the page limit.", "DESIGN.md"],
  [8, "Architecture", "Target flow: React/Vite/shadcn UI → Firebase Hosting → anonymous Firebase Authentication + App Check → Firestore for listings/projects → Firebase AI Logic → Gemini Developer API. Client-side image resizing is used before AI analysis. Deterministic application code handles quantity, area and price calculations; AI produces structured suggestions and explanations. No Cloud Storage, Cloud Functions, Cloud Run or Vertex AI are planned under the no-billing constraint.", "Architecture diagram with trust boundaries", "DRAFT READY", "Verify Firebase project, model access and quotas before presenting as deployed.", "RESOURCE_PLAN.md"],
  [9, "Technology", "Frontend: React 19, TypeScript, Vite 8, Tailwind CSS and shadcn/ui.\nApp services planned: Firebase Hosting, Firestore, anonymous Authentication and App Check.\nAI planned: Firebase AI Logic with the Gemini Developer API.\nTesting: Vitest plus browser-based journey checks.\nDesign principle: AI proposes; users confirm; calculations remain deterministic.", "Technology logo strip", "DRAFT READY", "Update once the final deployment stack is confirmed.", "resource-app/package.json; RESOURCE_PLAN.md"],
  [10, "Implementation cost (optional)", "Prototype target: ₹0 paid usage. The proposed design uses unbilled Firebase Spark services and free-tier Gemini Developer API access through Firebase AI Logic. This is a design constraint, not a guarantee of capacity: model availability, quotas and event rules must be verified before submission.", "Simple cost table", "VERIFY", "Record actual hosting and AI usage after deployment.", "RESOURCE_PLAN.md"],
  [11, "Application snapshots", "Recommended snapshots: project brief conversation; extracted requirements; ranked matches with coverage and price; uncertainty / missing-information prompt; saved plan; photo-to-listing review; mobile view; AI unavailable fallback.", "Final screenshots", "EVIDENCE NEEDED", "Capture screenshots after live AI and deployment are stable.", "SUBMISSION_CHECKLIST.md; DESIGN.md"],
  [12, "Performance / benchmarking", "Verified engineering checks: production build passes; 6 matching tests pass; key owner and finder journeys were browser-checked; desktop and 390 px mobile layouts were visually inspected. Still required: task completion times, match relevance, unsupported-claim rate, AI latency, fallback success and security-rule tests. Do not report targets as measured results.", "Evidence table + test output", "PARTIAL", "Run the benchmark plan in the Evidence Tracker and capture dated results.", "resource-app/README.md; SUBMISSION_CHECKLIST.md"],
  [13, "Future", "Next steps: connect live Gemini calls; add Firebase persistence and security rules; pilot in one locality; improve condition and dimension confidence; add owner/finder feedback loops; measure successful reuse; expand only after validating non-structural-material safety and pickup reliability.", "Three-phase roadmap", "DRAFT READY", "Keep future claims distinct from current capability.", "RESOURCE_PLAN.md; PRODUCT.md"],
  [14, "Submission links", "Public GitHub repository: [ADD URL]\nThree-minute demo video: [ADD URL]\nFinal product: [ADD URL]", "Accessible public links", "INPUT NEEDED", "Add links and test them while signed out.", "SUBMISSION_CHECKLIST.md"],
];
draft.getRange(`A5:G${4 + draftRows.length}`).values = draftRows;
body(draft.getRange(`A5:G${4 + draftRows.length}`));
draft.getRange("A5:A18").format.horizontalAlignment = "center";
draft.getRange("E5:E18").format.font = { bold: true, color: navy };
draft.getRange("A5:G18").format.rowHeight = 82;
draft.getRange("A5:G18").conditionalFormats.add("containsText", { text: "INPUT NEEDED", format: { fill: paleGold, font: { color: "#7A5200", bold: true } } });
draft.getRange("A5:G18").conditionalFormats.add("containsText", { text: "EVIDENCE NEEDED", format: { fill: paleBlue, font: { color: "#1F4E78", bold: true } } });
draft.getRange("A5:G18").conditionalFormats.add("containsText", { text: "DRAFT READY", format: { fill: mint, font: { color: green, bold: true } } });
draft.freezePanes.freezeRows(4);
for (const [col, width] of [["A:A",7],["B:B",22],["C:C",66],["D:D",25],["E:E",16],["F:F",32],["G:G",26]]) draft.getRange(col).format.columnWidth = width;
draft.tabColor = green;

title(inputs, "Inputs & Links", "Complete the yellow cells. Status updates automatically; placeholders are intentionally not treated as finished.", "E");
inputs.getRange("A4:E4").values = [["Field", "Current value", "Required for", "Status", "Notes"]];
header(inputs.getRange("A4:E4"));
const inputRows = [
  ["Team name", "Recursive Mind", "Page 1", null, "Confirm this exactly matches registration."],
  ["Team leader", "", "Page 1", null, "Use the registered leader's full name."],
  ["Team members", "", "Portal / appendix", null, "Add names and roles if the portal requests them."],
  ["Competition problem statement", "", "Page 1", null, "Paste the official chosen problem statement if one exists."],
  ["Pilot locality", "Bengaluru (illustrative)", "Story / demo", null, "Confirm the actual locality or remove the city."],
  ["Firebase project ID", "", "Deployment", null, "Needed only after project creation."],
  ["Public GitHub URL", "", "Page 14", null, "Test while signed out."],
  ["Demo video URL", "", "Page 14", null, "Three minutes; test while signed out."],
  ["Final product URL", "", "Page 14", null, "Test on desktop and mobile while signed out."],
  ["Submission deadline", "Oct 18 — confirm dashboard", "Planning", null, "Transcript note is not enough; verify the event portal."],
  ["Final upload format", "", "Submission", null, "Confirm PPTX/PDF/link requirements in the portal."],
  ["Gemini model / quota verified", "", "Technical evidence", null, "Record model name, access route and observed quota."],
];
inputs.getRange(`A5:E${4 + inputRows.length}`).values = inputRows;
inputs.getRange("D5:D16").formulasR1C1 = Array.from({length:12}, () => ['=IF(RC[-2]="","MISSING",IF(ISNUMBER(SEARCH("confirm",RC[-2])),"VERIFY","READY"))']);
body(inputs.getRange("A5:E16"));
inputs.getRange("B5:B16").format.fill = paleGold;
inputs.getRange("D5:D16").format.font = { bold: true, color: navy };
inputs.getRange("D5:D16").conditionalFormats.add("containsText", { text: "MISSING", format: { fill: paleRed, font: { color: "#A61B1B", bold: true } } });
inputs.getRange("D5:D16").conditionalFormats.add("containsText", { text: "READY", format: { fill: mint, font: { color: green, bold: true } } });
inputs.getRange("D5:D16").conditionalFormats.add("containsText", { text: "VERIFY", format: { fill: paleGold, font: { color: "#7A5200", bold: true } } });
inputs.getRange("A18:B21").values = [["Readiness summary", "Count"], ["Ready", null], ["Missing", null], ["Verify", null]];
header(inputs.getRange("A18:B18"));
inputs.getRange("B19:B21").formulas = [["=COUNTIF(D5:D16,\"READY\")"],["=COUNTIF(D5:D16,\"MISSING\")"],["=COUNTIF(D5:D16,\"VERIFY\")"]];
body(inputs.getRange("A19:B21"));
for (const [col, width] of [["A:A",31],["B:B",34],["C:C",19],["D:D",13],["E:E",48]]) inputs.getRange(col).format.columnWidth = width;
inputs.getRange("A5:E16").format.rowHeight = 34;
inputs.freezePanes.freezeRows(4);
inputs.tabColor = gold;

title(evidence, "Evidence Tracker", "Only measured results belong in the final deck. Blank measured-value cells are deliberate work items.", "H");
evidence.getRange("A4:H4").values = [["Metric / check", "Definition", "Target / acceptance", "Measured value", "Unit", "Sample", "Status", "Method / evidence"]];
header(evidence.getRange("A4:H4"));
const evidenceRows = [
  ["Production build", "Final app compiles for production", "Pass", "Pass", "result", "latest local build", null, "resource-app README verification note"],
  ["Matching tests", "Automated matching tests passing", "6 of 6", 6, "tests passed", 6, null, "Vitest verification note"],
  ["Owner + finder journeys", "Key end-to-end flows browser-checked", "Pass", "Pass", "result", "2 journeys", null, "README verification note"],
  ["Responsive visual check", "Desktop and narrow mobile inspected", "Desktop + 390 px", "Pass", "result", "2 viewports", null, "DESIGN.md and README"],
  ["Listing completion time", "Median time from photo to confirmed draft", "≤ 60", "", "seconds", "≥ 5 attempts", null, "Screen recording / stopwatch"],
  ["Finder completion time", "Median time from brief to saved plan", "≤ 90", "", "seconds", "≥ 5 attempts", null, "Screen recording / stopwatch"],
  ["Match relevance", "Top recommendations judged useful", "≥ 80", "", "% useful", "≥ 10 briefs", null, "Human review rubric"],
  ["Unsupported claim rate", "AI claims not supported by listing fields", "0", "", "% claims", "≥ 30 claims", null, "Claim-to-field audit"],
  ["AI response latency", "Median end-to-end live AI response", "≤ 8", "", "seconds", "≥ 10 calls", null, "Browser timestamps"],
  ["Fallback success", "Task remains completable when AI is unavailable", "100", "", "% tasks", "3 failure scenarios", null, "Disable AI / force error"],
  ["Security-rule checks", "Unauthorized writes rejected", "Pass", "", "result", "required cases", null, "Firebase emulator or rules test"],
  ["Public link access", "Repo, video and product open while signed out", "3 of 3", "", "links", 3, null, "Incognito check"],
];
evidence.getRange("A5:H16").values = evidenceRows;
evidence.getRange("G5:G16").formulasR1C1 = Array.from({length:12}, () => ['=IF(RC[-3]="","MEASURE",IF(OR(RC[-3]="Pass",RC[-3]=RC[-1]),"VERIFIED","RECORDED"))']);
body(evidence.getRange("A5:H16"));
evidence.getRange("D5:D16").format.fill = paleBlue;
evidence.getRange("G5:G16").format.font = { bold: true, color: navy };
evidence.getRange("G5:G16").conditionalFormats.add("containsText", { text: "MEASURE", format: { fill: paleGold, font: { color: "#7A5200", bold: true } } });
evidence.getRange("G5:G16").conditionalFormats.add("containsText", { text: "VERIFIED", format: { fill: mint, font: { color: green, bold: true } } });
evidence.getRange("A18:B21").values = [["Evidence summary", "Count"], ["Verified", null], ["Recorded", null], ["Still to measure", null]];
header(evidence.getRange("A18:B18"));
evidence.getRange("B19:B21").formulas = [["=COUNTIF(G5:G16,\"VERIFIED\")"],["=COUNTIF(G5:G16,\"RECORDED\")"],["=COUNTIF(G5:G16,\"MEASURE\")"]];
body(evidence.getRange("A19:B21"));
for (const [col, width] of [["A:A",28],["B:B",38],["C:C",22],["D:D",18],["E:E",15],["F:F",19],["G:G",14],["H:H",34]]) evidence.getRange(col).format.columnWidth = width;
evidence.getRange("A5:H16").format.rowHeight = 42;
evidence.freezePanes.freezeRows(4);
evidence.tabColor = "#4F81BD";

title(video, "Three-Minute Demo Video", "A judge-friendly sequence that shows the problem, the complete experience, the AI role and measurable proof.", "G");
video.getRange("A4:G4").values = [["Segment", "Start (sec)", "End (sec)", "Duration", "On screen", "Voiceover point", "Asset status"]];
header(video.getRange("A4:G4"));
const videoRows = [
  ["Hook", 0, 15, null, "A box of leftover tiles beside the intended mosaic tabletop", "Useful material exists, but owners struggle to describe it and finders cannot tell whether it fits a real project.", "SCRIPT READY"],
  ["Product promise", 15, 30, null, "Re:Source home and project brief", "Re:Source turns scattered leftovers into a practical material plan.", "SCRIPT READY"],
  ["Finder journey", 30, 85, null, "Describe project → confirm requirements → see ranked matches", "The app translates intent into structured requirements, calculates coverage and price, and explains evidence and gaps.", "CAPTURE"],
  ["Owner journey", 85, 125, null, "Photo → AI draft → correction → publish", "AI reduces listing effort, while the owner remains responsible for confirming uncertain details.", "CAPTURE"],
  ["Trust & fallback", 125, 150, null, "Uncertainty prompt and AI-unavailable fallback", "Suggestions are separated from confirmed facts, and the task remains usable if AI fails.", "CAPTURE"],
  ["Architecture & proof", 150, 170, null, "Architecture diagram and evidence table", "Gemini handles structured suggestions and explanations; deterministic code handles quantity, area and price. Show real measured results only.", "EVIDENCE NEEDED"],
  ["Close", 170, 180, null, "Saved plan + value proposition + links", "Re:Source helps communities reuse more by making leftovers easier to offer and safer to choose.", "CAPTURE"],
];
video.getRange("A5:G11").values = videoRows;
video.getRange("D5:D11").formulasR1C1 = Array.from({length:7}, () => ["=RC[-1]-RC[-2]"]);
body(video.getRange("A5:G11"));
video.getRange("A13:C14").values = [["Timing check", "Value", "Result"],["Total duration", null, null]];
header(video.getRange("A13:C13"));
video.getRange("B14").formulas = [["=SUM(D5:D11)"]];
video.getRange("C14").formulas = [["=IF(B14=180,\"ON TIME\",\"ADJUST\")"]];
body(video.getRange("A14:C14"));
video.getRange("B5:D14").format.numberFormat = "0";
video.getRange("G5:G11").format.font = { bold: true, color: navy };
for (const [col, width] of [["A:A",22],["B:D",12],["E:E",38],["F:F",59],["G:G",18]]) video.getRange(col).format.columnWidth = width;
video.getRange("A5:G11").format.rowHeight = 48;
video.freezePanes.freezeRows(4);
video.tabColor = "#9B59B6";

title(sources, "Sources & Claim Boundaries", "Local project documents are the source of truth for this workbook. Official URLs must be rechecked before submission.", "D");
sources.getRange("A4:D4").values = [["Source", "Purpose", "Location / URL", "Reliability note"]];
header(sources.getRange("A4:D4"));
const sourceRows = [
  ["Submission checklist", "Page-by-page template mapping and open gaps", "SUBMISSION_CHECKLIST.md", "Project-maintained summary; confirm event portal requirements."],
  ["Resource plan", "Scope, journeys, architecture, cost and acceptance plan", "RESOURCE_PLAN.md", "Primary internal plan; some services remain proposed."],
  ["Competition strategy", "Positioning, signature scenario and AI value", "COMPETITION_STRATEGY.md", "Internal strategy; avoid turning plans into claims."],
  ["Hackathon notes", "Theme, transcript notes and judging emphasis", "HACKATHON_NOTES.md", "Notes may be incomplete; portal rules take precedence."],
  ["Product brief", "Users, product scope and open decisions", "PRODUCT.md", "Current product intent."],
  ["Design notes", "Conversation UX and visual verification", "DESIGN.md", "Current design rationale and recorded checks."],
  ["Prototype README", "Implemented behavior and verification status", "resource-app/README.md", "Use as current implementation evidence."],
  ["Package manifest", "Final frontend libraries", "resource-app/package.json", "Current dependency record."],
  ["Firebase pricing", "Validate no-billing architecture", "https://firebase.google.com/pricing", "Official; recheck current limits."],
  ["Firebase AI Logic", "Validate client AI integration and supported models", "https://firebase.google.com/docs/ai-logic", "Official; recheck model availability and quotas."],
  ["Firebase App Check", "Validate abuse-protection design", "https://firebase.google.com/docs/app-check", "Official."],
  ["Claim boundary", "Live AI, hosting, quotas, public links and user metrics", "Do not claim as complete until Evidence Tracker is filled.", "Required for an honest submission."],
];
sources.getRange("A5:D16").values = sourceRows;
body(sources.getRange("A5:D16"));
for (const [col, width] of [["A:A",24],["B:B",42],["C:C",54],["D:D",45]]) sources.getRange(col).format.columnWidth = width;
sources.getRange("A5:D16").format.rowHeight = 38;
sources.freezePanes.freezeRows(4);
sources.tabColor = grey;

await wb.recalculate();

const checks = [];
for (const [sheetName, range] of [["Submission Draft","A1:G18"],["Inputs & Links","A1:E21"],["Evidence Tracker","A1:H21"],["Demo Video","A1:G14"],["Sources","A1:D16"]]) {
  checks.push(await wb.inspect({ kind: "region", sheetId: sheetName, range, maxChars: 3500, tableMaxRows: 5, tableMaxCols: 8, tableMaxCellChars: 100 }));
}
const formulas = await wb.inspect({ kind: "formula", maxChars: 5000, options: { maxResults: 100 } });
await fs.writeFile(`${outDir}/inspection.txt`, checks.map((x) => x.ndjson).join("\n") + "\n" + formulas.ndjson);

for (const sheetName of ["Submission Draft", "Inputs & Links", "Evidence Tracker", "Demo Video", "Sources"]) {
  const preview = await wb.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${outDir}/previews/${sheetName.replaceAll(" ", "_").replaceAll("&", "and")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(`${outDir}/ReSource_Submission_Workbook.xlsx`);
console.log(`${outDir}/ReSource_Submission_Workbook.xlsx`);
