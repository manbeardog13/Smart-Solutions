**DEFAULT COMPANY PLATFORM STANDARD**  
  
**Status: Mandatory**  
**Applies to: Claude, Codex, and any other implementation agent**  
**Scope: Every future company platform, internal business application, operational dashboard, field-service system, client portal, or management platform unless Toni explicitly overrides a rule in writing**  
**Authority: This file is the default platform design and implementation contract**  
  
  
  
**1. Purpose**  
  
This document defines the mandatory default architecture, visual system, responsive behavior, interaction model, and quality standard for all future company platforms.  
  
The goal is to prevent design drift, repeated re-explanation, inconsistent implementations, and agent-specific reinterpretation.  
  
Every new company platform must begin from this standard rather than from a blank design system.  
  
This is not an ASC-specific reference and must never be described as one. It is the shared default platform foundation for all present and future companies.  
  
  
  
**2. Agent Compliance**  
  
Claude, Codex, and any other implementation agent must:  
  
	1.	Read this file before planning, designing, generating, reviewing, or modifying a company platform.  
	2.	Treat this file as an active project constraint, not as optional guidance.  
	3.	Preserve these rules during refactors, redesigns, migrations, and feature additions.  
	4.	Reject changes that silently violate this standard.  
	5.	Explicitly identify any requested deviation before implementing it.  
	6.	Apply the narrowest possible exception when Toni overrides a rule.  
	7.	Never reinterpret a one-time exception as a new global standard.  
	8.	Keep the same core product across mobile, tablet, desktop, and ultrawide displays.  
	9.	Never claim compliance without validating the finished implementation.  
  
Where project instructions conflict with this file, the most recent explicit instruction from Toni takes precedence. All non-conflicting rules remain active.  
  
  
  
**3. Default Product Sequence**  
  
Every platform must follow this default launch sequence:  
  
	1.	**Application opened**  
	2.	**Branded splash/loading screen appears immediately**  
	3.	**Company logo is the primary visual element**  
	4.	**Startup state, session state, and required application resources are checked**  
	5.	**User is routed to login, onboarding, or an authenticated session**  
	6.	**After authentication, the correct role-aware dashboard opens**  
  
The splash screen is not decorative filler. It is the formal branded entry into the product.  
  
**Splash-screen requirements**  
  
	●	The company logo must appear before the login screen.  
	●	The screen must feel premium, deliberate, and fast.  
	●	Use restrained motion, soft depth, subtle glow, blur, or material transitions where appropriate.  
	●	Avoid generic spinners as the main visual.  
	●	Avoid long, blocking, or theatrical animations.  
	●	Respect reduced-motion settings.  
	●	Preserve brand identity in both light and dark modes.  
	●	The transition into login or dashboard must feel continuous rather than abrupt.  
  
  
  
**4. One Product, Adaptive Layouts**  
  
Mobile, tablet, desktop, and ultrawide versions must not be treated as separate products.  
  
They must share:  
  
	●	the same data model;  
	●	the same permissions model;  
	●	the same core workflows;  
	●	the same business rules;  
	●	the same terminology;  
	●	the same visual identity;  
	●	the same source of truth;  
	●	the same validation rules.  
  
Layouts may adapt substantially, but product behavior must remain coherent.  
  
**Device behavior**  
  
The application must detect and respond to:  
  
	●	viewport width and height;  
	●	orientation;  
	●	input type;  
	●	touch capability;  
	●	safe areas;  
	●	pixel density;  
	●	reduced-motion preference;  
	●	color-scheme preference;  
	●	desktop, tablet, and mobile interaction patterns;  
	●	ultrawide monitor dimensions.  
  
Do not rely only on device names or user-agent strings. Use responsive layout logic, capability detection, and runtime measurements.  
  
  
  
**5. Design Philosophy**  
  
**Minimalism is the primary rule.**  
  
The design must feel:  
  
	●	premium;  
	●	calm;  
	●	modern;  
	●	operationally clear;  
	●	highly legible;  
	●	responsive;  
	●	polished;  
	●	soft without becoming vague;  
	●	refined without becoming ornamental;  
	●	Apple-quality in discipline, not as imitation.  
  
