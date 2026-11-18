// Demo-only catalogue and seed data. Nothing here touches a database.
// HomeCrew is a marketplace for ALL home services — plumbing is one category among many.
// Money is stored as integer paise.

export type CategoryIcon = "droplets" | "zap" | "sparkles" | "air-vent" | "hammer" | "paint-roller" | "bug";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  icon: CategoryIcon;
};

export type PricingType = "FIXED" | "STARTING" | "INSPECTION";

export type Service = {
  slug: string;
  categorySlug: string;
  title: string;
  short: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  pricePaise: number;
  pricingType: PricingType;
  durationMin: number;
  warrantyDays: number;
  rating: number;
  reviews: number;
  popular?: boolean;
};

export type VerificationStatus = "VERIFIED" | "PENDING" | "REJECTED";

export type Professional = {
  id: string;
  name: string;
  trade: string; // display label, e.g. "Plumber"
  phone: string;
  years: number;
  rating: number;
  jobsDone: number;
  skills: string[]; // service slugs
  area: string;
  verification: VerificationStatus;
  active: boolean;
  documents: { name: string; status: VerificationStatus }[];
  hours: { start: number; end: number; breakStart: number; breakEnd: number }; // local hours
  offDays: number[]; // 0 = Sunday
};

export const SERVICE_AREA = {
  city: "Ahmedabad",
  timezone: "Asia/Kolkata",
  zones: ["Navrangpura", "Satellite", "Bodakdev", "Vastrapur", "Prahlad Nagar", "Maninagar", "Thaltej", "Paldi"],
};

export const TRAVEL_BUFFER_MIN = 30;
export const HOLD_MINUTES = 10;
export const GST_RATE = 0.18;

export const categories: Category[] = [
  { slug: "plumbing", name: "Plumbing", blurb: "Leaks, taps, drains, flush tanks and fittings", icon: "droplets" },
  { slug: "electrical", name: "Electrical", blurb: "Switches, fans, lights and wiring faults", icon: "zap" },
  { slug: "cleaning", name: "Cleaning", blurb: "Deep cleaning for homes, kitchens and bathrooms", icon: "sparkles" },
  { slug: "appliances", name: "AC & Appliances", blurb: "AC service, washing machines, fridges and geysers", icon: "air-vent" },
  { slug: "carpentry", name: "Carpentry", blurb: "Furniture assembly, doors, locks and hinges", icon: "hammer" },
  { slug: "painting", name: "Painting", blurb: "Room painting, touch-ups and waterproofing", icon: "paint-roller" },
  { slug: "pest-control", name: "Pest Control", blurb: "Cockroaches, termites and bed bugs", icon: "bug" },
];

type S = Omit<Service, "rating" | "reviews"> & { rating?: number; reviews?: number };
const svc = (s: S): Service => ({ rating: 4.7, reviews: 300, ...s });

