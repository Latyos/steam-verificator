"use strict";

const Steam            = require("steam")
	, fs               = require("fs")
	, crypto           = require("crypto")
	, steamVerificator = require("./dist/index"); // Replace this with steam-verificator

let steamClient = new Steam.SteamClient();
let steamUser = new Steam.SteamUser(steamClient);
let steamFriends = new Steam.SteamFriends(steamClient);
let verificator;
steamClient.connect();

let logOnDetails = {
	// Either set the env variables by yourself or replace the following lines:
	"account_name": process.env.STEAM_USERNAME,
	"password": process.env.STEAM_PASSWORD
};

if (process.argv[2]) {
	// If an argument is passed to the script, treat that as the steam guard code.
	logOnDetails.auth_code = process.argv[2];
}

// The sentry file allows us to log in without a steam guard code.
// Thus, we only need the steam guard code to generate it the first time.
try {
	let sentry = fs.readFileSync("sentry");
	if (sentry.length) logOnDetails.sha_sentryfile = sentry;
} catch (e){
	console.log("Cannot load the sentry file. " + e);
}

steamClient.on("connected", () => {
	steamUser.logOn(logOnDetails);
});

steamClient.on("logOnResponse", response => {
	if (response.eresult == Steam.EResult.OK) {
		console.log("Logged in!");
		steamFriends.setPersonaState(Steam.EPersonaState.Online);
		steamFriends.setPersonaName("TestBot");

		verificator = new steamVerificator.Verificator({
			trigger: steamVerificator.Trigger.FriendRequest,
			triggerOptions: {
				secondService: "My Service",
			},
			steamClient: steamClient,
			steamUser: steamUser,
			steamFriends: steamFriends
		});
	}
});

steamClient.on("error", console.error);

steamUser.on('updateMachineAuth', function(sentry, callback) {
	let hashedSentry = crypto.createHash('sha1').update(sentry.bytes).digest();
	fs.writeFileSync('sentry', hashedSentry);
	console.log("sentry file saved");

	callback({ sha_file: hashedSentry});
});