The platform must avoid:  
  
	●	visual noise;  
	●	unnecessary borders;  
	●	excessive card nesting;  
	●	crowded dashboards;  
	●	decorative gradients without purpose;  
	●	excessive glow;  
	●	aggressive shadows;  
	●	hard, mechanical transitions;  
	●	oversized empty hero areas in operational screens;  
	●	duplicated controls;  
	●	ambiguous icons;  
	●	desktop layouts merely squeezed onto mobile.  
  
Every element must justify its presence.  
  
  
  
**6. Default Visual System**  
  
**6.1 Surfaces**  
  
Use a restrained system of:  
  
	●	soft-radius cards;  
	●	subtle glass or translucent surfaces where appropriate;  
	●	controlled backdrop blur;  
	●	low-contrast separators;  
	●	soft depth;  
	●	clean solid surfaces for dense operational data;  
	●	gentle bevel or highlight treatment only when it improves hierarchy.  
  
Glassmorphism must never reduce readability, performance, or accessibility.  
  
**6.2 Corners**  
  
	●	Use consistently soft corners.  
	●	Avoid random radius values.  
	●	Define a compact radius scale in design tokens.  
	●	Interactive elements must visually belong to the same family.  
  
**6.3 Shadows**  
  
	●	Shadows must be soft and restrained.  
	●	Use depth to clarify hierarchy, not decorate every component.  
	●	Avoid harsh black shadows.  
	●	Avoid stacked shadow effects that create visual mud.  
  
**6.4 Color**  
  
	●	Begin from the company brand palette.  
	●	Use one primary accent and a limited supporting palette.  
	●	Preserve strong text contrast.  
	●	Reserve warning, error, and success colors for semantic meaning.  
	●	Do not overuse the brand accent.  
	●	Light and dark themes must be intentionally designed, not mechanically inverted.  
  
**6.5 Typography**  
  
	●	Use a modern, highly legible sans-serif system.  
	●	Establish clear hierarchy with size, weight, spacing, and contrast.  
	●	Avoid excessive font sizes or too many weights.  
	●	Operational values, quantities, times, and statuses must scan quickly.  
	●	Mobile text must remain comfortably readable without zooming.  
  
**6.6 Motion**  
  
Motion must be:  
  
	●	soft;  
	●	non-linear;  
	●	physically believable;  
	●	fast enough for business use;  
	●	interruptible;  
	●	state-aware;  
	●	consistent across the product.  
  
Prefer transform and opacity animations. Avoid layout-thrashing animation patterns.  
  
All motion must support prefers-reduced-motion.  
  
  
  
**7. Default Information Architecture**  
  
**Desktop and tablet landscape**  
  
Use:  
  
	●	a left navigation sidebar;  
	●	a top application bar where useful;  
	●	a flexible main content region;  
	●	contextual drawers, panels, or modals;  
	●	persistent access to global search, profile, and high-priority actions where relevant.  
  
**Mobile and tablet portrait**  
  
Use:  
  
	●	a simplified navigation model;  
	●	large touch targets;  
	●	fewer visible columns;  
	●	progressive disclosure;  
	●	bottom navigation, compact drawer navigation, or context-appropriate alternatives;  
	●	full-width task flows;  
	●	clear back navigation;  
	●	minimal taps for field workflows.  
  
Do not force the desktop sidebar into a narrow mobile viewport.  
  
  
  
**8. Sidebar Standard**  
  
The default desktop sidebar must:  
  
	●	remain stable and not visually “swim” during scrolling;  
	●	support expanded and collapsed states;  
	●	preserve company branding;  
	●	show the logo or compact logo mark in collapsed mode;  
	●	use icons with labels in expanded mode;  
	●	retain understandable navigation in collapsed mode;  
	●	expand smoothly;  
	●	avoid accidental navigation when the intended action is expansion;  
	●	support keyboard navigation;  
	●	clearly show the active section;  
	●	avoid duplicate profile controls elsewhere unless functionally justified.  
  
Where edge-hover expansion is used, it must not create accidental activation or block content.  
  
  
  
**9. Top Bar Standard**  
  
The top bar should:  
  
	●	remain visually lightweight;  
	●	contain only high-value global controls;  
	●	remain sticky where persistent access improves operation;  
	●	hide or compress intelligently on smaller screens where appropriate;  
	●	reappear predictably;  
	●	avoid duplication with sidebar controls;  
	●	preserve context during navigation.  
  
