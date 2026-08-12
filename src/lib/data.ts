export type Spot = {
  id: string;
  name: string;
  category: string;
  area: string;
  loved: number;
  rating: number;
  ratings: string;
  openTill: string;
  badges: string[];
  img: string;
  imgs: string[];
  price: number;
  wasPrice: number;
  lng: number;
  lat: number;
  address: string;
  walk: string;
  reservation_link?: string;
  website?: string;
};

// ponytail: real data sourced from AJC, Yelp, and official sites
export const spots: Spot[] = [
  {
    "id": "historic-fourth-ward-park",
    "name": "Historic Fourth Ward Park",
    "category": "Parks",
    "area": "O4W",
    "loved": 99,
    "rating": 4.9,
    "ratings": "3,402",
    "openTill": "11p",
    "badges": ["TRAIL PICK"],
    "img": "https://images.unsplash.com/photo-1585938389612-a552a28d6914?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1585938389612-a552a28d6914?w=900&q=60"],
    "price": 0,
    "wasPrice": 0,
    "lng": -84.3664,
    "lat": 33.7716,
    "address": "680 Dallas St NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://beltline.org/parks-trails/historic-fourth-ward-park/"
  },
  {
    "id": "piedmont-park",
    "name": "Piedmont Park",
    "category": "Parks",
    "area": "Midtown",
    "loved": 99,
    "rating": 4.8,
    "ratings": "12,504",
    "openTill": "11p",
    "badges": [],
    // Bundled from the prior Wikimedia sources so the native app does not depend on an external image request.
    "img": "/images/piedmont-park-skyline.jpg",
    "imgs": ["/images/piedmont-park-skyline.jpg", "/images/piedmont-park-skyline-2.jpg"],
    "price": 0,
    "wasPrice": 0,
    "lng": -84.3725,
    "lat": 33.7831,
    "address": "1320 Monroe Dr NE, Atlanta",
    "walk": "At the North end of Eastside Trail",
    "website": "https://piedmontpark.org/"
  },
  {
    "id": "westside-park",
    "name": "Westside Park",
    "category": "Parks",
    "area": "Westside",
    "loved": 97,
    "rating": 4.9,
    "ratings": "1,892",
    "openTill": "11p",
    "badges": ["NEW"],
    "img": "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=900&q=60"],
    "price": 0,
    "wasPrice": 0,
    "lng": -84.4361,
    "lat": 33.7781,
    "address": "1660 Johnson Rd NW, Atlanta",
    "walk": "On the Westside Trail",
    "website": "https://beltline.org/parks-trails/westside-park/"
  },
  {
    "id": "arden-s-garden",
    "name": "Arden's Garden",
    "category": "Juice Bars & Smoothies",
    "area": "Midtown",
    "loved": 95,
    "rating": 4.5,
    "ratings": "361",
    "openTill": "6p",
    "badges": ["LOCAL FAVE"],
    "img": "https://www.ardensgarden.com/cdn/shop/files/mon_store_front.jpg?v=1718999580",
    "imgs": ["https://www.ardensgarden.com/cdn/shop/files/mon_store_front.jpg?v=1718999580"],
    "price": 60,
    "wasPrice": 80,
    "lng": -84.368399,
    "lat": 33.781376,
    "address": "985 Monroe Drive NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://order.tapmango.com/merchant/683384c4-b6a6-4f8e-ada5-ea94a9004064/order/location",
    "website": "https://www.ardensgarden.com/pages/piedmont-park"
  },
  {
    "id": "mediterranean-grill",
    "name": "Mediterranean Grill",
    "category": "Mediterranean",
    "area": "Midtown",
    "loved": 81,
    "rating": 4.3,
    "ratings": "2025",
    "openTill": "11p",
    "badges": ["TRAIL PICK"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/WnnxoVh5ZrQVxNJJ606Ymw/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/WnnxoVh5ZrQVxNJJ606Ymw/348s.jpg"],
    "price": 70,
    "wasPrice": 100,
    "lng": -84.36833,
    "lat": 33.781347,
    "address": "985 Monroe Drive NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://mediterraneangrill.com/"
  },
  {
    "id": "three-peaches-gelato-and-coffee",
    "name": "Three Peaches Gelato and Coffee",
    "category": "Gelato and Coffee Shop",
    "area": "Midtown",
    "loved": 88,
    "rating": 4.7,
    "ratings": "1024",
    "openTill": "5p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/CJtwAh0wlQj2QVsiMpmlkw/o.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/CJtwAh0wlQj2QVsiMpmlkw/o.jpg"],
    "price": 65,
    "wasPrice": 90,
    "lng": -84.3683032,
    "lat": 33.7813467,
    "address": "985 Monroe Drive NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://3peachesgelato.com/"
  },
  {
    "id": "ponce-city",
    "name": "Ponce City Market",
    "category": "Food Hall",
    "area": "O4W",
    "loved": 98,
    "rating": 4.8,
    "ratings": "2,504",
    "openTill": "11p",
    "badges": ["LOCAL FAVE", "PERKS"],
    "img": "https://poncecitymarket.com/wp-content/uploads/2024/12/Ponce-City-Market_Photo-Courtesy-of-Jamestown13-scaled.jpg",
    "imgs": ["https://poncecitymarket.com/wp-content/uploads/2024/12/Ponce-City-Market_Photo-Courtesy-of-Jamestown13-scaled.jpg"],
    "price": 96,
    "wasPrice": 161,
    "lng": -84.3657,
    "lat": 33.7729,
    "address": "675 Ponce De Leon Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://poncecitymarket.com/"
  },
  {
    "id": "indaco",
    "name": "Indaco",
    "category": "Italian Restaurant",
    "area": "O4W",
    "loved": 87,
    "rating": 4.4,
    "ratings": "1082",
    "openTill": "12a",
    "badges": [],
    "img": "https://images.getbento.com/accounts/5cbb7ec98a8c1b28f9e7010a07d6860c/media/images/9757220231005_indaco_atl_ck_4582_copy.jpg?w=1800&fit=max&auto=compress,format&cs=origin&h=1800",
    "imgs": ["https://images.getbento.com/accounts/5cbb7ec98a8c1b28f9e7010a07d6860c/media/images/9757220231005_indaco_atl_ck_4582_copy.jpg?w=1800&fit=max&auto=compress,format&cs=origin&h=1800"],
    "price": 130,
    "wasPrice": 180,
    "lng": -84.366,
    "lat": 33.7726,
    "address": "725 Ponce De Leon Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/indaco-atlanta",
    "website": "https://www.indacorestaurant.com/location/indaco-atlanta-beltline/"
  },
  {
    "id": "rina",
    "name": "Rina",
    "category": "Middle Eastern Restaurant",
    "area": "O4W",
    "loved": 81,
    "rating": 4.5,
    "ratings": "2174",
    "openTill": "12a",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/P_mN_fMmykb6p-q5v8_Ygw/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/P_mN_fMmykb6p-q5v8_Ygw/348s.jpg"],
    "price": 110,
    "wasPrice": 150,
    "lng": -84.3643038,
    "lat": 33.7726586,
    "address": "699 Ponce De Leon Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/rina-old-fourth-ward-atlanta",
    "website": "https://rinakitchen.com/"
  },
  {
    "id": "rreal-tacos",
    "name": "Rreal Tacos",
    "category": "Mexican",
    "area": "O4W",
    "loved": 98,
    "rating": 4.9,
    "ratings": "558",
    "openTill": "12a",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/FuCRzYCwlqJrgEFBdGb-iA/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/FuCRzYCwlqJrgEFBdGb-iA/348s.jpg"],
    "price": 80,
    "wasPrice": 110,
    "lng": -84.3641301,
    "lat": 33.7729948,
    "address": "699 Ponce De Leon Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/rreal-tacos-beltline-atlanta",
    "website": "https://www.rrealtacos.com/"
  },
  {
    "id": "three-taverns-ponce-brew-terminal",
    "name": "Three Taverns Ponce Brew Terminal",
    "category": "Brewery",
    "area": "O4W",
    "loved": 83,
    "rating": 4.2,
    "ratings": "2152",
    "openTill": "10p",
    "badges": [],
    "img": "https://images.squarespace-cdn.com/content/v1/54737da7e4b0ec2675525ea3/1781976614210-5K1D8Q4SWOPRNDZG9BPU/Interior+bar.jpg",
    "imgs": ["https://images.squarespace-cdn.com/content/v1/54737da7e4b0ec2675525ea3/1781976614210-5K1D8Q4SWOPRNDZG9BPU/Interior+bar.jpg"],
    "price": 70,
    "wasPrice": 100,
    "lng": -84.364769,
    "lat": 33.7712483,
    "address": "680 North Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.threetavernsbrewery.com/terminal"
  },
  {
    "id": "azara",
    "name": "Azara",
    "category": "Mediterranean Restaurant",
    "area": "O4W",
    "loved": 95,
    "rating": 4.4,
    "ratings": "2315",
    "openTill": "1a",
    "badges": ["TRAIL PICK"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/nnw4BJ92uHXb27LsZ5zNpw/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/nnw4BJ92uHXb27LsZ5zNpw/l.jpg"],
    "price": 140,
    "wasPrice": 200,
    "lng": -84.362387,
    "lat": 33.770398,
    "address": "550 Somerset Terrace NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/azara-kitchen-reservations-atlanta?restref=1409749&lang=en-US&ot_source=Restaurant%20website&ot_campaign=soft-opening-home-page",
    "website": "https://www.azaraatl.com/"
  },
  {
    "id": "burle-s-bar",
    "name": "Burle's Bar",
    "category": "Cocktail Bar",
    "area": "O4W",
    "loved": 90,
    "rating": 4.2,
    "ratings": "1899",
    "openTill": "1a",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/oU4KjdCfPU5G00ZLozGzwA/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/oU4KjdCfPU5G00ZLozGzwA/l.jpg"],
    "price": 120,
    "wasPrice": 160,
    "lng": -84.36272,
    "lat": 33.7681081,
    "address": "505 N. Angier Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.burlesbar.com/store/p/understory-dinner-series-donum-estates-chef-briana-riddock-39p2l-dyfes",
    "website": "https://www.burlesbar.com"
  },
  {
    "id": "casi-cielo",
    "name": "Casi Cielo",
    "category": "Mexican",
    "area": "O4W",
    "loved": 92,
    "rating": 4.3,
    "ratings": "346",
    "openTill": "12a",
    "badges": ["LOCAL FAVE"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/nmar7olKKJ_VIxKM66Mb4Q/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/nmar7olKKJ_VIxKM66Mb4Q/l.jpg"],
    "price": 130,
    "wasPrice": 180,
    "lng": -84.3630335,
    "lat": 33.7685166,
    "address": "405 N. Angier Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/casi-cielo-beltline-atlanta",
    "website": "https://www.casicieloatl.com/"
  },
  {
    "id": "new-realm-brewing-co",
    "name": "New Realm Brewing Co.",
    "category": "Brewery",
    "area": "Midtown",
    "loved": 95,
    "rating": 4.7,
    "ratings": "1,412",
    "openTill": "12a",
    "badges": ["TRAIL PICK", "DEAL"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/z6dMLYEmfdA_pmE4OSxEGA/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/z6dMLYEmfdA_pmE4OSxEGA/l.jpg"],
    "price": 110,
    "wasPrice": 150,
    "lng": -84.36110827233607,
    "lat": 33.769245894812684,
    "address": "550 Somerset Terrace NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/new-realm-brew-pub-atlanta",
    "website": "https://newrealmbrewing.com/atlanta/"
  },
  {
    "id": "two-urban-licks",
    "name": "Two Urban Licks",
    "category": "American restaurant",
    "area": "O4W",
    "loved": 93,
    "rating": 4.1,
    "ratings": "968",
    "openTill": "10p",
    "badges": [],
    "img": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEif-EqLHakzkQiwrjP9LUZSeQGNiBkn7hLNP_wAeX49drs1TClE02mBvk9G8KRHrUitmQCgE4W5kfXTfIMMKudvKdaMcoy0udQvdRqDLK6o6WWCG8LJnAoa8kIftqSD0owDo1mh7Tp10Dw/s800/stencil.png",
    "imgs": ["https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEif-EqLHakzkQiwrjP9LUZSeQGNiBkn7hLNP_wAeX49drs1TClE02mBvk9G8KRHrUitmQCgE4W5kfXTfIMMKudvKdaMcoy0udQvdRqDLK6o6WWCG8LJnAoa8kIftqSD0owDo1mh7Tp10Dw/s800/stencil.png"],
    "price": 140,
    "wasPrice": 200,
    "lng": -84.361602,
    "lat": 33.768943,
    "address": "820 Ralph McGill Blvd. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "http://www.opentable.com/rest_profile.aspx?rid=3431&restref=3431",
    "website": "https://www.twourbanlicks.com/"
  },
  {
    "id": "painted-park",
    "name": "Painted Park",
    "category": "Recreational Venue & Restaurant",
    "area": "Inman Park",
    "loved": 81,
    "rating": 4.9,
    "ratings": "2009",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/qT_VdQCpQhmJl4KmDZ8bKg/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/qT_VdQCpQhmJl4KmDZ8bKg/l.jpg"],
    "price": 120,
    "wasPrice": 170,
    "lng": -84.359359608494,
    "lat": 33.762291456927,
    "address": "240 N. Highland Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://paintedparkatl.com/"
  },
  {
    "id": "kevin-rathbun-steak",
    "name": "Kevin Rathbun Steak",
    "category": "Steakhouse",
    "area": "Inman Park",
    "loved": 82,
    "rating": 4.3,
    "ratings": "843",
    "openTill": "1a",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/Oq7IhvWnVoTk15JorvapZA/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/Oq7IhvWnVoTk15JorvapZA/l.jpg"],
    "price": 180,
    "wasPrice": 250,
    "lng": -84.363819,
    "lat": 33.759248,
    "address": "154 Krog St. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://resy.com/cities/atlanta-ga/venues/kevin-rathbun-steak",
    "website": "https://kevinrathbunsteak.com/"
  },
  {
    "id": "lady-bird",
    "name": "Ladybird Grove & Mess Hall",
    "category": "New American Restaurant",
    "area": "O4W",
    "loved": 91,
    "rating": 4.5,
    "ratings": "987",
    "openTill": "11p",
    "badges": ["DEAL"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/iGe8to3uGrKsut5P-t9Mzw/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/iGe8to3uGrKsut5P-t9Mzw/l.jpg"],
    "price": 110,
    "wasPrice": 160,
    "lng": -84.3644735,
    "lat": 33.759758,
    "address": "684 John Wesley Dobbs Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://links.ladybirdatl.com/f5582640",
    "website": "https://www.ladybirdatl.com/"
  },
  {
    "id": "lingering-shade-social-club",
    "name": "Lingering Shade Social Club",
    "category": "Cocktail Bar",
    "area": "O4W",
    "loved": 90,
    "rating": 4.1,
    "ratings": "1897",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.squarespace-cdn.com/content/v1/69fa34296a74934e15f54012/e30eb5d5-1749-4138-bb51-1155101467e1/Lingering+Shade+Shoot+06.15.18.jpg",
    "imgs": ["https://images.squarespace-cdn.com/content/v1/69fa34296a74934e15f54012/e30eb5d5-1749-4138-bb51-1155101467e1/Lingering+Shade+Shoot+06.15.18.jpg"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.35728,
    "lat": 33.76346,
    "address": "660 Irwin St. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.lingeringshade.com/"
  },
  {
    "id": "krog-street",
    "name": "Krog Street Market",
    "category": "Food Hall",
    "area": "Inman Park",
    "loved": 93,
    "rating": 4.6,
    "ratings": "1,893",
    "openTill": "10p",
    "badges": ["TRAIL PICK"],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/Hq3vhAao2Ym79aDibEEm3Q/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/Hq3vhAao2Ym79aDibEEm3Q/l.jpg"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.3641688,
    "lat": 33.756877,
    "address": "99 Krog St. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.thekrogdistrict.com/"
  },
  {
    "id": "chiringa",
    "name": "Chiringa",
    "category": "Coastal Restaurant",
    "area": "O4W",
    "loved": 97,
    "rating": 4.1,
    "ratings": "1769",
    "openTill": "11p",
    "badges": [],
    "img": "https://d1w7312wesee68.cloudfront.net/9aNRHq0Rrb6Zk9APFrW9sZ18WNo9TeO213e09wnDp1k/ext:webp/quality:85/plain/s3://toast-sites-resources-prod/restaurantImages/fcf6f49c-e3bc-43ce-abd8-30d602bf1ed3/24009_CHIRINGA-Testimonial-graphics-06-01.jpg",
    "imgs": ["https://d1w7312wesee68.cloudfront.net/9aNRHq0Rrb6Zk9APFrW9sZ18WNo9TeO213e09wnDp1k/ext:webp/quality:85/plain/s3://toast-sites-resources-prod/restaurantImages/fcf6f49c-e3bc-43ce-abd8-30d602bf1ed3/24009_CHIRINGA-Testimonial-graphics-06-01.jpg"],
    "price": 90,
    "wasPrice": 130,
    "lng": -84.3658277,
    "lat": 33.7546488,
    "address": "678 Edgewood Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://chiringa.com/"
  },
  {
    "id": "eclipse-di-luna",
    "name": "Eclipse di Luna",
    "category": "Latin & Spanish Cuisine",
    "area": "O4W",
    "loved": 95,
    "rating": 4.5,
    "ratings": "1684",
    "openTill": "10p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=900&q=60"],
    "price": 110,
    "wasPrice": 160,
    "lng": -84.3680335,
    "lat": 33.756039,
    "address": "661 Auburn Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/eclipse-di-luna-krog-atlanta",
    "website": "https://www.eclipsediluna.com/"
  },
  {
    "id": "coffyn-pyes",
    "name": "Coffyn Pyes",
    "category": "Do-It-Yourself Food",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/AzYZLvY-1g4qmBmcppUO1g/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/AzYZLvY-1g4qmBmcppUO1g/348s.jpg"],
    "price": 80,
    "wasPrice": 120,
    "lng": -84.4094488,
    "lat": 33.7221891,
    "address": "352 University Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "website": "https://www.coffynpyes.com/"
  },
  {
    "id": "the-creamy-spot",
    "name": "The Creamy Spot",
    "category": "Plant-Based Ice Cream Shop",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://www.thecreamyspot.com/uploads/b/c56f58e0-9b59-11ed-81fd-4ffb3164399d/IMG_5786.jpg",
    "imgs": ["https://www.thecreamyspot.com/uploads/b/c56f58e0-9b59-11ed-81fd-4ffb3164399d/IMG_5786.jpg"],
    "price": 70,
    "wasPrice": 100,
    "lng": -84.4069348,
    "lat": 33.7469886,
    "address": "352 University Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "website": "https://www.thecreamyspot.com/"
  },
  {
    "id": "urban-grind-brewbox",
    "name": "Urban Grind BrewBox",
    "category": "Coffee & Tea",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/6PTyHcxh9J5NMzouAc1XqQ/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/6PTyHcxh9J5NMzouAc1XqQ/348s.jpg"],
    "price": 60,
    "wasPrice": 90,
    "lng": -84.40103,
    "lat": 33.72098,
    "address": "352 University Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "website": "https://urbangrindatlanta.com"
  },
  {
    "id": "carrot-dog",
    "name": "Carrot Dog",
    "category": "Hot Dogs",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/_mKk8AH3AqtCKDghpS0ERA/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/_mKk8AH3AqtCKDghpS0ERA/348s.jpg"],
    "price": 60,
    "wasPrice": 90,
    "lng": -84.401674,
    "lat": 33.722087,
    "address": "352 University Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "website": "https://carrotdogatl.com/"
  },
  {
    "id": "mr-diddy-s",
    "name": "Mr. Diddy's",
    "category": "Soul Food Restaurant",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://popmenucloud.com/cdn-cgi/image/width=1200,height=1200,fit=scale-down,format=auto,quality=60/tpvxgwdh/9e7665f9-0316-4881-86dc-509001c9bad8.jpg",
    "imgs": ["https://popmenucloud.com/cdn-cgi/image/width=1200,height=1200,fit=scale-down,format=auto,quality=60/tpvxgwdh/9e7665f9-0316-4881-86dc-509001c9bad8.jpg"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.408177,
    "lat": 33.718319,
    "address": "631 Dill Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "reservation_link": "https://www.mrdiddys.com/popmenu-order/mr-diddys-metropolitan/menus/mr-diddys-metropolitan",
    "website": "https://www.mrdiddys.com/"
  },
  {
    "id": "good-as-burgers",
    "name": "Good As Burgers",
    "category": "Vegan Burger Restaurant",
    "area": "Southwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/S7BCq35yMuPmeJs6KK_6CQ/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/S7BCq35yMuPmeJs6KK_6CQ/348s.jpg"],
    "price": 90,
    "wasPrice": 130,
    "lng": -84.41442,
    "lat": 33.7255,
    "address": "1089 Allene Ave. SW, Atlanta",
    "walk": "On the Southwest Trail",
    "website": "https://www.goodasburgers.com/"
  },
  {
    "id": "monday-night-brewing-the-garage",
    "name": "Monday Night Brewing - The Garage",
    "category": "Brewery",
    "area": "West End",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/HPFtOKMiGk3S2XTs3-nRXw/o.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/HPFtOKMiGk3S2XTs3-nRXw/o.jpg"],
    "price": 70,
    "wasPrice": 100,
    "lng": -84.41783,
    "lat": 33.74957,
    "address": "933 Lee St. SW, Atlanta",
    "walk": "On the Westside Trail",
    "website": "https://mondaynightbrewing.com/location/the-garage/"
  },
  {
    "id": "asw-whiskey-exchange",
    "name": "ASW Whiskey Exchange",
    "category": "Distilleries",
    "area": "West End",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/VJ62ZG6JOVPTFa_AhUEAuw/o.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/VJ62ZG6JOVPTFa_AhUEAuw/o.jpg"],
    "price": 120,
    "wasPrice": 180,
    "lng": -84.4187688,
    "lat": 33.7298554,
    "address": "1000 White St. SW, Atlanta",
    "walk": "On the Westside Trail",
    "website": "https://www.aswdistillery.com/"
  },
  {
    "id": "boxcar-at-hop-city",
    "name": "Boxcar at Hop City",
    "category": "New American Restaurant",
    "area": "West End",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/JXK2R5q-SJk-yiqp7c6Ndg/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/JXK2R5q-SJk-yiqp7c6Ndg/348s.jpg"],
    "price": 110,
    "wasPrice": 160,
    "lng": -84.420261,
    "lat": 33.732134,
    "address": "1000 White St. SW, Atlanta",
    "walk": "On the Westside Trail",
    "reservation_link": "https://resy.com/cities/atlanta-ga/venues/boxcar",
    "website": "https://www.boxcaratl.com/"
  },
  {
    "id": "bovino-after-dark",
    "name": "Bovino After Dark",
    "category": "Supper Club",
    "area": "West End",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/URyPyFKw_ZIhzXPL_ZYOtA/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/URyPyFKw_ZIhzXPL_ZYOtA/348s.jpg"],
    "price": 150,
    "wasPrice": 200,
    "lng": -84.4224,
    "lat": 33.732,
    "address": "1000 White St. SW, Atlanta",
    "walk": "On the Westside Trail",
    "reservation_link": "https://resy.com/cities/atlanta-ga/venues/bovino-after-dark",
    "website": "https://www.bovinoafterdark.com/"
  },
  {
    "id": "wild-heaven-beer",
    "name": "Wild Heaven Beer",
    "category": "Brewery",
    "area": "West End",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/GCOCbrEeo6dpZL9Kj_vzkA/l.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/GCOCbrEeo6dpZL9Kj_vzkA/l.jpg"],
    "price": 70,
    "wasPrice": 100,
    "lng": -84.4193695,
    "lat": 33.7304904,
    "address": "1010 White St. SW, Atlanta",
    "walk": "On the Westside Trail",
    "website": "https://wildheavenbeer.com/west-end"
  },
  {
    "id": "97-estoria",
    "name": "97 Estoria",
    "category": "Dive Bar",
    "area": "Cabbagetown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://s3-media0.fl.yelpcdn.com/bphoto/8TN08fVOJ2V5ztbxYceF0A/348s.jpg",
    "imgs": ["https://s3-media0.fl.yelpcdn.com/bphoto/8TN08fVOJ2V5ztbxYceF0A/348s.jpg"],
    "price": 50,
    "wasPrice": 80,
    "lng": -84.363344,
    "lat": 33.752907,
    "address": "727 Wylie St. SE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.estoriabar.com/"
  },
  {
    "id": "breaker-breaker",
    "name": "Breaker Breaker",
    "category": "Seafood Restaurant",
    "area": "Cabbagetown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=60"],
    "price": 120,
    "wasPrice": 160,
    "lng": -84.359858,
    "lat": 33.752817,
    "address": "921 Wylie St. SE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.breakerbreakeratl.com/"
  },
  {
    "id": "muchacho",
    "name": "Muchacho",
    "category": "Mexican Restaurant",
    "area": "Reynoldstown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&q=60"],
    "price": 90,
    "wasPrice": 130,
    "lng": -84.360156,
    "lat": 33.750867,
    "address": "904 Memorial Drive SE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://muchacho.com/"
  },
  {
    "id": "girl-diver",
    "name": "Girl Diver",
    "category": "Asian Fusion Restaurant",
    "area": "Reynoldstown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=900&q=60"],
    "price": 130,
    "wasPrice": 180,
    "lng": -84.360156,
    "lat": 33.750867,
    "address": "915 Memorial Drive SE, Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/girl-diver-atlanta",
    "website": "https://girldiver.com/"
  },
  {
    "id": "gunshow",
    "name": "Gunshow",
    "category": "New American Restaurant",
    "area": "Reynoldstown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&q=60"],
    "price": 150,
    "wasPrice": 200,
    "lng": -84.360156,
    "lat": 33.750867,
    "address": "924 Garrett St., Atlanta",
    "walk": "On the Eastside Trail",
    "reservation_link": "https://www.opentable.com/r/gunshow-atlanta",
    "website": "https://www.gunshowatl.com/"
  },
  {
    "id": "lewis-barbecue",
    "name": "Lewis Barbecue",
    "category": "Barbecue Restaurant",
    "area": "Northeast",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=900&q=60"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.3686,
    "lat": 33.7915,
    "address": "1544 Piedmont Ave. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.lewisbarbecue.com/location/lewis-barbecue-atlanta/"
  },
  {
    "id": "park-tavern",
    "name": "Park Tavern",
    "category": "Sports Bar",
    "area": "Midtown",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=60"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.3691,
    "lat": 33.7825,
    "address": "500 10th St. NE, Atlanta",
    "walk": "On the Eastside Trail",
    "website": "https://www.parktavern.com/"
  },
  {
    "id": "twisted-soul-cookhouse",
    "name": "Twisted Soul Cookhouse",
    "category": "Southern Restaurant",
    "area": "Northwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=60"],
    "price": 120,
    "wasPrice": 170,
    "lng": -84.4172,
    "lat": 33.7788,
    "address": "1133 Huff Road NW, Atlanta",
    "walk": "On the Westside Trail",
    "reservation_link": "https://www.opentable.com/r/twisted-soul-cookhouse-and-pours-atlanta",
    "website": "https://www.twistedsoulatl.com/"
  },
  {
    "id": "bacchanalia",
    "name": "Bacchanalia",
    "category": "Fine Dining Restaurant",
    "area": "Northwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60"],
    "price": 250,
    "wasPrice": 350,
    "lng": -84.4234,
    "lat": 33.7778,
    "address": "1460 Ellsworth Industrial Blvd. NW, Atlanta",
    "walk": "On the Westside Trail",
    "reservation_link": "https://www.opentable.com/r/bacchanalia-atlanta",
    "website": "https://www.starprovisions.com/bacchanalia"
  },
  {
    "id": "fox-bros-bar-b-q",
    "name": "Fox Bros. Bar-B-Q",
    "category": "Barbecue Restaurant",
    "area": "Northwest",
    "loved": 90,
    "rating": 4.5,
    "ratings": "500",
    "openTill": "11p",
    "badges": [],
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=60",
    "imgs": ["https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=60"],
    "price": 100,
    "wasPrice": 140,
    "lng": -84.4255,
    "lat": 33.7855,
    "address": "204 Chattahoochee Row NW, Atlanta",
    "walk": "On the Westside Trail",
    "website": "https://www.foxbrosbbq.com/"
  }
];

