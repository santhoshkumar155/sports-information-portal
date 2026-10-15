// Usage: npm run seed   (from the backend folder)
// WARNING: this clears the users, matches, teams, players and news collections first.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const News = require('../models/News');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sportsportal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Dates are relative to today so "Upcoming" matches are always in the future
const day = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

const teams = [
  { name: 'India', sport: 'Cricket', country: 'India', coach: 'Gautam Gambhir', founded: 1932, description: 'The Indian national cricket team, one of the most followed sides in world cricket.' },
  { name: 'Australia', sport: 'Cricket', country: 'Australia', coach: 'Andrew McDonald', founded: 1877, description: 'Five-time ODI World Cup winners and a dominant force in all formats.' },
  { name: 'England', sport: 'Cricket', country: 'England', coach: 'Brendon McCullum', founded: 1877, description: 'Pioneers of the game, known for their aggressive "Bazball" approach in Tests.' },
  { name: 'Real Madrid', sport: 'Football', country: 'Spain', coach: 'Carlo Ancelotti', founded: 1902, description: 'The most successful club in European Cup and Champions League history.' },
  { name: 'FC Barcelona', sport: 'Football', country: 'Spain', coach: 'Hansi Flick', founded: 1899, description: 'Catalan giants famous for their La Masia academy and possession football.' },
  { name: 'Manchester City', sport: 'Football', country: 'England', coach: 'Pep Guardiola', founded: 1880, description: 'Premier League champions known for attacking, patient build-up play.' },
  { name: 'Los Angeles Lakers', sport: 'Basketball', country: 'USA', coach: 'JJ Redick', founded: 1947, description: 'One of the NBA\'s most decorated franchises, based in Los Angeles.' },
  { name: 'Golden State Warriors', sport: 'Basketball', country: 'USA', coach: 'Steve Kerr', founded: 1946, description: 'Multiple-time NBA champions built around elite three-point shooting.' },
  { name: 'Boston Celtics', sport: 'Basketball', country: 'USA', coach: 'Joe Mazzulla', founded: 1946, description: 'Record-holders for NBA championships with a strong defensive identity.' },
  { name: 'Team Serbia', sport: 'Tennis', country: 'Serbia', coach: 'Viktor Troicki', founded: 1920, description: 'Serbia\'s Davis Cup squad, led by some of the best players of their generation.' },
  { name: 'Team Spain', sport: 'Tennis', country: 'Spain', coach: 'David Ferrer', founded: 1920, description: 'Six-time Davis Cup champions with a strong clay-court tradition.' },
  { name: 'Team Italy', sport: 'Tennis', country: 'Italy', coach: 'Filippo Volandri', founded: 1922, description: 'Recent Davis Cup winners with a deep roster of rising talent.' },
  { name: 'India Hockey', sport: 'Hockey', country: 'India', coach: 'Craig Fulton', founded: 1925, description: 'Eight-time Olympic gold medallists and back-to-back Olympic bronze winners.' },
  { name: 'Netherlands Hockey', sport: 'Hockey', country: 'Netherlands', coach: 'Jeroen Delmee', founded: 1898, description: 'A powerhouse of European field hockey with a fast, technical style.' },
  { name: 'Germany Hockey', sport: 'Hockey', country: 'Germany', coach: 'Andre Henning', founded: 1909, description: 'World and Olympic champions known for tactical discipline.' },
  { name: 'Team India Badminton', sport: 'Badminton', country: 'India', coach: 'Pullela Gopichand', founded: 1934, description: 'Thomas Cup champions with world-class singles and doubles players.' },
  { name: 'Team China Badminton', sport: 'Badminton', country: 'China', coach: 'Zhang Jun', founded: 1953, description: 'The sport\'s most successful nation across singles and doubles.' },
  { name: 'Team Denmark Badminton', sport: 'Badminton', country: 'Denmark', coach: 'Kenneth Jonassen', founded: 1930, description: 'A strong European badminton nation with Olympic medal winners.' },
];

