export const phases = [
  { id: "months", label: "Pre pre pre", eyebrow: "MONTHS BEFORE", title: "Review and Preparation", description: "Bookings, decisions, travel, and anything that needs to arrive early." },
  { id: "week", label: "Pre pre", eyebrow: "THE WEEK BEFORE", title: "Lock In", description: "Finish shopping, prepare outfits, organize supplies, and set up the house." },
  { id: "thu", label: "Thursday", eyebrow: "MAY 6", title: "Pack and get ready", description: "Final packing, bridal mehendi, and family arrivals." },
  { id: "fri", label: "Friday", eyebrow: "MAY 7", title: "Beginnings", description: "Food, mehendi, family time, and the first night at home." },
  { id: "sat", label: "Saturday", eyebrow: "MAY 8", title: "Grahashanti, Haldi, Vidhi, and hotel check in", description: "Grahashanti, Haldi, Vidhi, hotel check in, and the hospitality room." },
  { id: "sun", label: "Sunday", eyebrow: "MAY 9 · 3:00 AM", title: "Wedding morning", description: "The wedding day timeline starts here. Add the remaining schedule as it is confirmed." },
];

const task = (id, title, status = "Not started", detail = "", time = "", owner = "", location = "") =>
  ({ id, title, status, detail, time, owner, location });