Avoid oversized headers that consume operational space.  
  
  
  
**10. Dashboard Standard**  
  
The dashboard must be role-aware and action-oriented.  
  
It must prioritize:  
  
	1.	what requires attention now;  
	2.	what changed recently;  
	3.	what is blocked;  
	4.	what the user is responsible for;  
	5.	what action should be taken next.  
  
Avoid dashboards that are merely collections of decorative statistics.  
  
**Desktop dashboard**  
  
May use:  
  
	●	multi-column layouts;  
	●	richer summaries;  
	●	tables and charts;  
	●	operational panels;  
	●	wider timelines;  
	●	contextual side panels.  
  
**Mobile dashboard**  
  
Must use:  
  
	●	a prioritized single-column flow;  
	●	large critical actions;  
	●	concise cards;  
	●	reduced secondary information;  
	●	collapsible detail;  
	●	fast access to the user’s most common tasks.  
  
Mobile must not be a shrunk desktop dashboard.  
  
  
  
**11. Authentication Standard**  
  
Unless a project explicitly requires a different model, the authentication surface should support:  
  
	●	username or email;  
	●	password;  
	●	forgot-password flow;  
	●	clear login action;  
	●	optional approved third-party login;  
	●	account creation where applicable;  
	●	secure session handling;  
	●	clear error states;  
	●	password-manager compatibility;  
	●	accessible labels;  
	●	keyboard and mobile input support.  
  
The login screen must preserve company branding and follow the splash screen without visual discontinuity.  
  
  
  
**12. Roles and Permissions**  
  
All company platforms must assume role-aware access from the beginning, even if the first release has only one role.  
  
The implementation must support:  
  
	●	explicit roles;  
	●	permission-based capabilities;  
	●	least-privilege access;  
	●	server-side authorization;  
	●	hidden or disabled controls where appropriate;  
	●	protected routes;  
	●	auditable permission changes;  
	●	future role expansion without redesigning the entire system.  
  
Do not rely on frontend visibility as security.  
  
  
  
**13. Data and Synchronization**  
  
The default platform architecture must use a clear source of truth and real-time or near-real-time synchronization where operationally relevant.  
  
Required principles:  
  
	●	consistent data model;  
	●	transactional integrity;  
	●	optimistic UI only when recovery is safe;  
	●	conflict handling;  
	●	loading, empty, stale, offline, and error states;  
	●	auditability for important changes;  
	●	timestamps and responsible user identity;  
	●	safe retry behavior;  
	●	idempotent critical actions where possible;  
	●	no silent data loss.  
  
The interface must never imply that data is live when it is not.  
  
  
  
**14. Operational Modules**  
  
Where the company workflow requires them, the platform should be ready to support:  
  
	●	clients;  
	●	projects;  
	●	jobs;  
	●	work orders;  
	●	inventory;  
	●	suppliers;  
	●	products and materials;  
	●	QR or barcode workflows;  
	●	staff and field technicians;  
	●	schedules;  
	●	documents;  
	●	invoices or commercial records;  
	●	notifications;  
	●	reports;  
	●	audit logs;  
	●	approval flows;  
	●	AI assistance.  
  
These modules are not mandatory in every platform, but the shared design system and architecture must accommodate them without visual or technical fragmentation.  
  
  
  
**15. Forms and Validation**  
  
Forms must be designed for completion, not decoration.  
  
Required behavior:  
  
	●	clear labels;  
	●	sensible defaults;  
	●	inline validation;  
	●	persistent entered data after recoverable errors;  
	●	explicit required fields;  
	●	appropriate mobile keyboards;  
	●	disabled submission only when the reason is clear;  
	●	clear success states;  
	●	prevention of duplicate submissions;  
	●	unsaved-change protection where necessary;  
	●	logical grouping;  
	●	minimal required typing;  
	●	support for scanning, selection, autofill, and templates where appropriate.  
  
Critical workflows must not be closable or completable until mandatory fields and business rules are satisfied.  
  
  
  
**16. Field-Work Standard**  
  