const players = [
  { name: 'Virat Kohli', sport: 'Cricket', country: 'India', team: 'India', position: 'Batter', age: 37, jerseyNumber: 18, biography: 'One of the greatest run-scorers in modern cricket, known for his chasing ability and fitness.', statistics: 'Tests: 123 matches, 9230 runs\nODIs: 295 matches, 13906 runs\nT20Is: 125 matches, 4188 runs' },
  { name: 'Jasprit Bumrah', sport: 'Cricket', country: 'India', team: 'India', position: 'Fast Bowler', age: 32, jerseyNumber: 93, biography: 'A fast bowler with a unique action and deadly yorkers across all formats.', statistics: 'Tests: 47 matches, 205 wickets\nODIs: 89 matches, 149 wickets\nT20Is: 75 matches, 96 wickets' },
  { name: 'Pat Cummins', sport: 'Cricket', country: 'Australia', team: 'Australia', position: 'Fast Bowler / Captain', age: 33, jerseyNumber: 30, biography: 'Australia\'s captain and the leader of its fast bowling attack.', statistics: 'Tests: 70 matches, 295 wickets\nODIs: 90 matches, 144 wickets' },
  { name: 'Joe Root', sport: 'Cricket', country: 'England', team: 'England', position: 'Batter', age: 35, jerseyNumber: 66, biography: 'England\'s all-time leading Test run-scorer with a classical technique.', statistics: 'Tests: 150+ matches, 12,900+ runs\nODIs: 171 matches, 6,700+ runs' },
  { name: 'Jude Bellingham', sport: 'Football', country: 'England', team: 'Real Madrid', position: 'Midfielder', age: 23, jerseyNumber: 5, biography: 'A complete attacking midfielder who joined Real Madrid in 2023 and won La Liga and the Champions League in his first two seasons.', statistics: 'Club goals: 40+\nLa Liga titles: 1\nChampions League titles: 1' },
  { name: 'Kylian Mbappe', sport: 'Football', country: 'France', team: 'Real Madrid', position: 'Forward', age: 27, jerseyNumber: 10, biography: 'A rapid and clinical forward, World Cup winner with France in 2018.', statistics: 'International goals: 48+\nWorld Cup goals: 12' },
  { name: 'Lamine Yamal', sport: 'Football', country: 'Spain', team: 'FC Barcelona', position: 'Winger', age: 19, jerseyNumber: 19, biography: 'A teenage winger who broke through at Barcelona and starred for Spain at Euro 2024.', statistics: 'Euro 2024 winner\nYoungest scorer in Euro history' },
  { name: 'Erling Haaland', sport: 'Football', country: 'Norway', team: 'Manchester City', position: 'Striker', age: 26, jerseyNumber: 9, biography: 'A prolific striker who broke the Premier League single-season scoring record in 2022-23.', statistics: 'Premier League goals: 90+\nPremier League titles: 3' },
  { name: 'LeBron James', sport: 'Basketball', country: 'USA', team: 'Los Angeles Lakers', position: 'Forward', age: 41, jerseyNumber: 23, biography: 'The NBA\'s all-time leading scorer and a four-time champion.', statistics: 'Points: 42,000+\nChampionships: 4\nMVPs: 4' },
  { name: 'Stephen Curry', sport: 'Basketball', country: 'USA', team: 'Golden State Warriors', position: 'Point Guard', age: 38, jerseyNumber: 30, biography: 'Widely regarded as the greatest shooter in basketball history.', statistics: 'Three-pointers: 4,000+\nChampionships: 4\nMVPs: 2' },
  { name: 'Jayson Tatum', sport: 'Basketball', country: 'USA', team: 'Boston Celtics', position: 'Forward', age: 28, jerseyNumber: 0, biography: 'A multi-time All-Star who led Boston to the 2024 NBA title.', statistics: 'Championships: 1\nAll-Star selections: 5' },
  { name: 'Novak Djokovic', sport: 'Tennis', country: 'Serbia', team: 'Team Serbia', position: 'Singles', age: 39, jerseyNumber: 1, biography: 'A record 24-time Grand Slam singles champion.', statistics: 'Grand Slams: 24\nWeeks at No. 1: 400+' },
  { name: 'Carlos Alcaraz', sport: 'Tennis', country: 'Spain', team: 'Team Spain', position: 'Singles', age: 23, jerseyNumber: 2, biography: 'A multi-surface champion and one of the youngest Grand Slam winners in the Open era.', statistics: 'Grand Slams: 5+\nFormer world No. 1' },
  { name: 'Jannik Sinner', sport: 'Tennis', country: 'Italy', team: 'Team Italy', position: 'Singles', age: 25, jerseyNumber: 3, biography: 'Italy\'s first men\'s Australian Open champion and a world No. 1.', statistics: 'Grand Slams: 4\nFormer world No. 1' },
  { name: 'Harmanpreet Singh', sport: 'Hockey', country: 'India', team: 'India Hockey', position: 'Defender / Captain', age: 30, jerseyNumber: 3, biography: 'India\'s captain and one of the world\'s best drag-flickers.', statistics: 'Olympic bronze medals: 2\nGoals at Paris 2024: 10' },
  { name: 'Thierry Brinkman', sport: 'Hockey', country: 'Netherlands', team: 'Netherlands Hockey', position: 'Forward', age: 30, jerseyNumber: 11, biography: 'A creative Dutch forward and Olympic medallist.', statistics: 'Olympic medals: 2' },
  { name: 'PV Sindhu', sport: 'Badminton', country: 'India', team: 'Team India Badminton', position: 'Singles', age: 31, jerseyNumber: 1, biography: 'Two-time Olympic medallist and the first Indian world champion in badminton.', statistics: 'Olympic medals: 2\nWorld Championship gold: 1' },
  { name: 'Viktor Axelsen', sport: 'Badminton', country: 'Denmark', team: 'Team Denmark Badminton', position: 'Singles', age: 32, jerseyNumber: 1, biography: 'Olympic champion and former world No. 1 in men\'s singles.', statistics: 'Olympic gold medals: 2\nWorld titles: 2' },
];

