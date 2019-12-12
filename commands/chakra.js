/*

*/
const SIMULATION_SIZE = 10000;

//Precalculated factorial, first 20 - https://www.wolframalpha.com/input/?i=%281...20%29%21
const f = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000];
const factorial = (num) => {
	if(num < 0){
		return false;
	}
	else if(num === 0){
		return 1;
	}
	else if(num <= f.length){
		return f[num];
	}
	else{
		return num*factorial(num-1);
	}
};

const sendHelp = (message) => {
	message.channel.send(`= How to use ${message.settings.prefix}chakra = \nYou can predict chakra using the following format:\n\n${message.settings.prefix}chakra 1010 3 :: Probability that you will get at least one Taijutsu and one Ninjutsu chakra from a pool of 3 chakra\n${message.settings.prefix}chakra 0200 5 :: Probability that you will get at least 2 Bloodline chakra from a pool of 5 chakra`, {code: "asciidoc"});
};

/*
 * Calculation for chakra probability is done a posteriori, with a simulation size of SIMULATION_SIZE
 * chakraSearch: Array of length 4 containing numbers from 0-9
 * chakraGenerated: Number
 */

const chances = (chakraSearch, chakraGenerated) => {
	let success = 0;
	//Simulate chakra
	for(let i=0;i<SIMULATION_SIZE;i++){
		let chakraSample = [0,0,0,0];
		for(let j=0;j<chakraGenerated;j++){
			chakraSample[Math.floor(Math.random()*4)]++;
		}

		//Check if chakraSample meets chakraSearch
		if(chakraSample[0] >= chakraSearch[0] &&
			chakraSample[1] >= chakraSearch[1] &&
			chakraSample[2] >= chakraSearch[2] &&
			chakraSample[3] >= chakraSearch[3]){
			success++;
		}
	}
	return success/SIMULATION_SIZE;
};

exports.run = (client, message, args, level) => {
  // If the wrong command is called, show correct format
  if (!args[0] || args.length !==2 || args[0].length !==4) {
    sendHelp(message);
  }
  else {
		let chakraTotal = parseInt(args[1]);
		let chakraSplitString = [];

		//Check if args[1] is a valid number
		if(isNaN(chakraTotal)){
			sendHelp(message);
			return false;
		}

		for(let i=0;i<4;i++){
			let num = parseInt(args[0][i]);
			//If even one char is not a valid number, fail
			if(isNaN(num)){
				sendHelp(message);
				return false;
			}
			else{
				chakraSplitString.push(num);
			}
		}

	  message.channel.send(`The estimated probability of getting ${args[0]} from ${args[1]} chakra is ${Math.round(chances(args[0], chakraTotal)*10000)/100}%.`, {code: "asciidoc"});
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["c", "chak"],
  permLevel: "User"
};

exports.help = {
  name: "chakra",
  category: "Naruto-Arena",
  description: "Gives you the chance that the chakra is obtained given a number of generated chakra",
  usage: "chakra 0110 3"
};
