/*

*/
const sendHelp = (message) => {
	message.channel.send(`= How to use ${message.settings.prefix}damage = \nYou can calculate damage using the following format:\n\n${message.settings.prefix}damage [parameters] :: Where parameters can be any of the following: \n\n[num]d :: [num] damage (ex. 30d)\n[num]p :: [num] piercing damage (ex. 20p)\n[num]f :: [num] affliction damage (ex. 15f)\n[num]dr :: [num] damage reduction (ex. 15dr)\n[num]drp :: [num] PERCENT damage reduction (ex. 25drp)\n[num]dd :: [num] destructible defense (ex. 40dd)\n[num]hp :: [num] hit points (ex. 100hp)\n\n${message.settings.prefix}damage 20d 30d 10f 15dr 80hp :: Calculates the damage done on an 80HP enemy with 15 damage reduction who has been dealt 20 normal damage, 30 normal damage, and 10 affliction damage`, {code: "asciidoc"});
};

/*
 * Process damage array
 * params: Array of different damages and resistances all in the format <Number><type> where type:
 *  d: normal damage (multiple)
 *  p: piercing damage (multiple)
 *  f: affliction damage (multiple)
 *  dr: constant damage reduction (multiple)
 *  drp: percentage damage reduction (multiple)
 *  dd: destructible defense (multiple)
 *  hp: hit points of target (single)
 * Returns object
 */
const processDamage = (params) => {
	let output = {
		dd: 0,
		dr: 0,
		drp: 1,
		d: [],
		p: [],
		f: []
	};

	//Get HP if any
	let hp_index = params.findIndex(item => /^[0-9]+hp$/.test(item));
	if(hp_index != -1){
		output.hp = parseInt(params.splice(hp_index, 1)[0].match(/^[0-9]+/)[0]);
	}

	//Get DD if any
	params.forEach((item)=>{
		if(/^[0-9]+dd$/.test(item)){
			output.dd += parseInt(item.match(/^[0-9]+/)[0]);
		}
	});

	//Get DR if any
	params.forEach((item)=>{
		if(/^[0-9]+dr$/.test(item)){
			output.dr += parseInt(item.match(/^[0-9]+/)[0]);
		}
	});

	//Get DRP if any
	params.forEach((item)=>{
		if(/^[0-9]+drp$/.test(item)){
			output.drp *= (100-parseInt(item.match(/^[0-9]+/)[0]))/100;
		}
	});

	//Get D if any
	params.forEach((item)=>{
		if(/^[0-9]+d$/.test(item)){
			output.d.push(parseInt(item.match(/^[0-9]+/)[0]));
		}
	});

	//Get P if any
	params.forEach((item)=>{
		if(/^[0-9]+p$/.test(item)){
			output.p.push(parseInt(item.match(/^[0-9]+/)[0]));
		}
	});

	//Get F if any
	params.forEach((item)=>{
		if(/^[0-9]+f$/.test(item)){
			output.f.push(parseInt(item.match(/^[0-9]+/)[0]));
		}
	});

	return output;
};

const calculateDamage = (params) => {
	let numbers = processDamage(params);
	let output = {
		remaining_hp: numbers.hp?numbers.hp:100,
		hp_damage: 0,
		remaining_dd: numbers.dd?numbers.dd:0,
		dd_damage: 0
	}

	//Deal affliction damage
	numbers.f.forEach((damage) => {
		output.hp_damage += damage;
	});

	//Deal piercing damage
	numbers.p.forEach((damage) => {
		if(output.remaining_dd > 0 && output.remaining_dd >= damage){
			output.remaining_dd -= damage;
			output.dd_damage += damage;
		}
		else if(output.remaining_dd > 0 && output.remaining_dd < damage){
			output.hp_damage += damage - output.remaining_dd;
			output.dd_damage += output.remaining_dd;
			output.remaining_dd = 0;
		}
		else{
			output.hp_damage += damage;
		}
	});

	//Deal normal damage
	numbers.d.forEach((damage) => {
		let calcDamage = damage*numbers.drp;

		//Damage reduction
		if(numbers.dr >= calcDamage){
			numbers.dr -= calcDamage;
			calcDamage = 0;
		}
		else if(numbers.dr>0 && calcDamage > numbers.dr){
			calcDamage -= numbers.dr;
			numbers.dr = 0;
		}

		if(output.remaining_dd > 0 && output.remaining_dd >= calcDamage){
			output.remaining_dd -= calcDamage;
			output.dd_damage += calcDamage;
		}
		else if(output.remaining_dd > 0 && calcDamage > output.remaining_dd){
			output.hp_damage += calcDamage - output.remaining_dd;
			output.dd_damage += output.remaining_dd;
			output.remaining_dd = 0;
		}
		else{
			output.hp_damage += calcDamage;
		}
	});

	output.remaining_hp -= output.hp_damage;
	if(output.remaining_hp < 0) output.remaining_hp = 0;

	return output;
}

exports.run = (client, message, args, level) => {
  // If the wrong command is called, show correct format
  if (args.length === 0) {
    sendHelp(message);
  }
  else {
		let calculations = calculateDamage(args);

	  message.channel.send(`= Damage calculations =\n\nRemaining HP :: ${calculations.remaining_hp}\nHP Damage :: ${calculations.hp_damage}\nRemaining DD :: ${calculations.remaining_dd}\nDD Damage :: ${calculations.dd_damage}`, {code: "asciidoc"});
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["d", "dmg"],
  permLevel: "User"
};

exports.help = {
  name: "damage",
  category: "Naruto-Arena",
  description: "Gives you the damage you'll deal given your attacks and damage types against enemy resistances and HP",
  usage: "damage 0110 3"
};