const matches = [
  // The example from the brief
  { sport: 'Cricket', tournament: 'ICC Champions Trophy', team1: 'India', team2: 'Australia', date: new Date(Date.UTC(2026, 9, 10)), time: '19:30', venue: 'Wankhede Stadium, Mumbai', status: 'Upcoming' },
  { sport: 'Cricket', tournament: 'The Ashes Warm-up', team1: 'England', team2: 'Australia', date: day(3), time: '15:00', venue: 'Lord\'s, London', status: 'Upcoming' },
  { sport: 'Football', tournament: 'La Liga', team1: 'Real Madrid', team2: 'FC Barcelona', date: day(5), time: '21:00', venue: 'Santiago Bernabeu, Madrid', status: 'Upcoming' },
  { sport: 'Football', tournament: 'Premier League', team1: 'Manchester City', team2: 'Real Madrid', date: day(9), time: '20:00', venue: 'Etihad Stadium, Manchester', status: 'Upcoming' },
  { sport: 'Basketball', tournament: 'NBA Regular Season', team1: 'Los Angeles Lakers', team2: 'Boston Celtics', date: day(7), time: '20:30', venue: 'Crypto.com Arena, Los Angeles', status: 'Upcoming' },
  { sport: 'Tennis', tournament: 'Davis Cup Finals', team1: 'Team Spain', team2: 'Team Italy', date: day(12), time: '14:00', venue: 'Bologna, Italy', status: 'Upcoming' },
  { sport: 'Hockey', tournament: 'FIH Pro League', team1: 'India Hockey', team2: 'Netherlands Hockey', date: day(6), time: '18:00', venue: 'Major Dhyan Chand Stadium, Delhi', status: 'Upcoming' },
  { sport: 'Badminton', tournament: 'BWF World Tour Finals', team1: 'Team India Badminton', team2: 'Team China Badminton', date: day(15), time: '17:00', venue: 'Hangzhou, China', status: 'Upcoming' },
  // Live now
  { sport: 'Basketball', tournament: 'NBA Regular Season', team1: 'Golden State Warriors', team2: 'Los Angeles Lakers', date: day(0), time: '19:00', venue: 'Chase Center, San Francisco', status: 'Live', team1Score: '88', team2Score: '85' },
  { sport: 'Football', tournament: 'La Liga', team1: 'FC Barcelona', team2: 'Real Madrid', date: day(0), time: '18:30', venue: 'Camp Nou, Barcelona', status: 'Live', team1Score: '1', team2Score: '1' },
  // Completed
  { sport: 'Cricket', tournament: 'Bilateral ODI Series', team1: 'India', team2: 'England', date: day(-3), time: '14:00', venue: 'Eden Gardens, Kolkata', status: 'Completed', team1Score: '312/6 (50)', team2Score: '287 (47.2)' },
  { sport: 'Football', tournament: 'Premier League', team1: 'Manchester City', team2: 'FC Barcelona', date: day(-4), time: '20:00', venue: 'Etihad Stadium, Manchester', status: 'Completed', team1Score: '3', team2Score: '2' },
  { sport: 'Tennis', tournament: 'ATP Finals', team1: 'Team Serbia', team2: 'Team Spain', date: day(-6), time: '16:00', venue: 'Turin, Italy', status: 'Completed', team1Score: '2', team2Score: '1' },
  { sport: 'Hockey', tournament: 'FIH Pro League', team1: 'Germany Hockey', team2: 'India Hockey', date: day(-8), time: '17:30', venue: 'Cologne, Germany', status: 'Completed', team1Score: '2', team2Score: '3' },
  { sport: 'Badminton', tournament: 'Thomas Cup', team1: 'Team Denmark Badminton', team2: 'Team India Badminton', date: day(-10), time: '13:00', venue: 'Copenhagen, Denmark', status: 'Completed', team1Score: '2', team2Score: '3' },
  { sport: 'Basketball', tournament: 'NBA Regular Season', team1: 'Boston Celtics', team2: 'Golden State Warriors', date: day(-2), time: '19:30', venue: 'TD Garden, Boston', status: 'Completed', team1Score: '112', team2Score: '104' },
];

