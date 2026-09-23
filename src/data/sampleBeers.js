/**
 * Built-in sample set for demos and “Reset to demo”.
 * Source: bar tap board (tap_list_styles.csv). Not a second editable list —
 * bartenders maintain one live wheel list in localStorage only.
 *
 * Beer shape:
 * {
 *   id: string,          // stable id; never use array index
 *   number: number,      // bartender-assigned slot; unique; gaps allowed
 *   name: string,        // required
 *   brewery: string,
 *   style: string,
 *   abv: number | null,
 *   description: string,
 *   surprise: string     // optional fun payoff after a spin
 * }
 */

export const sampleBeers = [
  {
    id: "gaffel-kolsch",
    number: 1,
    name: "Kölsch",
    brewery: "Gaffel",
    style: "Kölsch",
    abv: 4.8,
    description:
      "Cologne specialty lager brewed with water, malt, and hops extract following a distinct family formula as well as the German Purity Law of 1516",
    surprise: "",
  },
  {
    id: "jever-pilsener",
    number: 2,
    name: "Pilsener",
    brewery: "Jever",
    style: "Pilsner",
    abv: 4.9,
    description:
      "Classic Northern German Pilsner with a dry, bitter, and refreshing finish",
    surprise: "",
  },
  {
    id: "sierra-nevada-oktoberfest",
    number: 3,
    name: "Oktoberfest",
    brewery: "Sierra Nevada",
    style: "Märzen / Oktoberfest",
    abv: 6.0,
    description:
      "Lightly toasted malt, herbal, crisp. Collaboration with Brauerei Gutmann. Authentic Märzen style",
    surprise: "",
  },
  {
    id: "spaten-oktoberfest-marzen",
    number: 4,
    name: "Oktoberfest Marzen",
    brewery: "Spaten",
    style: "Märzen / Oktoberfest",
    abv: 5.9,
    description: "Medium body, aromatic, traditional amber Marzen style beer",
    surprise: "",
  },
  {
    id: "half-acre-lagertown",
    number: 5,
    name: "Lagertown",
    brewery: "Half Acre",
    style: "Märzen / Oktoberfest",
    abv: 5.8,
    description:
      "Marzen (Oktoberfest) - Clean, malty, smooth, easy drinking crisp finish",
    surprise: "",
  },
  {
    id: "schilling-konstantin",
    number: 6,
    name: "Konstantin",
    brewery: "Schilling Beer Co.",
    style: "Märzen / Oktoberfest",
    abv: 5.0,
    description: "Light bodied Marzen style festbier",
    surprise: "",
  },
  {
    id: "ommegang-grande-tripel",
    number: 7,
    name: "Grande Tripel",
    brewery: "Ommegang",
    style: "Belgian Tripel",
    abv: 9.0,
    description: "Belgian Tripel - Spiced, complex, smooth golden ale",
    surprise: "",
  },
  {
    id: "allgauer-oberdorfer-festbier",
    number: 8,
    name: "Oberdorfer Festbier",
    brewery: "Allgäuer Brauhaus",
    style: "Festbier / Oktoberfest",
    abv: 5.4,
    description: "Festbier style. Bready, toasted malt, caramel accents",
    surprise: "",
  },
  {
    id: "paulaner-oktoberfest",
    number: 9,
    name: "Oktoberfest",
    brewery: "Paulaner Brauerei",
    style: "Märzen / Oktoberfest",
    abv: 5.8,
    description: "Amber Marzen style Okt-Fest",
    surprise: "",
  },
  {
    id: "lawsons-oktoberfest",
    number: 10,
    name: "Oktoberfest",
    brewery: "Lawson's Finest Liquids",
    style: "Märzen / Oktoberfest",
    abv: 6.5,
    description: "Marzen-style Oktoberfest beer",
    surprise: "",
  },
  {
    id: "shacksbury-cider-dry",
    number: 11,
    name: "Cider - Dry",
    brewery: "Shacksbury",
    style: "Cider",
    abv: 5.2,
    description: "Dry cider - crisp, clean, and refreshing",
    surprise: "",
  },
  // Slot 12 blank / crossed out on board — gap left intentional
  {
    id: "finback-class-act",
    number: 13,
    name: "Class Act",
    brewery: "Finback Brewery",
    style: "NEIPA / Hazy IPA",
    abv: 6.1,
    description: "IPA - New England / Hazy IPA",
    surprise: "",
  },
  {
    id: "allagash-haunted-house",
    number: 14,
    name: "Haunted House",
    brewery: "Allagash",
    style: "Black IPA",
    abv: 6.1,
    description: "Black IPA / Hoppy Dark Ale with coffee-like roasted notes",
    surprise: "",
  },
  {
    id: "grimm-tesseract",
    number: 15,
    name: "Tesseract",
    brewery: "Grimm",
    style: "Double IPA / DIPA",
    abv: 8.0,
    description:
      "Double IPA - New England style double dry hopped hazy DIPA",
    surprise: "",
  },
  {
    id: "weihenstephaner-hefeweissbier",
    number: 16,
    name: "Hefeweissbier",
    brewery: "Weihenstephaner",
    style: "Hefeweizen",
    abv: 5.4,
    description:
      "The gold standard of wheat beer from the world's oldest brewery. Fruity, banana & clove aromas",
    surprise: "",
  },
  {
    id: "grimm-no-hands-now",
    number: 17,
    name: "No Hands Now",
    brewery: "Grimm",
    style: "Sour / Berliner Weisse",
    abv: 3.8,
    description: "Sour Ale - Berliner Weisse style",
    surprise: "",
  },
  {
    id: "hacker-pschorr-oktoberfest-marzen",
    number: 18,
    name: "Oktoberfest Marzen",
    brewery: "Hacker-Pschorr",
    style: "Märzen / Oktoberfest",
    abv: 5.8,
    description: "Classic Munich Marzen style lager",
    surprise: "",
  },
  {
    id: "drekker-smol-blue-razz",
    number: 19,
    name: "Smol - Blue Razz",
    brewery: "Drekker Brewing",
    style: "Fruit Sour",
    abv: 6.0,
    description: "Sour Fruit Beer - Slushy style sour with raspberry notes",
    surprise: "",
  },
];
