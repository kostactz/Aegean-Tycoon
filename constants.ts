
import { Island, Route, GameEventData } from './types';

// Map Configuration
// Coordinates compacted (0.7x scale) to fix visibility issues while maintaining layout
// Center is roughly [0,0,0]

export const ISLANDS: Island[] = [
  {
    id: 'piraeus',
    name: 'Piraeus Port',
    description: 'Start here. Smell the exhaust.',
    position: [-14, 0.5, 14], // Top Left
    price: 0,
    rent: 0,
    level: 1,
    ownerId: null,
    type: 'START',
    landmarks: ['Port Gate E9', 'The Lion of Piraeus'],
    funFact: 'One of the largest passenger ports in Europe, servicing 20 million passengers a year.'
  },
  {
    id: 'hydra',
    name: 'Hydra',
    description: 'No cars allowed. Just donkeys and Rolexes.',
    position: [-10, 0.5, 6],
    price: 300,
    rent: 35,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Lazaros Koundouriotis Mansion', 'The Port Fortifications'],
    funFact: 'All wheeled vehicles (cars, motorcycles) are prohibited. You must walk or take a donkey taxi.'
  },
  {
    id: 'syros',
    name: 'Syros',
    description: 'The capital. Loukoumia factory.',
    position: [-5, 0.5, -4], // North Central
    price: 150,
    rent: 15,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Apollo Theater', 'Miaouli Square', 'Ano Syros'],
    funFact: 'The capital of the Cyclades. Famous for its "Loukoumia" (Turkish Delight) and Rebetiko music.'
  },
  {
    id: 'tinos',
    name: 'Tinos',
    description: 'Crawling pilgrims everywhere.',
    position: [-3, 0.5, -9], // North
    price: 100,
    rent: 10,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Panagia Evangelistria', 'Dovecodes of Tarambados'],
    funFact: 'Pilgrims often crawl on their hands and knees from the port to the church as a sign of devotion.'
  },
  {
    id: 'mykonos',
    name: 'Mykonos',
    description: 'Very expensive. Very windy.',
    position: [6, 0.5, -6], // North East
    price: 450,
    rent: 60,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['The Windmills (Kato Mili)', 'Little Venice', 'Paraportiani Church'],
    funFact: 'Petros the Pelican was the island’s official mascot for over 30 years.'
  },
  {
    id: 'paros',
    name: 'Paros',
    description: 'Windsurfers and nightclubs.',
    position: [0, 0.5, 1], // Central
    price: 250,
    rent: 25,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Panagia Ekatontapiliani', 'Naoussa Venetian Castle'],
    funFact: 'The Venus de Milo and Napoleon’s tomb were carved from Parian marble, the finest in the world.'
  },
  {
    id: 'naxos',
    name: 'Naxos',
    description: 'Good potatoes. Family friendly.',
    position: [3, 0.5, 6], // Central East
    price: 200,
    rent: 20,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Portara (Temple of Apollo)', 'Mount Zas', 'Temple of Demeter'],
    funFact: 'According to mythology, this is where Theseus abandoned Ariadne after killing the Minotaur.'
  },
  {
    id: 'milos',
    name: 'Milos',
    description: 'Lunar landscapes and pirate caves.',
    position: [-9, 0.5, 13], // South West
    price: 280,
    rent: 30,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Sarakiniko Beach', 'Kleftiko Caves', 'Catacombs'],
    funFact: 'The famous statue "Venus de Milo" (Aphrodite) was discovered here by a peasant in 1820.'
  },
  {
    id: 'ios',
    name: 'Ios',
    description: 'Lost your youth (and liver) here.',
    position: [4, 0.5, 10], // South
    price: 180,
    rent: 18,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Chora Windmills', 'Tomb of Homer', 'Mylopotas Beach'],
    funFact: 'Legend says the great poet Homer is buried here. Also known for having more bars than houses.'
  },
  {
    id: 'santorini',
    name: 'Santorini',
    description: 'Great sunsets, terrible stairs.',
    position: [1, 0.5, 16], // Deep South
    price: 400,
    rent: 50,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Caldera View', 'Oia Sunset', 'Akrotiri Excavations'],
    funFact: 'The island is actually an active volcano. Its eruption around 1600 BC may have inspired the Atlantis legend.'
  },
  {
    id: 'amorgos',
    name: 'Amorgos',
    description: 'The Big Blue. Deep waters.',
    position: [10, 0.5, 8], // Far East
    price: 220,
    rent: 22,
    level: 1,
    ownerId: null,
    type: 'ISLAND',
    landmarks: ['Hozoviotissa Monastery', 'Agia Anna Beach', 'Shipwreck of Olympia'],
    funFact: 'Luc Besson’s movie "The Big Blue" was filmed here, making it famous for free-diving.'
  },
  {
    id: 'malakies',
    name: 'Open Sea',
    description: 'Random Event Zone.',
    position: [12, 0.5, -2],
    price: 0,
    rent: 0,
    level: 1,
    ownerId: null,
    type: 'EVENT',
    funFact: 'The Aegean Sea has over 2,000 islands and islets, but only about 170 are inhabited.'
  },
];