export function isOpenNow(spot: Spot): boolean {
  const now = new Date();
  const hours = now.getHours();
  const till = spot.openTill.toLowerCase();
  let closeHour = 22; // default 10p
  if (till.includes("p")) closeHour = parseInt(till) + 12;
  if (till.includes("a")) closeHour = parseInt(till);
  if (till === "12a") closeHour = 24;
  return hours < closeHour;
}

export function closingTimeLabel(till: string): string {
  if (till === "12a") return "Midnight";
  if (till === "1a") return "1:00 AM";
  return till.replace("p", ":00 PM");
}

export const menuPicks = [
  { name: "Wood-fired pizza", img: "/photos/pizza.png" },
  { name: "New Realm Burger", img: "/photos/burger.png" },
  { name: "Street tacos", img: "/photos/tacos.png" },
];

export const friends = [
  { name: "Maya", place: "New Realm Brewing", status: "On the trail", battery: "76%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=60" },
  { name: "Deon", place: "Eastside Trail", status: "At New Realm", battery: "89%", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=60" },
  { name: "Priya", place: "Krog Street Market", status: "Ponce City Market", battery: "64%", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=60" },
];

export const mapPins = [
  { x: 47, y: 16, r: 4.7 }, { x: 57, y: 18, r: 4.8 }, { x: 42, y: 24, r: 4.5 },
  { x: 52, y: 32, r: 4.6 }, { x: 62, y: 40, r: 4.2 }, { x: 48, y: 48, r: 4.9 },
  { x: 58, y: 56, r: 4.4 }, { x: 44, y: 64, r: 4.3 }, { x: 54, y: 72, r: 4.1 },
];

// ── restored 2026-08-04 ────────────────────────────────────────────────────
// The data.ts rewrite dropped these; RealMap, CrowdPanel, exploreFilters,
// Navigate and crowd.ts all still import them. Listed as out of scope for the
// spots migration ("leave it in data.ts"). Recovered verbatim from main.

// approx Atlanta BeltLine loop + eastside spot pins (lon, lat)
export const beltlineLoop: [number, number][] = [
  [-84.408, 33.786], [-84.395, 33.799], [-84.376, 33.803], [-84.36, 33.796],
  [-84.35, 33.781], [-84.347, 33.762], [-84.354, 33.741], [-84.371, 33.727],
  [-84.394, 33.724], [-84.41, 33.734], [-84.418, 33.755], [-84.415, 33.773],
  [-84.408, 33.786],
];
// Turn-by-turn demo route: Eastside Trail, Ponce City Market → Krog Street Market

// Turn-by-turn demo route: Eastside Trail, Ponce City Market → Krog Street Market
export const navRoute: [number, number][] = [
  [-84.366, 33.7726], [-84.3654, 33.771], [-84.3648, 33.7688],
  [-84.3644, 33.7662], [-84.364, 33.7635], [-84.3636, 33.7605],
  [-84.3632, 33.7575], [-84.3634, 33.7548], [-84.3636, 33.753],
];

export const navSteps: { at: number; icon: "up" | "right" | "left" | "flag"; dist: string; text: string }[] = [
  { at: 0.0, icon: "up", dist: "0.4 mi", text: "Head south on Eastside Trail" },
  { at: 0.28, icon: "up", dist: "0.3 mi", text: "Continue past Historic Fourth Ward Park" },
  { at: 0.55, icon: "up", dist: "0.3 mi", text: "Continue on Eastside Trail" },
  { at: 0.82, icon: "right", dist: "350 ft", text: "Bear right toward Krog Street Market" },
  { at: 0.97, icon: "flag", dist: "Arrive", text: "Krog Street Market" },
];

// meters between two lng/lat points (haversine)

// meters between two lng/lat points (haversine)
export function distM(a: [number, number], b: [number, number]) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toR, dLng = (b[0] - a[0]) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Real (approximate) trail-segment centerlines, built from the actual street
// addresses/cross-streets in RAW_SPOTS above — NOT the same as `beltlineLoop`,
// which is a decorative full-corridor loop shape used for map art and puts
// Ponce City Market ~20min from "the trail" it's literally built on. These two
// short polylines trace the real Eastside Trail corridor (Piedmont Park down
// through PCM/Krog St) and the real Westside/Southwest Trail corridor
// (Westview through Lee+White to Pittsburgh Yards), for actual walk-distance
// filtering.
const EASTSIDE_TRAIL_PATH: [number, number][] = [
  [-84.372, 33.782], [-84.3715, 33.7815], [-84.371, 33.775], [-84.3669, 33.7719],
  [-84.371, 33.767], [-84.373, 33.766], [-84.3625, 33.7575], [-84.3636, 33.753],
  [-84.361, 33.746],
];
const SOUTHWEST_TRAIL_PATH: [number, number][] = [
  [-84.443, 33.735], [-84.415, 33.735], [-84.42, 33.726], [-84.416, 33.723],
  [-84.403, 33.719],
];
const WALK_M_PER_MIN = 80; // ~5 km/h average walking pace

export function nearestPointOnSegment(p: [number, number], a: [number, number], b: [number, number]): [number, number] {
  // flat-earth projection — fine at city scale; longitude scaled by cos(lat) to un-skew degrees
  const k = Math.cos((p[1] * Math.PI) / 180);
  const ax = a[0] * k, ay = a[1], bx = b[0] * k, by = b[1], px = p[0] * k, py = p[1];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return [(ax + t * dx) / k, ay + t * dy];
}
function distToPolylineM(p: [number, number], path: [number, number][]): number {
  let min = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    min = Math.min(min, distM(p, nearestPointOnSegment(p, path[i], path[i + 1])));
  }
  return min;
}

export function walkMinutesFromTrail(lng: number, lat: number): number {
  const p: [number, number] = [lng, lat];
  return Math.min(distToPolylineM(p, EASTSIDE_TRAIL_PATH), distToPolylineM(p, SOUTHWEST_TRAIL_PATH)) / WALK_M_PER_MIN;
}

// openTill ("11p", "12a", "1a", "7p", ...) is the only real hours data we
// have — no opening time is stored. isOpenNow() assumes evening venues (close
// after 7p) open by 11a and daytime venues (close by 7p) open by 7a; measured
// relative to a 4am anchor so post-midnight closes ("12a"/"1a") don't need
// special-cased wraparound math.
function closeHour24(openTill: string): number {
  const m = /^(\d+)([ap])$/.exec(openTill);
  if (!m) return 23;
  const h = parseInt(m[1], 10) % 12;
  return m[2] === "p" ? h + 12 : h;
}
function hoursSince4am(h: number): number {
  return ((h - 4) % 24 + 24) % 24;
}

export const geoPins: { lng: number; lat: number; r: number }[] = [
  { lng: -84.3669, lat: 33.7719, r: 4.7 }, { lng: -84.3654, lat: 33.7669, r: 4.8 },
  { lng: -84.3725, lat: 33.7756, r: 4.5 }, { lng: -84.3629, lat: 33.7591, r: 4.6 },
  { lng: -84.3527, lat: 33.7644, r: 4.2 }, { lng: -84.3699, lat: 33.7631, r: 4.9 },
  { lng: -84.3805, lat: 33.7702, r: 4.4 }, { lng: -84.3547, lat: 33.7727, r: 4.3 },
  { lng: -84.3752, lat: 33.7554, r: 4.1 },
];

// Synthetic crowd-density sample points for the real MapLibre heatmap layer
// (Trail Conditions screen). Clustered hottest near Ponce City Market, warm
// near New Realm Brewing, light scatter along the rest of the trail.

// Synthetic crowd-density sample points for the real MapLibre heatmap layer
// (Trail Conditions screen). Clustered hottest near Ponce City Market, warm
// near New Realm Brewing, light scatter along the rest of the trail.
export const crowdDensityPoints: { lng: number; lat: number; weight: number }[] = (() => {
  const jitter = (lng: number, lat: number, n: number, spread: number, weight: number) =>
    Array.from({ length: n }, () => ({
      lng: lng + (Math.random() - 0.5) * spread,
      lat: lat + (Math.random() - 0.5) * spread,
      weight,
    }));
  return [
    ...jitter(-84.366, 33.7726, 22, 0.004, 1),   // Ponce City Market — busiest
    ...jitter(-84.3669, 33.7719, 14, 0.0035, 0.7), // New Realm Brewing
    ...jitter(-84.3636, 33.753, 8, 0.003, 0.5),    // Krog Street Market
    ...beltlineLoop.flatMap((pt) => jitter(pt[0], pt[1], 3, 0.003, 0.3)),
  ];
})();