export const services: Service[] = [
  /* ── Plumbing ── */
  svc({
    slug: "pipe-leak-repair",
    categorySlug: "plumbing",
    title: "Pipe Leak Repair",
    short: "Locate and fix a visible leak in exposed piping.",
    description: "A verified plumber inspects the leaking section, replaces the faulty joint or pipe segment and pressure-tests the line before leaving.",
    inclusions: ["Leak inspection", "Joint or up to 1 m pipe replacement", "Pressure test", "Clean-up of work area"],
    exclusions: ["Concealed / in-wall pipe work", "Materials beyond basic sealants", "Tile breaking and re-fixing"],
    pricePaise: 34900,
    pricingType: "FIXED",
    durationMin: 60,
    warrantyDays: 30,
    rating: 4.8,
    reviews: 1243,
    popular: true,
  }),
  svc({
    slug: "tap-repair-replacement",
    categorySlug: "plumbing",
    title: "Tap Repair / Replacement",
    short: "Fix a dripping tap or install a new one.",
    description: "Repair washers and cartridges or replace a tap you've already purchased. Covers kitchen, bathroom and utility taps.",
    inclusions: ["Washer / cartridge replacement", "Installation of customer-provided tap", "Leak check"],
    exclusions: ["Cost of the new tap", "Concealed wall-mixer work"],
    pricePaise: 19900,
    pricingType: "FIXED",
    durationMin: 30,
    warrantyDays: 30,
    rating: 4.9,
    reviews: 2876,
  }),
  svc({
    slug: "drain-unclogging",
    categorySlug: "plumbing",
    title: "Drain Unclogging",
    short: "Clear blocked sinks, basins and floor traps.",
    description: "Mechanical clearing of a blocked drain using spring cables and plungers — no harsh chemicals.",
    inclusions: ["1 blocked outlet", "Mechanical clearing", "Flow test"],
    exclusions: ["Main sewer line blockage", "Pipe replacement"],
    pricePaise: 29900,
    pricingType: "FIXED",
    durationMin: 45,
    warrantyDays: 7,
    rating: 4.6,
    reviews: 1880,
  }),
  svc({
    slug: "flush-tank-repair",
    categorySlug: "plumbing",
    title: "Flush Tank Repair",
    short: "Fix running water, weak flush or broken buttons.",
    description: "Repair or replace flush tank internals for wall-mounted and concealed cisterns.",
    inclusions: ["Diagnosis", "Fill / flush valve service", "Button or lever fix"],
    exclusions: ["Spare parts (approved before use)", "Concealed cistern wall opening"],
    pricePaise: 24900,
    pricingType: "STARTING",
    durationMin: 45,
    warrantyDays: 30,
    reviews: 954,
  }),
  svc({
    slug: "shower-mixer-installation",
    categorySlug: "plumbing",
    title: "Shower & Mixer Installation",
    short: "Install shower heads, rods or exposed mixers.",
    description: "Neat installation of exposed mixers, shower arms, hand showers and diverters with alignment and leak check.",
    inclusions: ["1 mixer or shower set", "Teflon sealing", "Leak check"],
    exclusions: ["Concealed diverter work", "Product cost"],
    pricePaise: 44900,
    pricingType: "STARTING",
    durationMin: 60,
    warrantyDays: 30,
    reviews: 664,
  }),

  /* ── Electrical ── */
  svc({
    slug: "switch-socket-repair",
    categorySlug: "electrical",
    title: "Switch & Socket Repair",
    short: "Fix loose, sparking or dead switches and sockets.",
    description: "A verified electrician diagnoses the fault, replaces the switch or socket and tests the circuit safely.",
    inclusions: ["Up to 2 switches / sockets", "Fault diagnosis", "Safety test"],
    exclusions: ["Switchboard replacement", "Concealed wiring"],
    pricePaise: 14900,
    pricingType: "FIXED",
    durationMin: 30,
    warrantyDays: 30,
    rating: 4.8,
    reviews: 2210,
    popular: true,
  }),
  svc({
    slug: "fan-installation",
    categorySlug: "electrical",
    title: "Ceiling Fan Installation",
    short: "Install or replace a ceiling fan, including regulator.",
    description: "Secure mounting, wiring and balancing of a customer-provided ceiling fan with regulator connection.",
    inclusions: ["1 fan installation", "Regulator connection", "Balance check"],
    exclusions: ["Fan cost", "New wiring runs"],
    pricePaise: 24900,
    pricingType: "FIXED",
    durationMin: 45,
    warrantyDays: 30,
    reviews: 1405,
  }),
  svc({
    slug: "light-fitting-installation",
    categorySlug: "electrical",
    title: "Light Fitting Installation",
    short: "Mount ceiling lights, panels, wall lights or chandeliers.",
    description: "Installation of customer-provided light fittings with wiring checks. Priced by number and type of fittings.",
    inclusions: ["Up to 3 standard fittings", "Wiring check", "Clean-up"],
    exclusions: ["Fittings cost", "False-ceiling cutting"],
    pricePaise: 19900,
    pricingType: "STARTING",
    durationMin: 60,
    warrantyDays: 30,
    reviews: 880,
  }),
  svc({
    slug: "wiring-fault-inspection",
    categorySlug: "electrical",
    title: "Wiring Fault Inspection",
    short: "Trace tripping MCBs, short circuits and power loss.",
    description: "An inspection visit to trace the fault. You receive findings and a quotation, approved by you before any repair.",
    inclusions: ["Circuit testing", "MCB / RCCB check", "Written findings", "Repair quotation"],
    exclusions: ["Repairs (quoted separately)", "Civil work"],
    pricePaise: 29900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 512,
  }),

  /* ── Cleaning ── */
  svc({
    slug: "full-home-deep-cleaning",
    categorySlug: "cleaning",
    title: "Full Home Deep Cleaning",
    short: "Top-to-bottom deep clean of every room.",
    description: "A trained team deep-cleans floors, kitchen, bathrooms, windows and fixtures with professional equipment. Priced for a 1 BHK; larger homes are quoted upfront.",
    inclusions: ["All rooms, kitchen and bathrooms", "Machine floor scrubbing", "Windows and fixtures", "Team of 2–3"],
    exclusions: ["Sofa / carpet shampooing", "Wall washing"],
    pricePaise: 349900,
    pricingType: "STARTING",
    durationMin: 300,
    warrantyDays: 0,
    rating: 4.8,
    reviews: 3120,
    popular: true,
  }),
  svc({
    slug: "bathroom-deep-cleaning",
    categorySlug: "cleaning",
    title: "Bathroom Deep Cleaning",
    short: "Remove hard-water stains, grime and buildup.",
    description: "Intensive cleaning of tiles, fittings, mirrors and floor with stain removal and disinfection.",
    inclusions: ["1 bathroom", "Tile and grout scrubbing", "Fittings descaling", "Disinfection"],
    exclusions: ["Tile replacement", "Exhaust fan repair"],
    pricePaise: 59900,
    pricingType: "FIXED",
    durationMin: 90,
    warrantyDays: 0,
    reviews: 2105,
  }),
  svc({
    slug: "kitchen-deep-cleaning",
    categorySlug: "cleaning",
    title: "Kitchen Deep Cleaning",
    short: "Degrease cabinets, chimney exterior, tiles and slab.",
    description: "Thorough degreasing of the kitchen including cabinets inside-out, slab, tiles, sink and appliance exteriors.",
    inclusions: ["Cabinets inside & out", "Slab, sink and tiles", "Appliance exteriors"],
    exclusions: ["Chimney internal service", "Pest treatment"],
    pricePaise: 129900,
    pricingType: "FIXED",
    durationMin: 180,
    warrantyDays: 0,
    reviews: 1290,
  }),
  svc({
    slug: "sofa-cleaning",
    categorySlug: "cleaning",
    title: "Sofa & Upholstery Cleaning",
    short: "Shampoo and vacuum fabric sofas and chairs.",
    description: "Dry vacuuming followed by shampoo extraction for fabric sofas. Priced for a 3-seater.",
    inclusions: ["3-seater sofa", "Vacuuming", "Shampoo extraction"],
    exclusions: ["Leather treatment", "Stain removal guarantee"],
    pricePaise: 79900,
    pricingType: "STARTING",
    durationMin: 90,
    warrantyDays: 0,
    reviews: 760,
  }),
  svc({
    slug: "water-tank-cleaning",
    categorySlug: "cleaning",
    title: "Water Tank Cleaning",
    short: "Drain, scrub and disinfect overhead tanks.",
    description: "Mechanised cleaning of overhead or underground tanks up to 1000 litres, with disinfection.",
    inclusions: ["Draining and sludge removal", "Scrubbing", "Disinfection", "Refill"],
    exclusions: ["Tanks over 1000 L (quoted)", "Tank repair"],
    pricePaise: 79900,
    pricingType: "STARTING",
    durationMin: 120,
    warrantyDays: 0,
    rating: 4.6,
    reviews: 523,
  }),

  /* ── AC & Appliances ── */
  svc({
    slug: "ac-service",
    categorySlug: "appliances",
    title: "AC Service",
    short: "Jet-wash filters, coils and drain for split or window ACs.",
    description: "Foam-jet cleaning of filters, cooling coils and drain line with a performance check. One AC unit.",
    inclusions: ["Filter and coil jet wash", "Drain line flush", "Cooling performance check"],
    exclusions: ["Gas refill", "Spare parts"],
    pricePaise: 59900,
    pricingType: "FIXED",
    durationMin: 60,
    warrantyDays: 30,
    rating: 4.8,
    reviews: 4210,
    popular: true,
  }),
  svc({
    slug: "ac-repair",
    categorySlug: "appliances",
    title: "AC Repair",
    short: "Not cooling, leaking water or making noise?",
    description: "Diagnosis visit for split and window ACs. Any repair or gas refill is quoted and approved by you first.",
    inclusions: ["Full diagnosis", "Written findings", "Repair quotation"],
    exclusions: ["Repairs and parts (quoted)", "Gas refill (quoted)"],
    pricePaise: 39900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 1830,
  }),
  svc({
    slug: "washing-machine-repair",
    categorySlug: "appliances",
    title: "Washing Machine Repair",
    short: "Not spinning, draining or starting.",
    description: "Diagnosis for top- and front-load machines. Repairs and parts are quoted before any work.",
    inclusions: ["Diagnosis", "Minor fixes on the spot", "Repair quotation"],
    exclusions: ["Parts (quoted)", "Motor rewinding"],
    pricePaise: 34900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 1120,
  }),
  svc({
    slug: "refrigerator-repair",
    categorySlug: "appliances",
    title: "Refrigerator Repair",
    short: "Not cooling, frosting up or leaking.",
    description: "Diagnosis for single- and double-door refrigerators. Repairs and gas charging are quoted first.",
    inclusions: ["Diagnosis", "Thermostat and fan check", "Repair quotation"],
    exclusions: ["Parts and gas charging (quoted)"],
    pricePaise: 34900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 940,
  }),
  svc({
    slug: "geyser-installation",
    categorySlug: "appliances",
    title: "Geyser Installation",
    short: "Mount and connect a storage or instant geyser.",
    description: "Wall mounting, inlet/outlet connections and safety valve check for geysers up to 25 litres.",
    inclusions: ["Wall mounting", "Inlet & outlet connection", "Pressure relief valve check", "Test run"],
    exclusions: ["New electrical point", "Extra pipes and connectors"],
    pricePaise: 59900,
    pricingType: "FIXED",
    durationMin: 75,
    warrantyDays: 30,
    rating: 4.8,
    reviews: 742,
  }),

  /* ── Carpentry ── */
  svc({
    slug: "furniture-assembly",
    categorySlug: "carpentry",
    title: "Furniture Assembly",
    short: "Assemble beds, wardrobes, tables and shelves.",
    description: "Assembly of flat-pack furniture with alignment and wall anchoring where needed. Priced per standard item.",
    inclusions: ["1 standard item", "Alignment", "Wall anchoring (if needed)"],
    exclusions: ["Furniture cost", "Custom modifications"],
    pricePaise: 49900,
    pricingType: "STARTING",
    durationMin: 90,
    warrantyDays: 30,
    reviews: 690,
  }),
  svc({
    slug: "door-lock-repair",
    categorySlug: "carpentry",
    title: "Door & Lock Repair",
    short: "Fix jammed doors, broken handles and locks.",
    description: "Re-align sagging doors, replace handles or install a customer-provided lock.",
    inclusions: ["Door alignment", "Handle / lock fitting", "Hinge tightening"],
    exclusions: ["Lock cost", "Door replacement"],
    pricePaise: 29900,
    pricingType: "FIXED",
    durationMin: 60,
    warrantyDays: 30,
    reviews: 820,
    popular: false,
  }),
  svc({
    slug: "cabinet-hinge-repair",
    categorySlug: "carpentry",
    title: "Cabinet & Drawer Repair",
    short: "Fix sagging hinges, loose drawers and channels.",
    description: "Repair or replace hinges and drawer channels for kitchen and wardrobe cabinets.",
    inclusions: ["Up to 4 hinges or 2 channels", "Alignment"],
    exclusions: ["Hardware cost", "Board replacement"],
    pricePaise: 24900,
    pricingType: "STARTING",
    durationMin: 60,
    warrantyDays: 30,
    reviews: 410,
  }),

  /* ── Painting ── */
  svc({
    slug: "room-painting",
    categorySlug: "painting",
    title: "Room Painting",
    short: "Fresh interior paint for one room, walls and ceiling.",
    description: "Surface prep, putty touch-ups and two coats of interior emulsion. Priced for a standard bedroom; paint brand chosen by you.",
    inclusions: ["Furniture covering", "Minor putty work", "2 coats on walls & ceiling", "Clean-up"],
    exclusions: ["Paint cost (quoted)", "Texture / designer finishes"],
    pricePaise: 299900,
    pricingType: "STARTING",
    durationMin: 480,
    warrantyDays: 60,
    reviews: 380,
  }),
  svc({
    slug: "touch-up-painting",
    categorySlug: "painting",
    title: "Wall Touch-up",
    short: "Patch and repaint marks, cracks and small damage.",
    description: "Spot repairs for marks, small cracks and damp patches with colour-matched paint.",
    inclusions: ["Up to 3 patches", "Crack filling", "Colour matching"],
    exclusions: ["Full wall repaint", "Waterproofing"],
    pricePaise: 149900,
    pricingType: "FIXED",
    durationMin: 180,
    warrantyDays: 30,
    reviews: 220,
  }),
  svc({
    slug: "waterproofing-inspection",
    categorySlug: "painting",
    title: "Damp & Waterproofing Inspection",
    short: "Find the cause of damp walls and seepage.",
    description: "A specialist inspects damp patches and seepage, then quotes a waterproofing solution for your approval.",
    inclusions: ["Moisture inspection", "Written findings", "Treatment quotation"],
    exclusions: ["Treatment (quoted separately)"],
    pricePaise: 49900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 305,
  }),

  /* ── Pest control ── */
  svc({
    slug: "general-pest-control",
    categorySlug: "pest-control",
    title: "Cockroach & Ant Control",
    short: "Odourless gel and spray treatment for the whole home.",
    description: "Gel baiting and targeted spray for kitchens, bathrooms and living areas. Priced for a 1 BHK.",
    inclusions: ["Kitchen, bathrooms, rooms", "Odourless gel", "Safety guidance"],
    exclusions: ["Termite or bed bug treatment"],
    pricePaise: 99900,
    pricingType: "STARTING",
    durationMin: 60,
    warrantyDays: 30,
    rating: 4.7,
    reviews: 1560,
    popular: false,
  }),
  svc({
    slug: "termite-inspection",
    categorySlug: "pest-control",
    title: "Termite Inspection",
    short: "Check woodwork and walls for termite activity.",
    description: "Inspection of woodwork, frames and walls with a written report and treatment quote.",
    inclusions: ["Full-home inspection", "Written report", "Treatment quotation"],
    exclusions: ["Treatment (quoted separately)"],
    pricePaise: 49900,
    pricingType: "INSPECTION",
    durationMin: 60,
    warrantyDays: 0,
    reviews: 410,
  }),
  svc({
    slug: "bed-bug-treatment",
    categorySlug: "pest-control",
    title: "Bed Bug Treatment",
    short: "Two-visit treatment for beds, sofas and crevices.",
    description: "Targeted treatment of mattresses, furniture and crevices with a follow-up visit. Priced for a 1 BHK.",
    inclusions: ["2 visits", "Beds, sofas and crevices", "Aftercare guidance"],
    exclusions: ["Mattress replacement"],
    pricePaise: 149900,
    pricingType: "STARTING",
    durationMin: 120,
    warrantyDays: 30,
    reviews: 290,
  }),
];