// Connectivity graph
// Control points adjusted for the compacted spacing
export const ROUTES: Route[] = [
  // Piraeus Routes
  { from: 'piraeus', to: 'hydra', controlPoints: [[-12, 0, 10]] },
  { from: 'piraeus', to: 'milos', controlPoints: [[-11, 0, 14]] },
  { from: 'piraeus', to: 'syros', controlPoints: [[-10, 0, 5]] },
  
  // Hydra Connections
  { from: 'hydra', to: 'syros', controlPoints: [[-8, 0, 1]] },
  { from: 'hydra', to: 'milos', controlPoints: [[-10, 0, 10]] },

  // Syros Hub
  { from: 'syros', to: 'tinos', controlPoints: [[-4, 0, -6]] },
  { from: 'syros', to: 'paros', controlPoints: [[-2, 0, -2]] },
  { from: 'syros', to: 'mykonos', controlPoints: [[0, 0, -5]] },

  // Tinos/Mykonos
  { from: 'tinos', to: 'mykonos', controlPoints: [[1, 0, -8]] },
  { from: 'mykonos', to: 'paros', controlPoints: [[3, 0, -2]] },
  { from: 'mykonos', to: 'malakies', controlPoints: [[8, 0, -4]] },

  // Paros/Naxos Hub
  { from: 'paros', to: 'naxos', controlPoints: [[1.5, 0, 3.5]] },
  { from: 'paros', to: 'ios', controlPoints: [[2, 0, 7]] },
  
  // South/East Routes
  { from: 'naxos', to: 'ios', controlPoints: [[3.5, 0, 8]] },
  { from: 'naxos', to: 'amorgos', controlPoints: [[6, 0, 7]] },
  
  // Milos/Santorini
  { from: 'milos', to: 'santorini', controlPoints: [[-4, 0, 14]] },
  
  // Santorini/Ios/Amorgos
  { from: 'santorini', to: 'ios', controlPoints: [[3, 0, 13]] },
  { from: 'santorini', to: 'amorgos', controlPoints: [[5, 0, 12]] },
  
  // Loop Backs / Long Hauls
  { from: 'ios', to: 'amorgos', controlPoints: [[7, 0, 9]] },
  { from: 'amorgos', to: 'malakies', controlPoints: [[11, 0, 3]] },
];

export const GAME_EVENTS: GameEventData[] = [
    {
        id: 'evt_1',
        title: "Overcharged Frappe",
        description: "You ordered a Freddo Espresso but they charged you for a 'Gold Blend'. Pay 20€.",
        type: 'BAD',
        effectType: 'MONEY',
        target: 'SELF',
        value: -20
    },
    {
        id: 'evt_2',
        title: "German Tourists",
        description: "You rented your extra room to a nice couple from Munich. Collect 100€.",
        type: 'GOOD',
        effectType: 'MONEY',
        target: 'SELF',
        value: 100
    },
    {
        id: 'evt_3',
        title: "Ferry Strike",
        description: "The Union decided to strike today. Ferries are docked. Lose a turn (Jailed).",
        type: 'BAD',
        effectType: 'JAIL',
        target: 'SELF',
        value: 0
    },
    {
        id: 'evt_4',
        title: "Found a Wallet",
        description: "It was buried in the sand at Paradise Beach. Finders keepers. Collect 50€.",
        type: 'GOOD',
        effectType: 'MONEY',
        target: 'SELF',
        value: 50
    },
    {
        id: 'evt_5',
        title: "Sunburn Treatment",
        description: "You fell asleep in the sun. You need aloe vera and yogurt. Pay 30€.",
        type: 'BAD',
        effectType: 'MONEY',
        target: 'SELF',
        value: -30
    },
    {
        id: 'evt_6',
        title: "The Meltemi",
        description: "High winds! Navigation is dangerous. All ferries move at half speed.",
        type: 'BAD',
        effectType: 'WEATHER',
        target: 'ALL',
        value: 0
    },
    {
        id: 'evt_7',
        title: "Yiayia's Pension",
        description: "Your grandma slipped you some cash for 'an ice cream'. Collect 40€.",
        type: 'GOOD',
        effectType: 'MONEY',
        target: 'SELF',
        value: 40
    },
    {
        id: 'evt_8',
        title: "Taverna Bill",
        description: "You treated the whole parea to fresh fish by the pound. Ouch. Pay 150€.",
        type: 'BAD',
        effectType: 'MONEY',
        target: 'SELF',
        value: -150
    },
    {
        id: 'evt_9',
        title: "The Village Wedding",
        description: "Your cousin is getting married! Everyone must pay you 50€ for the gift envelope.",
        type: 'GOOD',
        effectType: 'MONEY',
        target: 'ALL_OTHERS',
        value: 50
    },
    {
        id: 'evt_10',
        title: "Instagram Sponsorship",
        description: "A beach bar paid you to post a story holding their cocktail. Collect 80€.",
        type: 'GOOD',
        effectType: 'MONEY',
        target: 'SELF',
        value: 80
    }
];
