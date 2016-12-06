import { Strings } from "./str/en";

// This is probably not a best practice but I can't get the correct syntax to work properly
declare function require(name:string);
const sprintf = require("sprintf-js").sprintf;

export enum Trigger {
	FriendRequest = 1,
	Manual = 2
}

interface triggerOptions {
	ignoredUsers: string[];
	secondService: string; // i.e: "My Awesome Website"
}

interface constructorOptions {
	steamClient;
	steamUser;
	steamFriends;
	trigger: Trigger;
	triggerOptions: triggerOptions;
	codeLength: number;
}

interface verification {
	user;
	code: string;
}

export class Verificator {
	public pendingVerifications: verification[] = [];
	public ignoredUsers: string[];

	private steamClient;
	private steamUser;
	private steamFriends;
	private secondService: string;
	private codeLength: number;

	constructor(options: constructorOptions) {
		this.steamClient = options.steamClient;
		this.steamUser = options.steamUser;
		this.steamFriends = options.steamFriends;
		this.codeLength = options.codeLength || 10;
		this.ignoredUsers = options.triggerOptions.ignoredUsers || [];
		this.secondService = options.triggerOptions.secondService || "";

		switch (options.trigger) {
			case Trigger.FriendRequest:
				this.initFriendRequestTrigger();
				break;
		}
	}

	/**
	 * Verifies the validity of a code.
	 * Returns the user's Steam ID if it's valid, or null if it isn't.
	 * @param code The issued code.
	 * @return {string|null} The user's steam ID or null.
	 */
	public verify(code: string): string {
		let i = this.pendingVerifications.map(e => { return e.code }).indexOf(code);

		if (i !== -1) {
			let user = this.pendingVerifications[i].user;
			this.pendingVerifications.splice(i, 1);
			return user;
		} else {
			return null;
		}
	}

	public trigger(user): string {
		let code = this.generateCode();

		// Delete previous pendingVerification, if it exists.
		// This happens if the user requested a code but never sent it back.
		let i = this.pendingVerifications.map(e => { return e.user }).indexOf(user);
		if (i !== -1) {
			this.pendingVerifications.splice(i, 1);
		}

		this.pendingVerifications.push({
			user: user,
			code: code
		});

		return code;
	}

	private initFriendRequestTrigger(): void {
		this.steamFriends.on("friend", (userID, EFriendRelationship) => {
			if (EFriendRelationship === 2) { // Steam.EFriendRelationship.RequestRecipient = 2
				// Got a friend request, accept it if the user is not ignored
				if (this.ignoredUsers.indexOf(userID) === -1) {
					this.steamFriends.addFriend(userID);
					console.log("[STEAM] Added user " + userID + " to friends");

					let code = this.trigger(userID);
					this.steamFriends.sendMessage(
						userID,
						sprintf(Strings.Greeting, this.secondService)
					);
					this.steamFriends.sendMessage(
						userID,
						sprintf(Strings.CodeGrant, code)
					);
					this.steamFriends.sendMessage(
						userID,
						sprintf(Strings.Farewell, this.secondService)
					);
					console.log("[STEAM] Sent the code " + code + " to " + userID);

					setTimeout(() => {
						this.steamFriends.removeFriend(userID);
						console.log("[STEAM] Removed user " + userID + " from friends");
					}, 10000);
				} else {
					console.log("[STEAM] Got a friend request from " + userID +
						", but they are ignored.");
					this.steamFriends.removeFriend(userID);
				}
			}
		});
	}

	private generateCode(): string {
		let code = "";

		// Omitted characters that can look like others
		let possibleChars = ["B", "D", "E", "F", "G", "H", "C", "J", "K", "L", "M", "N", "P", "Q",
			"R", "S", "T", "W", "X", "Y","Z", "2", "3", "5", "6", "7", "8", "9"];

		for (let i = 0; i < this.codeLength; i++) {
			code += possibleChars[
				Math.floor(Math.random() * possibleChars.length)
			];
		}

		return code;
	}
}
