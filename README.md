# steam-verificator
> A module to verify Steam accounts

This module, in conjunction with [node-steam](https://github.com/seishun/node-steam) allows you
to verify a Steam account for further usage on an external service. The procedure is simple:

* The user adds the Steam bot.
* The Steam bot sends the user a code.
* The user enters that code on the external service.
* The user's Steam account is verified.

This only makes sense on a service where a web interface is not a possibility, as using OAuth
would be a better method. Because of that, and because this code is messy and lacks better
documentation, I won't publish this module to the npm registry; though I might at some point.

## Installation

```sh
$ npm install --save git+https://github.com/MeLlamoPablo/steam-verificator.git
```

## Usage

```js
const steamVerificator = require("steam-verificator");

let verificator = new steamVerificator.Verificator({
	trigger: steamVerificator.Trigger.FriendRequest,
	triggerOptions: {
		secondService: "My App"
	},
	steamClient: steamClient,
	steamUser: steamUser,
	steamFriends: steamFriends
});

// Because the Verificator is using Trigger.FriendRequest, whenever an user adds the bot,
// it will send back the code to them. After the user passes back the code:

function onUserCodeEnter(userSteamID, code) {
	let result = verificator.verify({
		user: userSteamID,
		code: code
	});
	
	switch (result) {
		case steamVerificator.VerificationResult.Valid:
			// The steam account is verified.
			break;
		case steamVerificator.VerificationResult.CodeIncorrect:
			// The user was sent a code, but the code entered by them is not correct.
			break;
		case steamVerificator.VerificationResult.CodeNotIssued:
			// The user was never sent a code.
			break;
	}
}
```

See `example.js` for a full example file.

### Options

Here's a full list of the options accepted by the constructor:

* `steamClient`, `steamUser` and `steamFriends` are defined by
[node-steam](https://github.com/seishun/node-steam).
* `trigger`: either `steamVerificator.Trigger.FriendRequest` (the bot sends the code when the
user adds it to their friend list) or `steamVerificator.Trigger.Manual` (you need to run
`Verificator.trigger(user)`, where `user` is the user's Steam ID).
* `triggerOptions`
	* `secondService`: the name of the external service.
	* `ignoredUsers`: an array of steam ids that the bot will ignore upon friend request.
* `codeLength`: the length of the code. Default is 10.

## License

Apache-2.0 © [Pablo Rodríguez](https://github.com/MeLlamoPablo)