Any platform used by technicians, drivers, installers, warehouse staff, or other field users must prioritize:  
  
	●	one-handed use where possible;  
	●	large buttons;  
	●	large quantities and status labels;  
	●	strong sunlight readability;  
	●	minimal steps;  
	●	camera and QR access;  
	●	rapid return to the previous scroll and workflow state;  
	●	intermittent connectivity handling;  
	●	clear sync status;  
	●	explicit confirmation for destructive actions;  
	●	easy arrival, departure, signature, material, photo, and note capture where relevant.  
  
Desktop density must never dictate the field interface.  
  
  
  
**17. Accessibility**  
  
Every platform must meet a professional accessibility baseline.  
  
Required:  
  
	●	semantic HTML;  
	●	keyboard navigation;  
	●	visible focus states;  
	●	adequate contrast;  
	●	text scaling support;  
	●	accessible names for icons and controls;  
	●	reduced-motion support;  
	●	error messages tied to fields;  
	●	screen-reader-compatible state changes;  
	●	no color-only status communication;  
	●	minimum practical touch-target sizes.  
  
Accessibility must be designed in, not patched later.  
  
  
  
**18. Performance**  
  
Premium quality includes speed.  
  
Required:  
  
	●	fast startup;  
	●	route-level loading states;  
	●	code splitting where appropriate;  
	●	optimized images and icons;  
	●	no unnecessary animation libraries;  
	●	virtualized large lists where necessary;  
	●	efficient queries;  
	●	caching with clear freshness rules;  
	●	responsive interaction under realistic data volume;  
	●	graceful degradation on weaker devices;  
	●	no blocking splash animation.  
  
Performance regressions must be treated as product defects.  
  
  
  
**19. Component and Token System**  
  
Every platform must implement a reusable system of design tokens and shared components.  
  
At minimum define:  
  
	●	colors;  
	●	typography;  
	●	spacing;  
	●	radii;  
	●	shadows;  
	●	blur levels;  
	●	motion duration;  
	●	easing curves;  
	●	breakpoints;  
	●	z-index layers;  
	●	icon sizing;  
	●	touch-target sizing;  
	●	container widths;  
	●	density modes where needed.  
  
Core shared components should include:  
  
	●	buttons;  
	●	inputs;  
	●	selects;  
	●	dialogs;  
	●	drawers;  
	●	cards;  
	●	tables;  
	●	status badges;  
	●	alerts;  
	●	navigation items;  
	●	loading states;  
	●	empty states;  
	●	tooltips;  
	●	toasts;  
	●	confirmation patterns;  
	●	responsive shells.  
  
Do not hand-style each screen independently.  
  
  
  
**20. Required States**  
  
Every significant screen or component must define:  
  
	●	default;  
	●	hover;  
	●	focus;  
	●	active;  
	●	selected;  
	●	disabled;  
	●	loading;  
	●	empty;  
	●	error;  
	●	success;  
	●	offline or stale where relevant;  
	●	permission-denied;  
	●	destructive confirmation where relevant.  
  
A screen is not complete if only the happy path is designed.  
  
  
  
**21. Ultrawide and Large-Screen Behavior**  
  
On desktop, the platform must detect actual viewport dimensions and use the available screen intelligently.  
  
Requirements:  
  
	●	avoid leaving the application as a narrow centered strip on ultrawide displays;  
	●	preserve readable line lengths;  
	●	expand dashboards and operational layouts meaningfully;  
	●	use side panels, wider tables, split views, and additional context where useful;  
	●	avoid stretching cards into empty, oversized blocks;  
	●	ensure splash and transition treatments visually occupy the display appropriately;  
	●	allow branded transition sequences to extend across approximately 80% of available width where the concept is used;  
	●	preserve restraint and avoid overwhelming the user.  
  
  
  
**22. Brand Integration**  
  
Each company receives its own identity while preserving the shared platform foundation.  
  
Project-specific branding may alter:  
  
	●	logo;  
	●	primary accent;  
	●	supporting colors;  
	●	imagery;  
	●	approved typography;  
	●	icon accents;  
	●	selected motion details;  
	●	brand-specific empty states or illustrations.  
  
Project-specific branding must not break:  
  
	●	layout logic;  
	●	accessibility;  
	●	navigation consistency;  
	●	component behavior;  
	●	role and permission architecture;  
	●	data integrity;  
	●	responsive standards;  
	●	product quality.  
  
  
  