const skillsOf = (...cats: string[]) => services.filter((s) => cats.includes(s.categorySlug)).map((s) => s.slug);
const verifiedDocs = [
  { name: "Aadhaar (ID)", status: "VERIFIED" as const },
  { name: "Trade certificate", status: "VERIFIED" as const },
  { name: "Police verification", status: "VERIFIED" as const },
];

export const professionals: Professional[] = [
  {
    id: "p1",
    name: "Ramesh Patel",
    trade: "Plumber",
    phone: "+91 98XXX 11021",
    years: 12,
    rating: 4.9,
    jobsDone: 1342,
    skills: skillsOf("plumbing"),
    area: "Navrangpura, Satellite, Vastrapur",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 9, end: 19, breakStart: 13, breakEnd: 14 },
    offDays: [0],
  },
  {
    id: "p2",
    name: "Imran Shaikh",
    trade: "Plumber & carpenter",
    phone: "+91 97XXX 40512",
    years: 8,
    rating: 4.8,
    jobsDone: 867,
    skills: [...skillsOf("plumbing", "carpentry")],
    area: "Bodakdev, Thaltej, Prahlad Nagar",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 10, end: 20, breakStart: 14, breakEnd: 15 },
    offDays: [2],
  },
  {
    id: "p3",
    name: "Suresh Yadav",
    trade: "Electrician & appliance tech",
    phone: "+91 99XXX 77310",
    years: 15,
    rating: 4.7,
    jobsDone: 1590,
    skills: skillsOf("electrical", "appliances"),
    area: "Maninagar, Paldi, Satellite",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 8, end: 17, breakStart: 12, breakEnd: 13 },
    offDays: [0],
  },
  {
    id: "p6",
    name: "Kavita Joshi",
    trade: "Cleaning team lead",
    phone: "+91 96XXX 30418",
    years: 6,
    rating: 4.9,
    jobsDone: 1104,
    skills: skillsOf("cleaning"),
    area: "All Ahmedabad zones",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 8, end: 19, breakStart: 13, breakEnd: 14 },
    offDays: [1],
  },
  {
    id: "p7",
    name: "Arjun Rao",
    trade: "AC technician",
    phone: "+91 95XXX 22871",
    years: 9,
    rating: 4.8,
    jobsDone: 2210,
    skills: skillsOf("appliances"),
    area: "Bodakdev, Thaltej, Vastrapur, Prahlad Nagar",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 9, end: 20, breakStart: 14, breakEnd: 15 },
    offDays: [3],
  },
  {
    id: "p8",
    name: "Mohan Prajapati",
    trade: "Carpenter & painter",
    phone: "+91 94XXX 66120",
    years: 14,
    rating: 4.7,
    jobsDone: 980,
    skills: skillsOf("carpentry", "painting"),
    area: "Navrangpura, Paldi, Maninagar",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 9, end: 18, breakStart: 13, breakEnd: 14 },
    offDays: [0],
  },
  {
    id: "p9",
    name: "Nilesh Bhatt",
    trade: "Pest control specialist",
    phone: "+91 93XXX 51077",
    years: 7,
    rating: 4.8,
    jobsDone: 760,
    skills: skillsOf("pest-control"),
    area: "All Ahmedabad zones",
    verification: "VERIFIED",
    active: true,
    documents: verifiedDocs,
    hours: { start: 9, end: 18, breakStart: 13, breakEnd: 14 },
    offDays: [0],
  },
  {
    id: "p4",
    name: "Vikram Solanki",
    trade: "Electrician",
    phone: "+91 90XXX 25588",
    years: 4,
    rating: 0,
    jobsDone: 0,
    skills: ["switch-socket-repair", "fan-installation"],
    area: "Satellite, Prahlad Nagar",
    verification: "PENDING",
    active: false,
    documents: [
      { name: "Aadhaar (ID)", status: "VERIFIED" },
      { name: "Trade certificate", status: "PENDING" },
      { name: "Police verification", status: "PENDING" },
    ],
    hours: { start: 9, end: 18, breakStart: 13, breakEnd: 14 },
    offDays: [0],
  },
  {
    id: "p5",
    name: "Deepak Rathod",
    trade: "Painter",
    phone: "+91 93XXX 61904",
    years: 6,
    rating: 0,
    jobsDone: 0,
    skills: ["room-painting", "touch-up-painting"],
    area: "Maninagar",
    verification: "PENDING",
    active: false,
    documents: [
      { name: "Aadhaar (ID)", status: "PENDING" },
      { name: "Trade certificate", status: "PENDING" },
    ],
    hours: { start: 9, end: 18, breakStart: 13, breakEnd: 14 },
    offDays: [0],
  },
];

export const DEMO_CUSTOMER = { id: "c1", name: "Aarav Mehta", email: "aarav@example.com", phone: "+91 98XXX 00000" };
export const DEMO_PROFESSIONAL_ID = "p1";

export const testimonials = [
  { name: "Neha S.", area: "Satellite", text: "Booked an AC service at 9 pm, the technician arrived next morning on the dot. Scanned the QR, cleaned the unit, sent photos. Super clean.", rating: 5 },
  { name: "Karan D.", area: "Bodakdev", text: "The plumber found a corroded valve and the extra cost needed my approval in the app before he went ahead. No surprises on the bill.", rating: 5 },
  { name: "Fatima K.", area: "Navrangpura", text: "Deep cleaning, pest control and a fan installation — all booked in one place, all saved in my home passport.", rating: 4 },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
