/*

*/

//Precalculated factorial, first 20 - https://www.wolframalpha.com/input/?i=%281...20%29%21
const f = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000];

const sendHelp = (message) => {
	message.channel.send(`= How to use ${message.settings.prefix}chakra = \nYou can predict chakra using the following format:\n\n${message.settings.prefix}chakra 1010 3 :: Probability that you will get at least one Taijutsu and one Ninjutsu chakra from a pool of 3 chakra\n${message.settings.prefix}chakra 0200 5 :: Probability that you will get at least 2 Bloodline chakra from a pool of 5 chakra`, {code: "asciidoc"});
};

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

//Assumed n=4 (4 chakra types/buckets)
// Returns a number from 0-1
const chances = (k_total, k_select) => {
	if(k_select > k_total){
		return 0;
	}
	else{
		let outputCount = Math.pow(4,k_total);
		let solutionCount = 0;

		return solutionCount/outputCount;
	}
};

exports.run = (client, message, args, level) => {
  // If the wrong command is called, show correct format
  if (!args[0] || args.length !==2 || args[0].length !==4) {
    sendHelp(message);
  }
  else {
		let chakraSelected = 0;
		let chakraTotal = parseInt(args[1]);

		//Check if args[1] is a valid number
		if(isNaN(chakraTotal)){
			sendHelp(message);
			return false;
		}
		else if(chakraTotal>20){
			message.channel.send(`Cannot calculate probability for chakra totals above 20.`, {code: "asciidoc"});
			return false;
		}

		for(let i=0;i<4;i++){
			let num = parseInt(args[0][i]);
			if(!isNaN(num)){
				chakraSelected += num;
			}
			//If one char is not a valid number, fail
			else{
				sendHelp(message);
				return false;
			}
		}

	  message.channel.send(`The probability of getting ${args[0]} from ${args[1]} chakra is ${chances(chakraTotal, chakraSelected)*100}%.`, {code: "asciidoc"});
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