**23. Prohibited Implementation Patterns**  
  
Do not:  
  
	●	copy a previous company’s branding into a new platform;  
	●	call this system the ASC reference, ASC baseline, or ASC replacement;  
	●	create separate disconnected mobile and desktop products without explicit approval;  
	●	hide permission problems with frontend-only controls;  
	●	use fake data in production paths without clear labeling;  
	●	create non-functional visual placeholders and present them as complete;  
	●	overuse glass, blur, glow, gradients, or animation;  
	●	duplicate profile, navigation, or global actions;  
	●	create inaccessible icon-only controls without labels;  
	●	ship pages without loading, empty, and error states;  
	●	use random spacing, radii, or motion durations;  
	●	silently change the shared design language;  
	●	close critical workflows before required data is complete;  
	●	make claims of real-time operation without real synchronization;  
	●	destroy user context after closing a modal or returning from camera/scanner flows.  
  
  
  
**24. Implementation Workflow**  
  
For every new company platform, Claude or Codex must follow this sequence:  
  
**Phase 1 — Read and classify**  
  
	●	Read this file.  
	●	Read project-specific requirements.  
	●	Identify company branding.  
	●	Identify roles.  
	●	Identify primary workflows.  
	●	Identify mobile and field use.  
	●	Identify real-time, offline, audit, and security requirements.  
  
**Phase 2 — Establish the shared shell**  
  
Implement:  
  
	●	design tokens;  
	●	responsive application shell;  
	●	splash screen;  
	●	login/authentication shell;  
	●	sidebar and mobile navigation;  
	●	top bar;  
	●	role-aware routing;  
	●	theme support;  
	●	loading, empty, and error primitives.  
  
**Phase 3 — Build business modules**  
  
	●	Use shared components.  
	●	Preserve responsive behavior.  
	●	Enforce business rules at both UI and backend levels.  
	●	Add auditability for meaningful actions.  
	●	Validate mobile and desktop flows independently.  
  
**Phase 4 — Quality review**  
  
	●	Compare implementation against this file.  
	●	Run responsive checks.  
	●	Run accessibility checks.  
	●	Run permission checks.  
	●	Run empty/error/loading-state checks.  
	●	Run real-data-volume checks.  
	●	Verify launch sequence.  
	●	Verify brand correctness.  
	●	Verify no previous company identity leaked into the project.  
  
**Phase 5 — Report**  
  
Return a concise compliance report containing:  
  
	●	rules implemented;  
	●	explicit deviations;  
	●	unresolved risks;  
	●	tests performed;  
	●	screenshots or routes reviewed where available;  
	●	recommended next actions.  
  
  
  
**25. Mandatory Pre-Completion Checklist**  
  
Before declaring a platform or major feature complete, confirm all applicable items:  
  
**Brand and launch**  
  
		Company logo appears on initial splash screen.  
		Splash transition is polished and non-blocking.  
		Login visually follows the splash screen.  
		No branding from another company remains.  
  
**Responsive behavior**  
  
		Mobile is purposefully designed, not compressed desktop.  
		Tablet portrait and landscape are validated.  
		Desktop is validated.  
		Ultrawide behavior is validated.  
		Touch and pointer interactions are both usable.  
  
**Navigation**  
  
		Sidebar is stable.  
		Collapsed and expanded states work.  
		Active navigation is clear.  
		Mobile navigation is appropriate.  
		No duplicate global controls exist without reason.  
  
**Data and permissions**  
  
		Role-based access is enforced server-side.  
		Critical actions are auditable.  
		Loading, empty, error, and stale states exist.  
		Real-time claims are technically accurate.  
		Required fields and workflow gates are enforced.  
  
**Design quality**  
  
		Minimalism is preserved.  
		Cards, spacing, radii, and shadows are consistent.  
		Motion is restrained and supports reduced motion.  
		Contrast and focus states are acceptable.  
		Operational information is easy to scan.  
  
**Performance**  
  
		Startup is fast.  
		No animation blocks interaction.  
		Large lists and data sets remain responsive.  
		Images and assets are optimized.  
  
  
  
**26. Project Integration Requirement**  
  
Every future platform repository should include this file at a stable path such as:  
  
