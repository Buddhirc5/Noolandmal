// Short, factual guides answering real search questions. Keep figures in sync with the catalogue.
export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { h: string; p: string[] }[];
}

export const guides: Guide[] = [
  {
    slug: "custom-dress-cost-sri-lanka",
    title: "How much does a custom dress cost in Sri Lanka?",
    description: "A practical breakdown of made-to-order dress prices in Sri Lanka — what you pay for fabric, design details, size and timing.",
    updated: "2026-11-24",
    sections: [
      {
        h: "The short answer",
        p: [
          "At Nool & Mal, a tailored saree blouse starts around LKR 5,500, a hand-crocheted top around LKR 6,500 and an everyday cotton frock around LKR 8,900. Party and occasion gowns usually land between LKR 15,000 and LKR 45,000, and heavily embellished bridal sets start from about LKR 58,000.",
          "Prices elsewhere in Sri Lanka vary with the tailor's experience, but the same factors drive them everywhere.",
        ],
      },
      {
        h: "What makes up the price",
        p: [
          "Fabric is the biggest variable. Cotton and crepe are the most affordable; satin, silk blends, brocade and hand-finished sequin net cost more — sometimes LKR 5,000–9,000 more for the same design.",
          "Details are priced by the work they take: a lace hem trim adds a few thousand rupees; bodice beadwork or hand embroidery can add LKR 6,000–8,500. Lining is priced by the metre of fabric a design uses.",
          "Larger sizes need more fabric, and a date sooner than a week usually carries a rush fee (ours is 20%).",
        ],
      },
      {
        h: "How to keep it within budget",
        p: [
          "Choose one statement detail instead of several. Cotton or crepe in a rich colour looks expensive without the satin price. And give yourself one to three weeks so you avoid rush fees.",
          "Our customiser shows the price change of every option before you choose it, so you can try combinations and see the total instantly.",
        ],
      },
    ],
  },
  {
    slug: "how-long-does-tailoring-take",
    title: "How long does tailoring take for a made-to-order dress?",
    description: "Typical timelines for custom dresses in Sri Lanka, from quote to fitting — and how to plan for weddings and homecomings.",
    updated: "2026-11-24",
    sections: [
      {
        h: "Typical timeline",
        p: [
          "Plan for one to three weeks from your measurement appointment to a finished dress. Simple frocks and blouses can be ready in about a week; detailed gowns and bridal sets take closer to three.",
          "Before that, allow a day or two for the quotation and for paying the advance, and book your measurement slot early — busy wedding months fill up.",
        ],
      },
      {
        h: "What happens in those weeks",
        p: [
          "After measuring, fabric is cut and the dress is sewn. Then comes a fitting, small adjustments and finishing (hems, buttons, embellishment). You can follow each step on your order page.",
        ],
      },
      {
        h: "Planning for an event",
        p: [
          "For weddings, homecomings and engagements, start 5–6 weeks before the date. That leaves time for a second fitting if needed. If you're short on time, choose your date in the customiser — it tells you immediately if a rush fee applies or if the date is too tight.",
        ],
      },
    ],
  },
];
