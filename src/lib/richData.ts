export interface RichSpotInfo {
  overview: string;
  whyVisit: string[];
  history: string;
  foodHighlights: string[];
  insiderTips: string[];
  walkingTimes: Record<string, string>;
}

export const RICH_DATA: Record<string, RichSpotInfo> = {
  "ponce-city-market": {
    overview: "Ponce City Market (PCM) is one of the Atlanta BeltLine's flagship destinations. Located inside the restored historic Sears, Roebuck & Co. building, PCM combines restaurants, retail, offices, and rooftop attractions.",
    whyVisit: [
      "Dozens of restaurants",
      "Local and national retailers",
      "Rooftop amusement park",
      "Skyline views",
      "Easy BeltLine access"
    ],
    history: "Originally constructed in 1926 as a Sears distribution center, the building was once the largest brick structure in the southeastern US. Redeveloped by Jamestown in 2014.",
    foodHighlights: ["Bellina Alimentari", "Botiwalla", "El Super Pan", "Hop's Chicken", "Five Daughters Bakery", "Minero"],
    insiderTips: [
      "Visit before 11:00 AM for the smallest crowds.",
      "Skyline Park is best visited around sunset.",
      "Weekday mornings are ideal for remote work."
    ],
    walkingTimes: {
      "Historic Fourth Ward Park": "2 minutes",
      "New Realm Brewing": "3 minutes",
      "Krog Street Market": "15 minutes"
    }
  },
  "krog-street-market": {
    overview: "Krog Street Market is a historic food hall located directly on the Eastside Trail. Originally built in the 1920s as a warehouse, it is now one of Atlanta's most popular culinary destinations.",
    whyVisit: [
      "Locally owned restaurants",
      "Intimate marketplace atmosphere",
      "Gateway to Inman Park",
      "Great people watching"
    ],
    history: "Originally constructed as a warehouse for Atlanta Stove Works. Redeveloped and reopened as a public market in 2014.",
    foodHighlights: ["Fred's Meat & Bread", "Gu's Dumplings", "Ticonderoga Club", "Little Tart Bakeshop", "Superica"],
    insiderTips: [
      "Visit before noon on weekends to avoid long food lines.",
      "The nearby Krog Street Tunnel features constantly changing street art.",
      "The BeltLine patio is perfect for people-watching."
    ],
    walkingTimes: {
      "Krog Street Tunnel": "1 minute",
      "Atlanta Dairies": "3 minutes",
      "Ponce City Market": "15 minutes"
    }
  }
};

  "historic-fourth-ward-park": {
    overview: "Historic Fourth Ward Park is a 17-acre urban oasis and a cornerstone of the Eastside Trail. It features a stunning retention pond, splash pad, and the city's premier skate park.",
    whyVisit: [
      "Iconic retention pond & waterfall",
      "World-class skate park",
      "Outdoor amphitheater",
      "Modern playground & splash pad",
      "Direct Eastside Trail access"
    ],
    history: "Opened in 2011, this park was the first major park completed as part of the BeltLine project. It transformed a blighted industrial area into a sustainable greenspace that manages stormwater for the neighborhood.",
    foodHighlights: ["Ponce City Market (adjacent)", "New Realm Brewing (adjacent)", "Two Urban Licks (nearby)"],
    insiderTips: [
      "The splash pad is a local favorite for families in the summer.",
      "The skate park was designed with input from Tony Hawk.",
      "The pond area is one of the most photographed spots in Atlanta."
    ],
    walkingTimes: {
      "Ponce City Market": "1 minute",
      "Old Fourth Ward Skatepark": "5 minutes",
      "Krog Street Market": "12 minutes"
    }
  },
  "piedmont-park": {
    overview: "Piedmont Park is Atlanta's premier central park, located at the northern terminus of the Eastside Trail. It spans 189 acres and offers breathtaking views of the Midtown skyline.",
    whyVisit: [
      "Midtown skyline views",
      "Active Oval for sports",
      "Lake Clara Meer",
      "Atlanta Botanical Garden (adjacent)",
      "Weekend farmers markets"
    ],
    history: "The park has been a central part of Atlanta life since 1887. It was the site of the 1895 Cotton States and International Exposition.",
    foodHighlights: ["Park Tavern", "Willy's Mexicana Grill", "Midtown dining (adjacent)"],
    insiderTips: [
      "The 'Active Oval' is the best place for a pick-up game of soccer or frisbee.",
      "The Saturday morning Green Market is a must-visit for local produce.",
      "The dog park is one of the largest and most active in the city."
    ],
    walkingTimes: {
      "BeltLine Eastside Trailhead": "1 minute",
      "Atlanta Botanical Garden": "5 minutes",
      "Midtown MARTA Station": "15 minutes"
    }
  },
  "westside-park": {
    overview: "Westside Park is Atlanta's largest park, spanning 280 acres. It features the massive Bellwood Quarry, which has been transformed into a scenic reservoir.",
    whyVisit: [
      "Bellwood Quarry reservoir",
      "Expansive hiking & biking trails",
      "Grand overlook views",
      "Modern playground facilities"
    ],
    history: "Formerly the Bellwood Quarry, this site was transformed into a massive reservoir and park, opening its first phase in 2021. It now serves as the city's primary emergency water backup.",
    foodHighlights: ["Westside Provisions (nearby)", "Bankhead dining (nearby)"],
    insiderTips: [
      "The overlook at the quarry is the park's most iconic feature.",
      "The trails are wide and perfect for long-distance cycling.",
      "Sunset at the quarry reservoir is spectacular."
    ],
    walkingTimes: {
      "Proctor Creek Greenway": "2 minutes",
      "Bankhead MARTA Station": "10 minutes",
      "Westside Provisions": "20 minutes"
    }
  }