```text  
docs/platform/DEFAULT_COMPANY_PLATFORM_STANDARD.md  
```  
  
The repository should also reference it from the primary agent instruction file, for example:  
  
```text  
CLAUDE.md  
AGENTS.md  
CODEX.md  
CONTRIBUTING.md  
```  
  
Recommended instruction:  
  
```md  
Before making any product, UI, UX, architecture, or responsive-layout change, read and comply with `docs/platform/DEFAULT_COMPANY_PLATFORM_STANDARD.md`. This standard is mandatory for Claude, Codex, and all implementation agents. Project-specific instructions may override individual rules only when explicitly stated by Toni.  
```  
  
Where supported, add automated checks or review templates that require confirmation of compliance.  
  
  
  
**27. Final Authority Statement**  
  
This file defines the default company-platform standard.  
  
Claude and Codex must treat it as a persistent implementation contract across all future company platform projects.  
  
The visual identity of each company may change. The quality bar, responsive discipline, operational clarity, security posture, role-awareness, launch sequence, and core interaction philosophy must remain consistent.  
  
## Default rule: premium minimalism, branded entry, one adaptive product, role-aware operation, real data, clear actions, and no design drift.  

---

**Appendix A — Hardcoded Default Look (authorized amendment by Toni, 24.07.2026)**

The default company-platform look is the ASC application look, re-tinted per company brand. These are concrete, non-negotiable defaults; the reference implementation is `manbeardog13/Smart-Solutions`.

	1.	**Navigation is a LEFT SIDEBAR on every device class. Floating bottom docks or tab bars are prohibited.** Desktop: a floating opaque sidebar (248px, collapsible to a 72px icon rail, persisted), one step darker than the canvas, radius 22, module-accented active items (3px accent bar + accent ink; the dashboard item carries the brand accent). Phone: the SAME sidebar slides in from the left as an overlay behind a hamburger button, with a scrim; scrim tap, navigation, or Escape closes it.
	2.	**Canvas**: cloud tone (`#EEF0F1` light / `#0A0C11` dark) with three quiet radial pools (brand-tinted, cool blue, gunmetal) and fine SVG grain. No photo backdrops, no drawn shapes or lines.
	3.	**Shell**: one glass container (max-width 1180, radius 32, blur 30 + saturate + brightness, rim borders, sheet-in entrance) holding a lightweight 40px top bar (hamburger on phone, ~26px logo, demo/status chip) and the content.
	4.	**Surfaces**: solid panels (`#F4F4F3`/`#FDFDFC` light, `#22242A`/`#2B2D33` dark), radius 24, one layered card shadow, no borders. **Notched corner tabs**: uppercase 10.5px labels nested INTO card corners with 14px inverse-radius bevels over an opaque gap colour.
	5.	**Dashboard**: dark stage hero (gradient `#0B0C0E→#17181B`, brand-tinted scrim over a real photo on the right), uppercase eyebrow, display-font greeting, ONE big honest number with its unit, a capacity meter, and a corner tab. KPI cards and the attention list follow. Numbers are always real.
	6.	**Type**: Inter for text, Sora for display titles and numbers. Sentence case everywhere; uppercase only in eyebrows, corner tabs, and chips.
	7.	**Logon + splash**: the single-card logon matched to the ASC phone build, measured by `scripts/audit-login.mjs` within ±2px (card edge gaps, every element's size, gaps, fonts, radii — scale the card, never cut it); splash is the brand mark alone with a thin brand rule beneath.
	8.	**Theme**: intentional light and dark tokens for every surface. The theme control lives in the sidebar (dot = light, ring = dark) and on the logon card (iOS switch emitting a brand-colour micro-glow on press).

	9.	**Asset photography is mandatory and automatic.** Every warehouse/inventory asset displays a real photo — never an icon or initial tile. The photo comes from the company catalogue when available; otherwise it is found and imported from online sources at the moment the asset is added (a close match is acceptable; record the source, e.g. `catalogue/images/parts/SOURCES.md`). Location codes and status badges stay out of lists — the quantity number itself carries the state (coloured when below minimum).

A new platform starts by copying the reference implementation and re-tinting the brand colour, logo, imagery, and copy — never by re-designing this chrome.
