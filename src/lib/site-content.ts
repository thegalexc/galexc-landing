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

export interface ContentsVariant {
    slug: string;
    href: string;
    index: string;
    name: string;
    title: string;
    intro?: string;
}

export const navGroups: NavGroup[] = [
    {
        id: 'foundations',
        title: 'Foundations',
        intro: 'The frame for what GalexC is trying to be.',
        items: [
            {
                slug: 'what-is-galexc',
                label: 'What is GalexC?',
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
                slug: 'comparison-landscape',
                label: 'Comparisons',
                blurb: 'A framework for comparing GalexC with Hermes, Claude Code, OpenClaw, and adjacent agentic systems.',
                eyebrow: 'Foundations',
                summary:
                    'Comparison content should not read like a feature matrix. It should explain which class of problem each system optimizes for and why GalexC is aiming at a different blend of ownership, orchestration, and day-to-day utility.',
                sections: [
                    {
                        title: 'Same family, different posture',
                        body: 'Some systems optimize for coding throughput. Others optimize for local autonomy or extensibility. GalexC is trying to preserve serious operator control while still feeling personal and broadly useful.',
                    },
                    {
                        title: 'Why this page exists',
                        body: "Visitors will arrive with reference points. A thoughtful comparison page helps them orient quickly without flattening the product into someone else's category.",
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
                blurb: 'A readable map of the seed layer, replaceable services, and the personal AI stack that grows from there.',
                eyebrow: 'System',
                summary:
                    'GalexC starts from a seed system, currently called galexc-starter-pack and likely becoming galexc-seed, that establishes the foundational interaction model rather than prescribing a permanent software stack. It gives you durable interaction layers, tasks, async dispatch, scheduled work, a workstation Pi environment aligned with dispatched agents, and core communications primitives like intercom. From there, you take ownership and shape the system around your own needs.',
                sections: [
                    {
                        title: 'Seed first, then divergence',
                        body: 'The architecture is meant to give you a serious starting point, not a fixed product boundary. You begin with a coherent seed that already knows how to route work, preserve context, run background jobs, and keep the local and async agent environments aligned. Once that foundation is in place, you can replace any layer you want. Swap Postgres for something else. Rebuild Python services in Go. Change the scheduling model. The point is not conformity. The point is to start from an opinionated, working base and then deliberately diverge.',
                    },
                    {
                        title: 'Owned evolution',
                        body: 'After you fork it, the system is yours. GalexC is not meant to be maintained like traditional software where everyone waits on a central vendor to bless each change. The seed includes patterns for upkeep, like weekly version checks, cleanup sweeps for expertise files, and other maintenance loops that your own AI can help carry forward. You can also tap into my learnings and features through Parley if you want, but that is optional by design. The architecture is supposed to support real ownership, including the freedom to ignore pieces that do not fit.',
                    },
                ],
            },
            {
                slug: 'operator-model',
                label: 'Operator model',
                blurb: 'How a person and their AI settle into a working cadence that is genuinely their own.',
                eyebrow: 'System',
                summary:
                    'GalexC is not only a software architecture. It is an operator model for learning how to work with a personal AI system that you actually own. The human remains in charge, but the more important point is that the relationship becomes adaptable. You and your AI develop a cadence, maintenance posture, and division of labor that fit your own context rather than mine.',
                sections: [
                    {
                        title: 'Learn the system by using it',
                        body: 'The seed gives you a real operating environment from day one. Durable interaction layers, tasks, async dispatches, scheduled jobs, workstation Pi, and shared skills let you begin interacting with your personal AI in a structured way immediately. That matters because the operator model is not something you understand only by reading docs. You learn it by actually routing work, reviewing outputs, deciding what stays manual, and discovering which interfaces feel natural for your life and work.',
                    },
                    {
                        title: 'Your cadence, not mine',
                        body: "Once the system is yours, the goal is not to keep matching Gilman's preferred setup forever. The goal is to arrive at a professional-grade personal AI that reflects your own preferences, constraints, and standards. Maybe you rely heavily on scheduled sweeps and background jobs. Maybe you keep things more manual. Maybe you use Parley to inherit ideas and capabilities. Maybe you ignore it entirely. That flexibility is central. The operator model only works if the system can become meaningfully personal without losing rigor.",
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
            {
                slug: 'inspiration',
                label: 'Inspiration',
                blurb: 'The foundational inspiration behind GalexC, from access to tools to access to agency.',
                eyebrow: 'Principles',
                summary:
                    'GalexC should help a person think and operate with more continuity. This page captures the underlying inspiration: not replacing judgment, but building an AI environment that respects constraints, keeps context intact, and rewards deliberate use.',
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
];

export const contentPages = navGroups.flatMap((group) => group.items);

export const contentsVariants: ContentsVariant[] = [
    {
        slug: 'ledger',
        href: '/contents',
        index: '01',
        name: 'Ledger',
        title: 'Contents as a ledger.',
        intro: 'The clearest expression of the idea. Flat, leader-driven, and restrained enough to feel inevitable rather than designed.',
    },
    {
        slug: 'marginalia',
        href: '/contents-marginalia',
        index: '02',
        name: 'Marginalia',
        title: 'Contents as marginalia.',
        intro: 'The same ledger lineage with a more authored voice. Short notes and offset group treatment make the page feel annotated rather than filed.',
    },
    {
        slug: 'register',
        href: '/contents-register',
        index: '03',
        name: 'Register',
        title: 'Contents as a register.',
        intro: 'The most archival variant. Stronger codes, firmer section rhythm, and serialized rows give the list a formal record-book cadence.',
    },
];

export function getNavCode(groupTitle: string, itemIndex: number) {
    return `${groupTitle.slice(0, 1).toUpperCase()}${String(itemIndex + 1).padStart(2, '0')}`;
}

export function getContentPage(slug: string) {
    return contentPages.find((page) => page.slug === slug);
}

export function getAdjacentContent(slug: string) {
    const index = contentPages.findIndex((page) => page.slug === slug);

    return {
        previous: index > 0 ? contentPages[index - 1] : null,
        next:
            index >= 0 && index < contentPages.length - 1
                ? contentPages[index + 1]
                : null,
    };
}