export const initialDays = {
  months: {
    dateLabel: "Now through the month before",
    groups: [
      { title: "Bookings and travel", items: [
        task("m1", "Book the pandit / maharaj", "Not started", "Ask for the exact puja samagri list before buying ritual items.", "", "Pappa (Anantkumar)"),
        task("m2", "Book the bridal mehendi artist for Thursday afternoon", "Not started", "This is a different artist from Friday's mehendi artist."),
        task("m3", "Confirm Reshma Aunty for Friday mehendi", "In progress", "Suniti, Harsha, and Kinjal. Ask for extra cones for Saturday night.", "", "Mommy (Harsha)"),
        task("m4", "Book the Vernon Hills hotel for Friday night", "Not started", "Compare La Quinta and Holiday Inn. Estimate 3 to 5 rooms for around 15 non family guests. Current guest notes separately estimate 8 people / 2 rooms, so confirm the count."),
        task("m5", "Book the Naperville hotel and hospitality room", "Not started", "Ask about the group rate, early check in Saturday, late check out, and the large hospitality room."),
        task("m6", "Decide and reserve rental cars", "Not started", "Include Pappa's car for Saturday's drive and any guest rentals. Track pickup and return plans."),
        task("m7", "Collect guest arrival times and pickup needs", "In progress", "Thursday arrivals may need a pickup. Add names, arrival times, and a driver once known."),
      ]},
      { title: "Food decisions", items: [
        task("m8", "Finalize the Pita Inn Saturday lunch order", "Not started", "Confirm the exact guest count, platters, extra pita, sauces / dips, falafel, and sides. Original planning note says to lock this around February."),
        task("m9", "Choose Saturday breakfast", "Waiting", "Reshma Aunty bulk cooking or a South Indian restaurant."),
        task("m10", "Choose Friday dinner", "Waiting", "Dal baati plus another affordable cuisine option near Vernon Hills. Confirm restaurant and pickup."),
        task("m11", "Choose Saturday pizza dinner", "Waiting", "Lou Malnati's deep dish or Domino's. Confirm pizza count and sides."),
        task("m12", "Confirm Cava for Friday lunch", "Not started", "Plan for approximately 15 people and confirm the pickup time."),
      ]},
      { title: "Items, traditions, and performances", items: [
        task("m13", "Decide what decor and supplies need to come from India", "Waiting", "Coordinate with family flying in. Confirm everything has arrived before setup week."),
        task("m14", "Confirm the two separate puja lists with the pandit", "Not started", "Saturday Grahashanti items are separate from the wedding ceremony items packed Thursday."),
        task("m15", "Lock dance songs and choreography", "In progress", "Family dance, friends dance, and big family dance. Keep practicing in the weeks before."),
        task("m16", "Confirm any fun traditions planned during wedding or pre wedding", "Not started", "Details still need to be added to Saturday's hospitality room plan."),
      ]},
    ],
  },
  week: {
    dateLabel: "Saturday, May 1 to Wednesday, May 5",
    groups: [
      { title: "House setup and shopping", items: [
        task("w1", "Have all decor bought, received, and at the house", "Not started", "Check entry / living room decor, Mandav / Grahashanti decor, Haldi decor, and the mehendi corner."),
        task("w2", "Complete decor and logistics setup", "Not started", "Setup window runs Saturday through Wednesday. Store Mandav / Grahashanti decor in the master bedroom."),
        task("w3", "Buy or gather floor seating supplies", "Not started", "Tarps, cushiony blankets, mattresses for approximately 14 sleepers, blankets, and pillows."),
        task("w4", "Buy chai dispensers and chai supplies", "Not started", "Tea, milk, sugar, and masala for Friday chai and Saturday breakfast."),
        task("w5", "Buy Indian snacks", "Not started", "Khadi biscuits, chevdo, and an assortment of snacks from Patel Brothers, or coordinate with family flying from India."),
        task("w6", "Buy hospitality room supplies", "Not started", "Water bottles, fruit, chips / snacks, plates, napkins, and trash bags."),
        task("w7", "Buy drinks for Friday evening", "Not started", "Lassi and sodas."),
      ]},
      { title: "Clothes, puja, and readiness", items: [
        task("w8", "Pack family clothes and accessories beforehand for wedding weekend", "Not started", "Friday mehendi, Saturday Grahashanti, Haldi, and Vidhi / travel outfits."),
        task("w9", "Prepare the Saturday Grahashanti items", "Not started", "Use the pandit's confirmed list. Keep these separate from wedding ceremony puja items."),
        task("w10", "Prepare and group the wedding ceremony puja items", "Not started", "These will be packed into the cars Thursday night."),
        task("w11", "Check sleeping arrangements for around 14 people", "Not started", "Confirm mattresses, blankets, pillows, and where everyone will sleep."),
        task("w12", "Confirm food orders, pickup people, and times", "Not started", "Cava, Friday dinner, Pita Inn, and Saturday pizza."),
      ]},
    ],
  },
  thu: {
    dateLabel: "Thursday, May 6",
    groups: [
      { title: "Timeline", items: [
        task("t1", "Bridal mehendi artist arrives", "Not started", "Afternoon. This is not Friday's mehendi artist.", "Afternoon", "TBD", "Gohil home"),
        task("t2", "Pack wedding ceremony puja items into the car", "Not started", "Keep separate from Saturday's Grahashanti puja items.", "Evening", "Everyone", "Gohil home"),
        task("t3", "Pack bags into cars for Naperville hotel", "Not started", "Saturday night outfit, wedding clothes and accessories, night dress, Sunday and Monday clothes, and toiletries.", "Evening", "Everyone", "Gohil home"),
        task("t4", "Confirm Thursday family arrivals and pickup", "In progress", "A couple of family members may arrive. Original note says pickup may not be required, so confirm flights and driver.", "Night", "TBD", "Airport / home"),
      ]},
      { title: "Packing checklist", items: [
        task("tp1", "Wedding clothes and accessories"),
        task("tp2", "Saturday night outfit and night dress"),
        task("tp3", "Sunday and Monday clothes and toiletries"),
        task("tp5", "Wedding ceremony puja bag packed in car"),
        task("tp6", "Chargers, essentials, and any travel documents"),
      ]},
    ],
  },
  fri: {
    dateLabel: "Friday, May 7",
    groups: [
      { title: "Schedule", items: [
        task("f1", "Family breakfast at home", "Planned", "Around 14 people.", "8:00 to 9:00 AM", "Mommy (Harsha)", "Gohil home"),
        task("f2", "Pick up Cava for lunch", "Not started", "Approximately 15 people. Confirm order and pickup time.", "11:30 AM", "Kush", "Cava"),
        task("f3", "Lunch at home", "Planned", "Approximately 14 to 15 people.", "12:00 to 1:00 PM", "Everyone", "Gohil home"),
        task("f4", "Everyone gets ready", "Planned", "", "2:00 to 4:00 PM", "Everyone", "Gohil home"),
        task("f5", "Continue decor setup", "Planned", "Coordinate around the hotel run and getting ready.", "2:00 to 4:00 PM", "Men of the house", "Gohil home"),
        task("f6", "Take non family guests to Vernon Hills hotel and help check in", "Not started", "Confirm final guest count and room count. This is not the Naperville hotel.", "3:00 PM", "Kush", "Vernon Hills hotel"),
        task("f7", "Set out chai and dry snacks", "Planned", "Chai dispensers should be ready. Use khadi biscuits, chevdo, and Indian snacks.", "4:00 PM", "Mommy (Harsha)", "Gohil home"),
        task("f8", "Pick up Friday dinner", "Not started", "Dal baati plus the other selected cuisine. Restaurant still needs confirmation.", "5:30 PM", "Kush", "Restaurant TBD"),
        task("f9", "Friday mehendi", "Planned", "Reshma Aunty. Water and snacks ready. Suniti, Harsha, and Kinjal.", "5:45 to 7:00 PM", "Reshma Aunty", "Kitchen dining table"),
        task("f10", "Lay tarps and cushiony blankets", "Planned", "Can be done earlier. Floor seating, elders can use the dining table.", "Before dinner", "Kush", "Gohil home"),
        task("f11", "Family dinner on the floor", "Planned", "Original timeline adjusted to 6:30 PM to allow for food pickup. Change if needed.", "6:30 to 8:00 PM", "Everyone", "Living room"),
        task("f12", "Clean up and fold tarps", "Planned", "", "8:30 PM", "Kush", "Gohil home"),
        task("f13", "Mingling, lassi / sodas, and casual dance practice", "Planned", "These can overlap. Original note also says Kush may be out on errands.", "8:30 to 11:00 PM", "Everyone", "Gohil home"),
        task("f14", "Set up mattresses and blankets", "Planned", "For approximately 14 people sleeping at home.", "11:00 PM", "Men of the house", "Gohil home"),
        task("f15", "Sleep", "Planned", "", "11:30 PM", "Everyone", "Gohil home"),
      ]},
      { title: "Meals", items: [
        task("fm1", "Breakfast", "Planned", "Home cooked, approximately 14 people.", "8:00 AM", "", "Gohil home"),
        task("fm2", "Lunch, Cava", "Decided", "Approximately 15 people. Kush picks it up around 11:30 AM.", "12:00 PM", "Kush", "Gohil home"),
        task("fm3", "Chai and dry snacks", "Decided", "Khadi biscuits, chevdo, and Indian snack assortment.", "4:00 PM", "Mommy (Harsha)", "Gohil home"),
        task("fm4", "Dinner, dal baati plus second cuisine option", "Waiting", "Confirm the restaurant, exact order, and pickup.", "6:30 PM", "Kush", "Gohil home"),
        task("fm5", "Late drinks", "Waiting", "Lassi and sodas.", "8:30 PM", "", "Gohil home"),
      ]},
    ],
  },
  sat: {
    dateLabel: "Saturday, May 8",
    groups: [
      { title: "Morning rituals at home", items: [
        task("s1", "Unpack Grahashanti items and decor", "Planned", "Items should already be stored in the master bedroom.", "6:30 AM", "Men of the house", "Gohil home"),
        task("s2", "Breakfast, chai and nashto", "Waiting", "Choose Reshma Aunty bulk cooking or a South Indian restaurant.", "7:00 to 8:00 AM", "Mommy (Harsha)", "Gohil home"),
        task("s3", "Pandit / maharaj arrives", "Not started", "Confirm booking and meal arrangements.", "7:45 AM", "Pappa (Anantkumar)", "Gohil home"),
        task("s4", "Grahashanti / Mandava Muhurat", "Planned", "Family only. Confirm the final ritual items with the pandit.", "8:00 to 10:00 AM", "Everyone", "Master bedroom / home"),
        task("s5", "Set up Haldi decor", "Planned", "Can overlap with Grahashanti setup.", "8:00 to 10:00 AM", "Men of the house", "Gohil home"),
        task("s6", "Haldi", "Planned", "", "10:00 to 11:00 AM", "Everyone", "Gohil home"),
      ]},
      { title: "Lunch and Vidhi", items: [
        task("s7", "Pick up Pita Inn lunch", "Not started", "Platters, extra pita, sauces / dips, falafel, and sides. Hitesh, Deval, or Hiren can pick up.", "11:00 AM", "Hitesh Mama", "Pita Inn"),
        task("s8", "Set up tarps and cushiony blankets", "Planned", "", "11:30 AM", "Kush", "Gohil home"),
        task("s9", "Lunch buffet", "Planned", "Buffet on living room island. Floor seating, with elders at the dining table.", "11:45 AM to 1:30 PM", "Everyone", "Gohil home"),
        task("s10", "Clean up and put away floor seating", "Planned", "", "1:30 PM", "Kush", "Gohil home"),
        task("s11", "Vidhi, goodbye ritual for Suniti", "Planned", "Leave space for this emotional family moment.", "2:00 to 3:00 PM", "Everyone", "Gohil home"),
      ]},
      { title: "Drive to Naperville and evening", items: [
        task("s12", "Suniti leaves home", "Not started", "Original notes conflict slightly on timing. Confirm departure time.", "Around 2:30 to 3:00 PM", "Mommy (Harsha)", "Gohil home to Naperville"),
        task("s13", "Drive family and guests to Naperville", "Planned", "Kush in black Model Y. Pappa in rental. Mommy drives Suniti in white Model 3. Confirm final passenger / car assignments.", "Around 3:00 PM", "Everyone", "Naperville"),
        task("s14", "Check everyone into the Naperville hotel", "Not started", "Ask for early check in and late check out.", "4:00 PM", "Kush", "Naperville hotel"),
        task("s15", "Set up hospitality room", "Planned", "Water bottles, fruit, snacks, plates / napkins. Keep the door ajar.", "5:00 PM", "Kush", "Naperville hotel"),
        task("s16", "Pick up pizza", "Waiting", "Choose Lou Malnati's deep dish or Domino's. Confirm count and sides.", "5:30 PM", "Kush + Rucha", "Restaurant TBD"),
        task("s17", "Pizza dinner", "Planned", "", "6:30 to 8:00 PM", "Everyone", "Hospitality room"),
        task("s18", "Dance practice", "Planned", "Can overlap with other hospitality room activities.", "7:00 to 9:00 PM", "Everyone", "Hospitality room"),
        task("s19", "Extra mehendi cones", "Planned", "For anyone who wants mehendi. Cones from Reshma Aunty, not the bridal artist.", "7:00 to 9:00 PM", "Reshma Aunty", "Hospitality room"),
        task("s20", "Family envelope ritual / tradition", "Not started", "Add the exact plan and timing when confirmed.", "", "TBD", "Hospitality room"),
      ]},
      { title: "Meals", items: [
        task("sm1", "Breakfast, chai and nashto", "Waiting", "Reshma Aunty bulk cooking or South Indian restaurant.", "7:00 AM", "Mommy (Harsha)", "Gohil home"),
        task("sm2", "Lunch, Pita Inn", "Decided", "Platters, extra breads, sauces / dips, falafel, sides / salads. Confirm final count and order.", "11:45 AM", "Hitesh Mama", "Gohil home"),
        task("sm3", "Hospitality room snacks", "Planned", "Indian snacks from Patel Brothers, plus water bottles and fruit.", "5:00 PM", "Kush", "Hospitality room"),
        task("sm4", "Dinner, pizza", "Waiting", "Lou Malnati's or Domino's. Add pizza count and sides after deciding.", "6:30 PM", "Kush + Rucha", "Hospitality room"),
      ]},
      { title: "Puja checklist", items: [
        task("sp1", "Grahashanti: confirmed samagri list from pandit"),
        task("sp3", "Grahashanti: rice, kumkum, haldi, sandalwood (confirm)"),
        task("sp4", "Grahashanti: ghee, camphor, incense, diyas (confirm)"),
        task("sp5", "Grahashanti: flowers / garlands (confirm)"),
      ]},
    ],
  },
  sun: {
    dateLabel: "Sunday, May 9 · starts at 3:00 AM",
    groups: [
      { title: "Wedding morning", items: [
        task("u1", "Start the wedding day timeline", "Not started", "The source workbook only has a 3:00 AM placeholder. Add the ceremony schedule, preparation times, travel, and assigned people as details are confirmed.", "3:00 AM", "TBD", "Naperville"),
        task("u2", "Confirm wedding ceremony puja bag is ready", "Not started", "Keep it separate from Saturday's Grahashanti items.", "", "Everyone", "Naperville"),
        task("u3", "Confirm wedding clothes, accessories, and essentials are accessible", "Not started", "Packed Thursday night for Naperville.", "", "Everyone", "Naperville"),
      ]},
    ],
  },
};

export const statusOptions = ["Not started", "In progress", "Waiting", "Planned", "Decided", "Done"];
