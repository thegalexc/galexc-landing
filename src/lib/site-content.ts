export interface NavItem {
    slug: string;
    label: string;
    blurb: string;
    eyebrow: string;
    summary: string;
    sections: Array<{
        title: string;
        body: string;
    }>;
}

export interface NavGroup {
    id: string;
    title: string;
    intro: string;
    items: NavItem[];
}

export interface VariantStudy {
    slug: string;
    index: string;
    name: string;
    thesis: string;
}

export const navGroups: NavGroup[] = [
    {
        id: 'foundations',
        title: 'Foundations',
        intro: 'The frame for what GalexC is trying to be.',
        items: [
            {
                slug: 'what-is-galexc',
                label: 'What GalexC is',
                blurb: 'A personal AI environment designed to feel durable, operator-friendly, and deeply owned.',
                eyebrow: 'Foundations',
                summary:
                    'GalexC treats personal AI as infrastructure, not a novelty app. The objective is a system that helps with real work, household coordination, and ongoing experimentation without turning into another brittle dashboard.',
                sections: [
                    {
                        title: 'The operating idea',
                        body: 'The product stance is simple: professional-grade personal AI. That means strong routing, useful memory, real tools, and interfaces that stay calm even when the capability surface expands.',
                    },
                    {
                        title: 'Why it matters',
                        body: 'Most AI products feel disposable because they are optimized for a demo moment. GalexC is aiming for the opposite. It should feel more like a trusted environment that accumulates leverage over time.',
                    },
                ],
            },
            {
                slug: 'manifesto',
                label: 'Manifesto',
                blurb: 'A short position on ownership, durability, and building from first principles.',
                eyebrow: 'Foundations',
                summary:
                    'GalexC should help a person think and operate with more continuity. The manifesto is not about replacing judgment. It is about building an AI environment that respects constraints, keeps context intact, and rewards deliberate use.',
                sections: [
                    {
                        title: 'Owned interfaces',
                        body: 'The system should favor interfaces that Gilman or the project can actually control, inspect, and evolve. That means fewer black boxes and more explicit seams.',
                    },
                    {
                        title: 'Quiet power',
                        body: 'The visual and interaction language should signal confidence without noise. Strong systems do not need to shout to prove they are sophisticated.',
                    },
                ],
            },
        ],
    },
    {
        id: 'system',
        title: 'System',
        intro: 'The mechanics beneath the editorial skin.',
        items: [
            {
                slug: 'architecture-overview',
                label: 'Architecture overview',
                blurb: 'A readable map of the orchestration layer, services, and model workflows.',
                eyebrow: 'System',
                summary:
                    'GalexC spans orchestration, services, storage, search, and model execution. The landing surface should eventually point to a human-readable architecture page that explains how the pieces work together without collapsing into infra jargon.',
                sections: [
                    {
                        title: 'Layering',
                        body: 'The repo already expresses a strong control-plane versus target-repo posture. The product should inherit that clarity so users can understand what owns what.',
                    },
                    {
                        title: 'Why navigation matters here',
                        body: 'Architecture content will grow. The landing page therefore needs navigation that scales from a few essays to a larger set of technical subpages without needing a redesign every time.',
                    },
                ],
            },
            {
                slug: 'operator-model',
                label: 'Operator model',
                blurb: 'How humans, agents, and background workflows divide responsibilities.',
                eyebrow: 'System',
                summary:
                    'One of the more interesting GalexC ideas is that the operator remains clearly in charge. Agents route, suggest, refine, and automate, but there is always a conscious model of approvals, boundaries, and ownership.',
                sections: [
                    {
                        title: 'Control surfaces',
                        body: 'Some work belongs in the main session, some in Forge, some in dispatch. A good product explanation should make that feel legible rather than magical.',
                    },
                    {
                        title: 'Trust model',
                        body: 'The operator model is also a trust model. You should know what can happen automatically, what requires approval, and what is intentionally left manual.',
                    },
                ],
            },
        ],
    },
    {
        id: 'principles',
        title: 'Principles',
        intro: 'The taste and interaction doctrine behind the product.',
        items: [
            {
                slug: 'design-philosophy',
                label: 'Design philosophy',
                blurb: 'Why the surface should feel more like an authored publication than a standard app shell.',
                eyebrow: 'Principles',
                summary:
                    'The current lander already hints at the right direction: a warm editorial canvas, restrained accents, and quiet motion. The expanded site should preserve that authored feeling even as the information architecture gets richer.',
                sections: [
                    {
                        title: 'Editorial over dashboard',
                        body: 'Navigation should feel like a table of contents, chapter index, or marginal note. It should not feel like a SaaS pricing site with a menu bolted on top.',
                    },
                    {
                        title: 'Room for thought',
                        body: 'Generous spacing is not decorative here. It is part of the product stance. The page should suggest reflection and confidence rather than urgency.',
                    },
                ],
            },
            {
                slug: 'interaction-notes',
                label: 'Interaction notes',
                blurb: 'Motion, disclosure, and rhythm choices that make the system feel calm rather than app-like.',
                eyebrow: 'Principles',
                summary:
                    'The reveal pattern is one of the strongest existing design cues. Expanding, unfolding, and disclosing are better verbs for GalexC than sliding, stacking, or snapping.',
                sections: [
                    {
                        title: 'Reveal as language',
                        body: 'A disclosure system works well because it matches the idea of opening a notebook or archive. It also scales naturally to grouped navigation and optional detail.',
                    },
                    {
                        title: 'Restraint',
                        body: 'The motion system should remain subtle. A page that is meant to convey trust and authorship should never feel over-animated.',
                    },
                ],
            },
        ],
    },
    {
        id: 'comparisons',
        title: 'Comparisons',
        intro: 'Where GalexC overlaps with other AI approaches and where it clearly diverges.',
        items: [
            {
                slug: 'comparison-landscape',
                label: 'Comparisons',
                blurb: 'A framework for comparing GalexC with Hermes, Claude Code, OpenClaw, and adjacent agentic systems.',
                eyebrow: 'Comparisons',
                summary:
                    'Comparison content should not read like a feature matrix. It should explain which class of problem each system optimizes for and why GalexC is aiming at a different blend of ownership, orchestration, and day-to-day utility.',
                sections: [
                    {
                        title: 'Same family, different posture',
                        body: 'Some systems optimize for coding throughput. Others optimize for local autonomy or extensibility. GalexC is trying to preserve serious operator control while still feeling personal and broadly useful.',
                    },
                    {
                        title: 'Why this page exists',
                        body: 'Visitors will arrive with reference points. A thoughtful comparison page helps them orient quickly without flattening the product into someone else\'s category.',
                    },
                ],
            },
        ],
    },
];

