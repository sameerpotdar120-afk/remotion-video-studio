// Voiceover script for the Flydubai FZ1073 reel, split into on-screen beats.
// Every line is sourced; see docs/flight-attack-reel.md for the source list.
// Words wrapped in *asterisks* are highlighted in the captions.

export const FPS = 24;

export type SceneId =
  | 'hook'
  | 'route'
  | 'axe'
  | 'drop'
  | 'door'
  | 'rush'
  | 'payoff'
  | 'status'
  | 'close';

export type Beat = {
  id: SceneId;
  seconds: number;
  text: string;
};

export const BEATS: Beat[] = [
  {
    id: 'hook',
    seconds: 6.5,
    text: "You'd never guess who almost crashed *Flydubai* *flight* *1073.* It wasn't a passenger. So how did *182* *people* survive?",
  },
  {
    id: 'route',
    seconds: 5,
    text: 'September 30th. *Dubai* to *Tel* *Aviv.* A Boeing 737 MAX, two and a half hours in.',
  },
  {
    id: 'axe',
    seconds: 5.5,
    text: 'UAE prosecutors say the *co-pilot* grabbed the cockpit *crash* *axe* and attacked the captain.',
  },
  {
    id: 'drop',
    seconds: 5,
    text: 'The plane dropped about *17,000* *feet* in *under* *a* *minute.*',
  },
  {
    id: 'door',
    seconds: 6,
    text: 'The captain, badly wounded on the floor, reached the switch and *unlocked* *the* *cockpit* *door.*',
  },
  {
    id: 'rush',
    seconds: 6.5,
    text: 'Passengers and an *off-duty* *pilot* rushed in, dragged the co-pilot out and tied him up with *headphone* *cables.*',
  },
  {
    id: 'payoff',
    seconds: 7.5,
    text: "That's how 182 people survived. A *bleeding* *captain* who opened the door, and *strangers* *who* *ran* *toward* *it.* The crew landed safely in *Tabuk,* Saudi Arabia.",
  },
  {
    id: 'status',
    seconds: 5,
    text: 'The captain is in *stable* *condition.* The accused co-pilot is with *UAE* *investigators.*',
  },
  {
    id: 'close',
    seconds: 3.5,
    text: 'Follow for the *investigation* *updates.*',
  },
];

export const sceneFrames = (b: Beat) => Math.round(b.seconds * FPS);

export const TOTAL_FRAMES = BEATS.reduce((sum, b) => sum + sceneFrames(b), 0);
