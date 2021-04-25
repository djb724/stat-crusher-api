let similarItemMap = {
  figyberry: "fiwamberry",
  iapapaberry: "fiwamberry",
  wikiberry: "fiwamberry",
  aguavberry: "fiwamberry",
  magoberry: "fiwamberry",
  roseincense: "miracleseed",
  powerweight: "machobrace",
  powerbracer: "machobrace",
  powerbelt: "machobrace",
  powerlens: "machobrace",
  powerband: "machobrace",
  poweranklet: "machobrace",
  waveincense: "mysticwater",
  seaincense: "mysticwater",
  fullincense: "laggingtail",
  laxincense: "brightpowder",
  oddincense: "twistedspoon",
  rockincense: "hardstone",
}

let uselessItems = [
  'beastball', 'berrysweet', 'blukberry', 'bottlecap', 'cherishball',
  'cloversweet', 'dawnstone', 'diveball', 'dragonscale', 'dreamball',
  'dubiousdisc', 'duskball', 'duskstone', 'electrizer', 'energypowder',
  'fastball', 'firestone', 'flowersweet', 'fossilizedbird', 'fossilizeddino',
  'fossilizeddrake', 'fossilizedfish', 'friendball', 'galaricacuff', 'goldbottlecap',
  'greatball', 'healball', 'heavyball', 'hondewberry', 'icestone', 
  'leafstone', 'levelball', 'loveball', 'lovesweet', 'lureball',
  'luxuryball', 'magmarizer', 'masterball', 'moonball', 'moonstone',
  'nestball', 'netball', 'ovalstone', 'parkball', 'pinapberry',
  'pokeball', 'pomegberry', 'premierball', 'prismscale', 'protector',
  'qualotberry', 'quickball', 'rarebone', 'reapercloth', 'repeatball',
  'ribbonsweet', 'sachet', 'safariball', 'shinystone', 'sportball',
  'starsweet', 'strawberrysweet', 'sunstone', 'sweetapple', 'tamatoberry',
  'tartapple', 'thunderstone', 'timerball', 'ultraball', 'upgrade',
  'waterstone', 'whippeddream'
]

for (let i = 0; i < 100; i++) {
  uselessItems.push('tr' + i.toString().padStart(2, '0'));
}

for (let item of uselessItems) {
  similarItemMap[item] = "uselessitem";
}

module.exports = similarItemMap;