export const contentPages = navGroups.flatMap((group) => group.items);

export const variantStudies: VariantStudy[] = [
    {
        slug: 'index1',
        index: '01',
        name: 'Folio spine',
        thesis: 'A book-spine rail turns navigation into a left-margin artifact.',
    },
    {
        slug: 'index2',
        index: '02',
        name: 'TOC drop',
        thesis: 'A single contents trigger unfolds the whole information architecture.',
    },
    {
        slug: 'index3',
        index: '03',
        name: 'Archive reveal',
        thesis: 'Grouped disclosure keeps the hero quiet while navigation scales cleanly.',
    },
    {
        slug: 'index4',
        index: '04',
        name: 'Chapter bar',
        thesis: 'A custom horizontal chapter strip shows the most conventional option.',
    },
    {
        slug: 'index5',
        index: '05',
        name: 'Catalog grid',
        thesis: 'Navigation becomes a field of browseable editorial destination cards.',
    },
];

export function getContentPage(slug: string) {
    return contentPages.find((page) => page.slug === slug);
}

export function getAdjacentContent(slug: string) {
    const index = contentPages.findIndex((page) => page.slug === slug);

    return {
        previous: index > 0 ? contentPages[index - 1] : null,
        next: index >= 0 && index < contentPages.length - 1 ? contentPages[index + 1] : null,
    };
}