const articles = [
  { title: 'India name squad for Champions Trophy opener against Australia', description: 'The selectors have kept faith with the core group as India prepare for a blockbuster start in Mumbai.', content: 'India have announced a 15-member squad for the Champions Trophy opener against Australia at the Wankhede Stadium.\n\nThe selectors have retained the batting core and added a third seamer to the group, citing the pace-friendly conditions expected in the evening.\n\nAustralia, meanwhile, are expected to announce their lineup closer to the match once the pitch report is available.', category: 'Cricket', author: 'Rahul Menon', publishedAt: day(-1) },
  { title: 'El Clasico preview: Madrid and Barcelona set for another thriller', description: 'Two sides separated by a single point meet at the Bernabeu with the league lead on the line.', content: 'Real Madrid host FC Barcelona this weekend in a match that could decide the early direction of the title race.\n\nBoth managers have confirmed that their key attackers are fit, which promises an open and attacking contest.\n\nBarcelona\'s young wingers will test Madrid\'s defence, while the hosts will look to their midfield to control the tempo.', category: 'Football', author: 'Elena Torres', publishedAt: day(-2) },
  { title: 'Warriors edge Celtics in a late-game shooting display', description: 'A fourth-quarter run powered by three-pointers decided a close contest in Boston.', content: 'Golden State and Boston traded leads for most of the night before the Celtics pulled ahead in the final minutes.\n\nBoston\'s defence forced several late turnovers, which turned a narrow lead into a comfortable finish.\n\nBoth teams meet again later in the season.', category: 'Basketball', author: 'Marcus Reed', publishedAt: day(-2) },
  { title: 'Davis Cup Finals: Spain and Italy confirm lineups', description: 'Both captains have named their singles players for the quarter-final tie in Bologna.', content: 'The Davis Cup Finals quarter-final between Spain and Italy will be played on an indoor hard court in Bologna.\n\nItaly will rely on home support, while Spain have named their strongest available singles pair.\n\nThe tie begins with the first singles rubber at 2 PM local time.', category: 'Tennis', author: 'Giulia Ferri', publishedAt: day(-3) },
  { title: 'Indian hockey team beats Germany in thrilling Pro League match', description: 'A late penalty corner secured the win for India in Cologne.', content: 'India edged Germany 3-2 in Cologne thanks to a decisive penalty corner conversion in the final quarter.\n\nThe captain scored twice from set pieces, and the defence held firm in the closing minutes.\n\nIndia now sit near the top of the Pro League table.', category: 'Hockey', author: 'Anita Sharma', publishedAt: day(-4) },
  { title: 'Thomas Cup: India beat Denmark 3-2 in a nail-biting tie', description: 'The decisive doubles rubber went the distance before India sealed the tie.', content: 'India defeated Denmark 3-2 in a Thomas Cup tie that was decided by the final doubles match.\n\nThe Indian pair saved two match points in the second game before closing out the decider.\n\nThe win sends India into the knockout stage.', category: 'Badminton', author: 'Kiran Rao', publishedAt: day(-5) },
  { title: 'Youth sports programme launches in 200 schools', description: 'A new initiative aims to give students access to coaching in six major sports.', content: 'A national youth sports programme has launched across 200 schools, offering coaching in cricket, football, basketball, tennis, hockey and badminton.\n\nQualified coaches will run weekly sessions and talent-spotting camps during the season.\n\nOrganisers hope to double the number of schools within two years.', category: 'General', author: 'Staff Reporter', publishedAt: day(-6) },
  { title: 'England name youthful squad for Ashes warm-up', description: 'Several uncapped players have been included as England look to build depth.', content: 'England have named a youthful squad for the warm-up match against Australia at Lord\'s.\n\nThe selectors said the match is an opportunity to test depth ahead of the main series.\n\nAustralia are expected to field a near full-strength side.', category: 'Cricket', author: 'James Whitfield', publishedAt: day(-7) },
];

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Match.deleteMany({}), Team.deleteMany({}), Player.deleteMany({}), News.deleteMany({})]);

  await User.create([
    { name: 'Portal Admin', email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: 'admin' },
    { name: 'Demo User', email: 'user@sportsportal.com', password: await bcrypt.hash('User@123', 10), role: 'user' },
  ]);
  await Team.insertMany(teams);
  await Player.insertMany(players);
  await Match.insertMany(matches);
  await News.insertMany(articles);

  console.log(`Seeded: ${teams.length} teams, ${players.length} players, ${matches.length} matches, ${articles.length} news articles, 2 users`);
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('User login:  user@sportsportal.com / User@123');
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
